/**
 * YouTube 영상 자막(transcript) 가져오기
 *
 * YouTube Data API 미사용 → 쿼터 소모 없음
 * 방식: CORS 프록시 → YouTube 페이지 → captionTracks URL → 자막 JSON → 0~30초 필터
 *
 * 한계:
 *  - 자막이 없는 영상은 noCaption: true 반환
 *  - CORS 프록시 상황에 따라 실패할 수 있음
 *  - 자동 생성 자막(ASR) 포함
 */

import axios from 'axios'

const CORS_PROXY = 'https://corsproxy.io/?'

// 캡션 트랙 배열 추출 (ytInitialPlayerResponse 전체 파싱 대신 captionTracks 배열만 찾음)
function extractCaptionTracks(html) {
  const idx = html.indexOf('"captionTracks"')
  if (idx === -1) return null

  const arrStart = html.indexOf('[', idx)
  if (arrStart === -1) return null

  let depth = 0
  const limit = Math.min(arrStart + 100000, html.length)
  for (let i = arrStart; i < limit; i++) {
    if (html[i] === '[') depth++
    else if (html[i] === ']') {
      depth--
      if (depth === 0) {
        try { return JSON.parse(html.substring(arrStart, i + 1)) }
        catch { return null }
      }
    }
  }
  return null
}

// json3 형식 자막 이벤트를 텍스트 줄 배열로 변환
function parseJson3(data) {
  return (data.events || [])
    .filter(e => e.segs && e.segs.length > 0)
    .map(e => ({
      startMs: e.tStartMs || 0,
      text: e.segs.map(s => s.utf8 || '').join('').replace(/\n/g, ' ').trim(),
    }))
    .filter(e => e.text && e.text !== '\n' && e.text !== ' ')
}

/**
 * @param {string} videoId
 * @param {number} maxSeconds  - 가져올 초 수 (기본 30)
 * @returns {{ transcript: string|null, lang: string, noCaption: boolean }}
 */
export async function fetchTranscript(videoId, maxSeconds = 30) {
  // 1. YouTube watch 페이지 가져오기 (CORS 프록시 경유)
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const pageRes = await axios.get(
    CORS_PROXY + encodeURIComponent(watchUrl),
    { timeout: 15000, headers: { 'X-Requested-With': 'XMLHttpRequest' } }
  )
  const html = typeof pageRes.data === 'string' ? pageRes.data : JSON.stringify(pageRes.data)

  // 2. captionTracks 배열 추출
  const tracks = extractCaptionTracks(html)
  if (!tracks || tracks.length === 0) {
    return { transcript: null, lang: '', noCaption: true }
  }

  // 3. 언어 선택: 한국어 > 자동생성(asr) > 첫 번째 트랙
  const track =
    tracks.find(t => t.languageCode === 'ko' && t.kind !== 'asr') ||
    tracks.find(t => t.languageCode === 'ko') ||
    tracks.find(t => t.kind === 'asr') ||
    tracks[0]

  const langName = track.name?.simpleText || track.languageCode || ''
  const isAsr = track.kind === 'asr'

  // 4. 자막 데이터 가져오기 (json3 형식 요청)
  const captionUrl = track.baseUrl.includes('fmt=')
    ? track.baseUrl.replace(/fmt=[^&]+/, 'fmt=json3')
    : track.baseUrl + '&fmt=json3'

  const captionRes = await axios.get(
    CORS_PROXY + encodeURIComponent(captionUrl),
    { timeout: 10000 }
  )

  // 5. 0 ~ maxSeconds 구간 텍스트만 추출
  const lines = parseJson3(captionRes.data)
    .filter(e => e.startMs < maxSeconds * 1000)

  if (lines.length === 0) {
    return { transcript: null, lang: track.languageCode, langName, isAsr, noCaption: false, empty: true }
  }

  return {
    transcript: lines.map(e => e.text).join(' '),
    lang: track.languageCode,
    langName,
    isAsr,
    noCaption: false,
    empty: false,
  }
}
