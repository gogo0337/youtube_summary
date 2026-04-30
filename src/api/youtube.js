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
    const channelStats = channelMap[item.snippet.channelId]?.statistics || {}
    const publishedAt = item.snippet.publishedAt

    const viewCount = parseInt(stats.viewCount || 0)
    const likeCount = parseInt(stats.likeCount || 0)
    const commentCount = parseInt(stats.commentCount || 0)
    const subscriberCount = parseInt(channelStats.subscriberCount || 0)
    const videoCount = parseInt(channelStats.videoCount || 0)

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
      isShorts: isShortVideo(duration),
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
      params: { part: 'statistics,contentDetails', id: chunk, key: API_KEY },
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

function isShortVideo(duration) {
  if (!duration) return false
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return false
  const h = parseInt(match[1] || 0)
  const m = parseInt(match[2] || 0)
  const s = parseInt(match[3] || 0)
  return h * 3600 + m * 60 + s <= 60
}

/**
 * 실적도: 일별 조회율 기반 확산력 측정
 * 구독자 대비 하루 평균 몇 %의 구독자에게 도달했는지 측정
 * 오래된 영상일수록 자연 감쇠를 반영하여 공평하게 비교
 */
function calcPerformance(viewCount, subscriberCount, publishedAt) {
  if (subscriberCount === 0) return { score: 0, grade: '최하' }

  const daysSince = Math.max(1, (Date.now() - new Date(publishedAt)) / 86400000)
  const dailyViews = viewCount / daysSince
  // 구독자 대비 일평균 도달률 (%)
  const reachRate = (dailyViews / subscriberCount) * 100

  if (reachRate >= 1)    return { score: 5, grade: '최상' }
  if (reachRate >= 0.3)  return { score: 4, grade: '상' }
  if (reachRate >= 0.05) return { score: 3, grade: '중' }
  if (reachRate >= 0.01) return { score: 2, grade: '하' }
  return { score: 1, grade: '최하' }
}

/**
 * 공헌도: 가중치 참여율 기반 채널 성장 기여도 측정
 * 댓글은 좋아요보다 알고리즘 가중치가 높으므로 5배 반영
 */
function calcContribution(likeCount, commentCount, viewCount) {
  if (viewCount === 0) return { score: 0, grade: '최하' }

  const weighted = (likeCount + commentCount * 5) / viewCount * 100

  if (weighted >= 5)   return { score: 5, grade: '최상' }
  if (weighted >= 2)   return { score: 4, grade: '상' }
  if (weighted >= 0.8) return { score: 3, grade: '중' }
  if (weighted >= 0.2) return { score: 2, grade: '하' }
  return { score: 1, grade: '최하' }
}
