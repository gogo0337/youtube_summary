/**
 * 채널·영상 성격 판별 유틸
 *
 * [기업 채널]
 *  1. 영상 수 500개 초과 → 방송사·언론사는 매일 수십 개 업로드
 *  2. 채널명에 방송사·엔터사 이름 포함
 *  3. Official / 공식 키워드
 *
 * [음악·플레이리스트 영상]
 *  1. YouTube 카테고리 10(Music) + 30분↑ → 음악 컴필레이션·스트림
 *  2. 제목에 playlist·bgm·lofi·배경음악 등 키워드
 *  3. 채널명에 music·playlist·lofi 등 포함
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

// ─────────────────────────────────────────────────────────────
// 음악·플레이리스트 영상 탐지
// ─────────────────────────────────────────────────────────────

// YouTube 카테고리 ID 10 = Music
const MUSIC_CATEGORY_ID = '10'
// Music 카테고리이면서 이 초수 이상이면 컴필레이션/스트림으로 판단 (30분)
const MUSIC_LONG_THRESHOLD_SECS = 1800

// 제목 기반 패턴
const MUSIC_TITLE_PATTERNS = [
  /\bplaylist\b/i,
  /플레이리스트/,
  /\blo[\s-]?fi\b/i,
  /\bbgm\b/i,
  /배경\s*음악/,
  /노래\s*모음/,
  /연속\s*재생/,
  /모음\s*집/,
  /수면\s*음악/,
  /\bsleep\s*music\b/i,
  /\brelaxing\s*music\b/i,
  /\bstudy\s*music\b/i,
  /\bmeditation\s*music\b/i,
  /\bchill\s*(music|mix|hop|out)\b/i,
  /\bambient\s*music\b/i,
  /\basmr\b/i,
  /공부할\s*때/,
  /작업할\s*때/,
  /집중\s*(음악|할\s*때|용)/,
  // "1시간", "2시간" + 음악 컨텍스트
  /[1-9]\s*시간\s*(연속|음악|재생|모음|듣기|뮤직)/,
]

// 채널명 기반 패턴
const MUSIC_CHANNEL_PATTERNS = [
  /\bplaylist\b/i,
  /플레이리스트/,
  /\blo[\s-]?fi\b/i,
  /\bbgm\b/i,
  /\bstudy\s*music\b/i,
  /\bchill\s*(music|hop)\b/i,
  /\brelaxing\b/i,
  /\bambient\s*music\b/i,
]

/**
 * @param {string} title
 * @param {string} channelTitle
 * @param {string} categoryId  - YouTube video categoryId
 * @param {number} durationSecs
 * @returns {boolean} true = 음악 단순재생·플레이리스트 영상
 */
export function isMusicPlaylist(title, channelTitle, categoryId, durationSecs) {
  // Music 카테고리 + 30분 이상 = 컴필레이션·스트림 (MV는 보통 5분 미만)
  if (categoryId === MUSIC_CATEGORY_ID && durationSecs >= MUSIC_LONG_THRESHOLD_SECS) return true
  // 제목 키워드
  if (MUSIC_TITLE_PATTERNS.some(p => p.test(title))) return true
  // 채널명 키워드
  if (MUSIC_CHANNEL_PATTERNS.some(p => p.test(channelTitle))) return true
  return false
}

// ─────────────────────────────────────────────────────────────
// 인기 트렌드 패널 노출 제외 (연예인·MV·음악·게임)
// ─────────────────────────────────────────────────────────────

// MV·뮤직비디오 제목 패턴
const MV_TITLE_PATTERNS = [
  /\bM\/?V\b/,                         // MV / M/V
  /Music\s*Video/i,
  /뮤직비디오/,
  /공식\s*(뮤비|MV)/,
  /Official\s*(MV|Music\s*Video|Video|Audio|Lyric)/i,
  /\bMV\s*공개/,
  /\bComeback\s*(Trailer|Stage)/i,
  /\b(Teaser|Highlight\s*Medley)\b/i,
]

// 게임 콘텐츠 제목 패턴 (게임 카테고리 외 채널에서 게임 영상 올린 경우)
const GAME_TITLE_PATTERNS = [
  /게임\s*플레이/,
  /\bgameplay\b/i,
  /\bwalkthrough\b/i,
  /공략\s*영상/,
  /클리어\s*영상/,
  /\bspeedrun\b/i,
  /\b(boss|raid|dungeon)\s*공략/i,
]

// 연예 기획사·음악 채널 패턴
const ENTERTAINMENT_CHANNEL_PATTERNS = [
  /\bSMTOWN\b/i,
  /\bHYBE\s*LABELS?\b/i,
  /\b(BIGHIT|Bighit\s*Music)\b/i,
  /\bJYP(\s*Entertainment)?\b/,
  /\bYG\s*(Entertainment|Family)\b/i,
  /\bStone\s*Music/i,
  /\b1theK\b/i,
  /\bKakao\s*Entertainment/i,
  /(Entertainment|엔터테인먼트)\s*$/i,
  /(Music|뮤직)\s*$/i,
  /\bRecords?\s*$/i,
]

/**
 * 인기 트렌드 패널에서 숨길 대상인지 판별
 * - 음악 카테고리(10), 게임 카테고리(20)
 * - MV·뮤직비디오·공식 뮤비 제목
 * - 게임 플레이·공략 제목
 * - 연예 기획사·음악 레이블 채널
 *
 * @param {{ title: string, channelTitle: string, categoryId?: string }} video
 * @returns {boolean}
 */
export function isExcludedFromTrending(video) {
  // 카테고리 기반: Music(10), Gaming(20)
  if (video.categoryId === '10' || video.categoryId === '20') return true
  // 제목: MV·뮤직비디오
  if (MV_TITLE_PATTERNS.some(p => p.test(video.title))) return true
  // 제목: 게임 플레이·공략
  if (GAME_TITLE_PATTERNS.some(p => p.test(video.title))) return true
  // 채널명: 기획사·레이블
  if (ENTERTAINMENT_CHANNEL_PATTERNS.some(p => p.test(video.channelTitle))) return true
  return false
}
