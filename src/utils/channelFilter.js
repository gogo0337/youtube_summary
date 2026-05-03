/**
 * 기업·방송 채널 판별 유틸
 *
 * 기업 채널의 특징
 *  1. 영상 수 500개 초과 → 방송사·언론사는 매일 수십 개 업로드
 *  2. 채널명에 방송사·엔터사 이름 포함
 *  3. Official / 공식 키워드
 *  4. 뉴스·엔터테인먼트 법인 키워드
 */

const CORPORATE_VIDEO_THRESHOLD = 500

// 채널명 패턴 (정규식)
const CORPORATE_PATTERNS = [
  // 지상파·케이블·종편·보도
  /\b(MBC|KBS|SBS|JTBC|tvN|OCN|YTN|MBN|OBS|EBS|TBS|KTV|연합뉴스|뉴시스|헤럴드)\b/i,
  /TV조선|채널A|채널 A/i,
  /\bMnet\b|엠넷/i,
  // 음악·엔터 레이블
  /\b(SMTOWN|HYBE|BIGHIT|JYP|YG Entertainment|Stone Music|1theK|Melon|지니뮤직|플로뮤직)\b/i,
  /\bKakao Entertainment\b/i,
  // 키워드 기반
  /\b(official|공식)\b/i,           // "BTS Official", "MBC 공식"
  /\b(뉴스|News)\b/,                // "뉴스" 포함 채널
  /(Entertainment|엔터테인먼트)$/i, // 채널명 끝이 엔터테인먼트
  /\b(방송국|방송사|미디어그룹)\b/,
]

/**
 * @param {string} channelTitle
 * @param {number} videoCount
 * @returns {boolean} true = 기업·방송 채널
 */
export function isCorporateChannel(channelTitle, videoCount) {
  if (videoCount > CORPORATE_VIDEO_THRESHOLD) return true
  return CORPORATE_PATTERNS.some(p => p.test(channelTitle))
}
