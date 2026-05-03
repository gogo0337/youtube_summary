import axios from 'axios'

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export async function searchVideos(query, options = {}) {
  const { publishedAfter, pages = 2 } = options

  let allItems = []
  let pageToken = undefined
  let quotaUsed = 0

  for (let i = 0; i < pages; i++) {
    const searchParams = {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 50,
      key: API_KEY,
      regionCode: 'KR',
    }
    if (publishedAfter) searchParams.publishedAfter = publishedAfter
    if (pageToken) searchParams.pageToken = pageToken

    const res = await axios.get(`${BASE_URL}/search`, { params: searchParams })
    quotaUsed += 100
    const items = res.data.items || []
    allItems = [...allItems, ...items]
    pageToken = res.data.nextPageToken
    if (!pageToken) break
  }

  if (allItems.length === 0) return { videos: [], quotaUsed }

  const uniqueItems = allItems.filter(
    (item, idx, self) => self.findIndex(t => t.id.videoId === item.id.videoId) === idx
  )

  const videoIds = uniqueItems.map(i => i.id.videoId)
  const channelIds = [...new Set(uniqueItems.map(i => i.snippet.channelId))]

  const videoBatches = Math.ceil(videoIds.length / 50)
  const channelBatches = Math.ceil(channelIds.length / 50)
  quotaUsed += videoBatches + channelBatches

  const [statsMap, channelMap] = await Promise.all([
    fetchVideoStats(videoIds),
    fetchChannelStats(channelIds),
  ])

  const videos = uniqueItems.map(item => {
    const videoId = item.id.videoId
    const stats = statsMap[videoId]?.statistics || {}
    const duration = statsMap[videoId]?.contentDetails?.duration || ''
    const categoryId = statsMap[videoId]?.snippet?.categoryId || ''
    const channelStats = channelMap[item.snippet.channelId]?.statistics || {}
    const publishedAt = item.snippet.publishedAt

    const viewCount = parseInt(stats.viewCount || 0)
    const likeCount = parseInt(stats.likeCount || 0)
    const commentCount = parseInt(stats.commentCount || 0)
    const subscriberCount = parseInt(channelStats.subscriberCount || 0)
    const videoCount = parseInt(channelStats.videoCount || 0)
    const durationSecs = parseDurationSecs(duration)

    return {
      videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url || '',
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt,
      description: item.snippet.description,
      viewCount,
      likeCount,
      commentCount,
      subscriberCount,
      videoCount,
      duration,
      durationSecs,
      categoryId,
      isShorts: durationSecs > 0 && durationSecs <= 60,
      performance: calcPerformance(viewCount, subscriberCount, publishedAt),
      contribution: calcContribution(likeCount, commentCount, viewCount),
    }
  })

  return { videos, quotaUsed }
}

async function fetchVideoStats(videoIds) {
  const map = {}
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).join(',')
    const res = await axios.get(`${BASE_URL}/videos`, {
      // snippet 추가: categoryId 획득 (쿼터 비용 동일 — 1유닛/call)
      params: { part: 'snippet,statistics,contentDetails', id: chunk, key: API_KEY },
    })
    res.data.items.forEach(v => { map[v.id] = v })
  }
  return map
}

async function fetchChannelStats(channelIds) {
  const map = {}
  for (let i = 0; i < channelIds.length; i += 50) {
    const chunk = channelIds.slice(i, i + 50).join(',')
    const res = await axios.get(`${BASE_URL}/channels`, {
      params: { part: 'statistics', id: chunk, key: API_KEY },
    })
    res.data.items.forEach(c => { map[c.id] = c })
  }
  return map
}

function parseDurationSecs(duration) {
  if (!duration) return 0
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  return parseInt(match[1] || 0) * 3600
       + parseInt(match[2] || 0) * 60
       + parseInt(match[3] || 0)
}

/**
 * 실적도: 확산력 측정
 * - 최소 기준: 조회수 1,000 이상 + 구독자 500 이상 (소형 채널 과대평가 방지)
 * - 1단계: 구독자 대비 총 조회율 (절대 확산력)
 * - 2단계: 일평균 조회율 (최신성 반영)
 * - 두 점수를 가중 평균해서 종합 판단
 */
function calcPerformance(viewCount, subscriberCount, publishedAt) {
  if (subscriberCount === 0) return { score: 0, grade: '최하' }

  // 최소 임계값: 조회수 1,000 미만은 통계적으로 의미 없음
  // 구독자 수는 제한 없음 - 소형 채널 바이럴도 정상 평가
  if (viewCount < 1000) {
    return { score: 1, grade: '최하' }
  }

  const daysSince = Math.max(1, (Date.now() - new Date(publishedAt)) / 86400000)

  // 절대 확산력: 구독자 대비 누적 조회율 (채널 전체 도달률)
  const totalReach = viewCount / subscriberCount

  // 상대 확산력: 일평균 조회 / 구독자 (최신성 보정)
  const dailyReach = (viewCount / daysSince) / subscriberCount

  // 영상 나이에 따라 두 지표 가중치 조정
  // - 30일 미만: 최신성(일평균) 중심
  // - 30~180일: 균형
  // - 180일 초과: 누적 중심
  const ageFactor = Math.min(1, daysSince / 180)
  const blended = totalReach * ageFactor + dailyReach * 30 * (1 - ageFactor)

  if (blended >= 3)    return { score: 5, grade: '최상' }
  if (blended >= 1)    return { score: 4, grade: '상' }
  if (blended >= 0.2)  return { score: 3, grade: '중' }
  if (blended >= 0.05) return { score: 2, grade: '하' }
  return { score: 1, grade: '최하' }
}

/**
 * 공헌도: 채널 성장 기여도 측정
 * - 최소 기준: 조회수 1,000 이상
 * - 좋아요: 직접 호감 신호
 * - 댓글: 알고리즘 가중치 높은 참여 (2배 반영, 5배는 과도)
 * - 참여율 = (좋아요 + 댓글×2) / 조회수 × 100
 */
function calcContribution(likeCount, commentCount, viewCount) {
  if (viewCount < 1000) return { score: 1, grade: '최하' }

  const engagement = (likeCount + commentCount * 2) / viewCount * 100

  if (engagement >= 3)   return { score: 5, grade: '최상' }
  if (engagement >= 1.5) return { score: 4, grade: '상' }
  if (engagement >= 0.5) return { score: 3, grade: '중' }
  if (engagement >= 0.1) return { score: 2, grade: '하' }
  return { score: 1, grade: '최하' }
}
