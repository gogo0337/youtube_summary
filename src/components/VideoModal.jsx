import { useEffect, useState } from 'react'
import { fetchTopComments } from '../api/youtube'
import { fetchTranscript } from '../api/transcript'

const GRADE_COLOR = {
  최상: 'text-red-400',
  상:   'text-orange-400',
  중:   'text-yellow-400',
  하:   'text-blue-400',
  최하: 'text-gray-400',
}

function fmt(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '억'
  if (n >= 10000)     return (n / 10000).toFixed(1) + '만'
  if (n >= 1000)      return (n / 1000).toFixed(1) + '천'
  return n.toLocaleString()
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ko-KR') : '-'
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso)
  const days = Math.floor(diff / 86400000)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  if (years > 0) return `${years}년 전`
  if (months > 0) return `${months}개월 전`
  if (days > 0) return `${days}일 전`
  return '오늘'
}

// YouTube textDisplay에 포함된 기본 HTML 태그 제거
function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .trim()
}

export default function VideoModal({ video, onClose, onQuotaUsed }) {
  const [comments, setComments]               = useState(null)
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [commentsError, setCommentsError]     = useState('')
  const [showFullComment, setShowFullComment] = useState(null)

  // 스크립트 상태
  const [transcript, setTranscript]           = useState(null)   // null = 미로드
  const [transcriptLoading, setTranscriptLoading] = useState(false)
  const [transcriptState, setTranscriptState] = useState('')     // 'ok'|'noCaption'|'empty'|'error'
  const [transcriptMeta, setTranscriptMeta]   = useState(null)   // { lang, langName, isAsr }

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // 모달 열릴 때 베스트 댓글 자동 로드
  useEffect(() => {
    if (!video?.videoId) return
    setComments(null)
    setCommentsDisabled(false)
    setCommentsError('')
    setShowFullComment(null)
    // 스크립트 초기화
    setTranscript(null)
    setTranscriptState('')
    setTranscriptMeta(null)
    loadComments()
  }, [video?.videoId])

  async function loadComments() {
    setCommentsLoading(true)
    try {
      const { comments: data, quotaUsed, disabled } = await fetchTopComments(video.videoId)
      if (disabled) {
        setCommentsDisabled(true)
      } else {
        setComments(data)
        if (onQuotaUsed && quotaUsed > 0) {
          onQuotaUsed(quotaUsed, `베스트 댓글 "${video.title.slice(0, 20)}"`)
        }
      }
    } catch {
      setCommentsError('댓글을 불러오지 못했습니다.')
    } finally {
      setCommentsLoading(false)
    }
  }

  async function loadTranscript() {
    if (transcriptLoading || transcriptState) return
    setTranscriptLoading(true)
    try {
      const result = await fetchTranscript(video.videoId, 30)
      if (result.noCaption) {
        setTranscriptState('noCaption')
      } else if (result.empty) {
        setTranscriptState('empty')
        setTranscriptMeta({ lang: result.lang, langName: result.langName, isAsr: result.isAsr })
      } else {
        setTranscript(result.transcript)
        setTranscriptMeta({ lang: result.lang, langName: result.langName, isAsr: result.isAsr })
        setTranscriptState('ok')
      }
    } catch (e) {
      console.error('Transcript error:', e)
      setTranscriptState('error')
    } finally {
      setTranscriptLoading(false)
    }
  }

  if (!video) return null

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* 모바일: 하단 시트 / 데스크탑: 중앙 모달 */}
      <div className="
        bg-[#1a1a1a] w-full overflow-y-auto shadow-2xl
        rounded-t-2xl max-h-[92vh]
        sm:rounded-2xl sm:max-w-2xl sm:max-h-[90vh] sm:mx-4
      ">
        {/* 모바일 핸들 */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-[#444] rounded-full" />
        </div>

        {/* 썸네일 */}
        <div className="relative">
          <img
            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full object-cover max-h-48 sm:max-h-64 sm:rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full w-9 h-9 flex items-center justify-center text-lg"
          >
            ✕
          </button>
          {video.isShorts && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              Shorts
            </span>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {/* 제목 */}
          <div className="bg-[#272727] border border-[#3a3a3a] text-white text-sm font-semibold px-3 py-2 rounded-lg leading-snug">
            {video.title}
          </div>

          {/* ── 채널 + 채널 평균 조회수 (가장 prominent) ── */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-[#1a2018] to-blue-950/30 border border-emerald-700/40 rounded-xl p-3 sm:p-4">
            <div className="flex items-start justify-between gap-3">
              {/* 채널 정보 */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-blue-900/40 border border-blue-700/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-300 text-base">📺</span>
                </div>
                <div className="min-w-0">
                  <div className="text-blue-200 text-sm font-semibold truncate">{video.channelTitle}</div>
                  <div className="text-gray-500 text-[10px] mt-0.5">
                    구독자 {fmt(video.subscriberCount)} · 영상 {fmt(video.videoCount)}개
                  </div>
                </div>
              </div>

              {/* 평균 조회수 — 큰 숫자 */}
              {video.avgViewsPerVideo > 0 && (
                <div className="text-right flex-shrink-0">
                  <div className="text-emerald-300 text-2xl sm:text-3xl font-bold leading-none tabular-nums">
                    {fmt(video.avgViewsPerVideo)}
                  </div>
                  <div className="text-emerald-500 text-[10px] mt-1 font-medium">채널 평균 조회수</div>
                </div>
              )}
            </div>

            {/* 이 영상 vs 채널 평균 비교 바 */}
            {video.avgViewsPerVideo > 0 && video.viewCount > 0 && (
              <div className="mt-3 pt-3 border-t border-emerald-900/40">
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-gray-500">이 영상 조회수</span>
                  <span className={`font-semibold ${
                    video.viewCount >= video.avgViewsPerVideo ? 'text-emerald-300' : 'text-gray-400'
                  }`}>
                    {video.viewCount >= video.avgViewsPerVideo
                      ? `🔥 평균 대비 ${((video.viewCount / video.avgViewsPerVideo)).toFixed(1)}배 (+${((video.viewCount / video.avgViewsPerVideo) * 100 - 100).toFixed(0)}%)`
                      : `평균 ${(100 - (video.viewCount / video.avgViewsPerVideo) * 100).toFixed(0)}% 미달`
                    }
                  </span>
                </div>
                <div className="relative bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                  {/* 평균 위치 마커 */}
                  <div className="absolute top-0 bottom-0 w-px bg-gray-500 left-1/2 z-10" title="평균선" />
                  {/* 채워진 바 */}
                  <div
                    className={`h-full rounded-full transition-all ${
                      video.viewCount >= video.avgViewsPerVideo
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        : 'bg-gradient-to-r from-gray-700 to-gray-500'
                    }`}
                    style={{ width: `${Math.min(100, (video.viewCount / Math.max(video.avgViewsPerVideo, 1)) * 50)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                  <span>0</span>
                  <span>평균 {fmt(video.avgViewsPerVideo)}</span>
                  <span>2x+</span>
                </div>
              </div>
            )}
          </div>

          {/* 주요 지표 */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '조회수',     value: fmt(video.viewCount) },
              { label: '좋아요',     value: fmt(video.likeCount) },
              { label: '댓글',       value: fmt(video.commentCount) },
              { label: '구독자',     value: fmt(video.subscriberCount) },
              { label: '영상 수',    value: fmt(video.videoCount) },
              { label: '게시일',     value: fmtDate(video.publishedAt) },
            ].map(item => (
              <div key={item.label} className="bg-[#272727] rounded-lg p-2.5 text-center">
                <div className="text-gray-400 text-[10px] mb-1">{item.label}</div>
                <div className="text-white text-xs font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 실적도 / 공헌도 */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#272727] rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">실적도</div>
              <div className={`text-sm font-bold ${GRADE_COLOR[video.performance?.grade]}`}>
                {video.performance?.grade}
              </div>
              <div className="text-gray-500 text-[10px] mt-0.5">일평균 조회 확산력</div>
            </div>
            <div className="bg-[#272727] rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">공헌도</div>
              <div className={`text-sm font-bold ${GRADE_COLOR[video.contribution?.grade]}`}>
                {video.contribution?.grade}
              </div>
              <div className="text-gray-500 text-[10px] mt-0.5">가중 참여율</div>
            </div>
          </div>

          {/* ── 베스트 댓글 ── */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                <span>💬</span> 베스트 댓글
              </span>
              {commentsDisabled && (
                <span className="text-gray-600 text-[10px]">댓글 사용 안 함</span>
              )}
              {commentsError && (
                <span className="text-red-500 text-[10px]">{commentsError}</span>
              )}
              {comments && (
                <span className="text-gray-600 text-[10px]">쿼터 1유닛 소모</span>
              )}
            </div>

            {/* 로딩 */}
            {commentsLoading && (
              <div className="flex items-center justify-center py-4 gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 text-xs">불러오는 중...</span>
              </div>
            )}

            {/* 댓글 비활성화 */}
            {commentsDisabled && !commentsLoading && (
              <p className="text-gray-600 text-xs text-center py-3">이 영상은 댓글이 비활성화되어 있습니다.</p>
            )}

            {/* 댓글 목록 */}
            {!commentsLoading && !commentsDisabled && comments && (
              comments.length === 0
                ? <p className="text-gray-600 text-xs text-center py-3">댓글이 없습니다.</p>
                : <div className="space-y-2.5">
                    {comments.map((c, idx) => (
                      <div key={idx} className="bg-[#1e1e1e] rounded-lg p-2.5">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <span className="text-blue-400 text-[11px] font-medium truncate">{c.authorName}</span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {c.likeCount > 0 && (
                              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                👍 {fmt(c.likeCount)}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-700">{timeAgo(c.publishedAt)}</span>
                          </div>
                        </div>
                        <p className={`text-gray-300 text-[11px] leading-relaxed whitespace-pre-wrap ${
                          showFullComment === idx ? '' : 'line-clamp-3'
                        }`}>
                          {stripHtml(c.text)}
                        </p>
                        {stripHtml(c.text).length > 120 && (
                          <button
                            onClick={() => setShowFullComment(showFullComment === idx ? null : idx)}
                            className="text-[10px] text-gray-600 hover:text-gray-400 mt-1 transition-colors"
                          >
                            {showFullComment === idx ? '접기' : '더보기'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
            )}
          </div>

          {/* ── 초반 30초 스크립트 ── */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-semibold flex items-center gap-1.5">
                <span>📝</span> 초반 30초 스크립트
              </span>
              <div className="flex items-center gap-2">
                {transcriptMeta && (
                  <span className="text-[10px] text-gray-600 flex items-center gap-1">
                    {transcriptMeta.langName}
                    {transcriptMeta.isAsr && (
                      <span className="bg-[#2a2a2a] text-gray-500 px-1 rounded">자동생성</span>
                    )}
                  </span>
                )}
                {/* 불러오기 버튼 (미로드 상태에서만 표시) */}
                {!transcriptState && !transcriptLoading && (
                  <button
                    onClick={loadTranscript}
                    className="text-[10px] bg-[#252525] hover:bg-[#333] border border-[#383838] text-gray-300 px-2.5 py-1 rounded-md transition"
                  >
                    불러오기
                  </button>
                )}
                {/* 재시도 버튼 */}
                {transcriptState === 'error' && (
                  <button
                    onClick={() => { setTranscriptState(''); loadTranscript() }}
                    className="text-[10px] text-red-400 hover:text-red-300 transition"
                  >
                    재시도
                  </button>
                )}
              </div>
            </div>

            {/* 로딩 */}
            {transcriptLoading && (
              <div className="flex items-center gap-2 py-3 justify-center">
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-500 text-xs">자막 가져오는 중...</span>
              </div>
            )}

            {/* 초기 안내 (미로드) */}
            {!transcriptState && !transcriptLoading && (
              <p className="text-gray-600 text-[11px] text-center py-2">
                버튼을 누르면 자막 기반 스크립트를 표시합니다 · 쿼터 미사용
              </p>
            )}

            {/* 자막 없음 */}
            {transcriptState === 'noCaption' && (
              <p className="text-gray-600 text-xs text-center py-2">이 영상에는 자막이 없습니다.</p>
            )}

            {/* 30초 내 자막 없음 */}
            {transcriptState === 'empty' && (
              <p className="text-gray-600 text-xs text-center py-2">초반 30초 구간에 자막 데이터가 없습니다.</p>
            )}

            {/* 오류 */}
            {transcriptState === 'error' && (
              <p className="text-red-400 text-xs text-center py-2">
                자막을 불러오지 못했습니다. (CORS 프록시 일시 불가 또는 자막 없음)
              </p>
            )}

            {/* 스크립트 텍스트 */}
            {transcriptState === 'ok' && transcript && (
              <div className="bg-[#1e1e1e] rounded-lg p-3">
                <p className="text-gray-200 text-[12px] leading-relaxed whitespace-pre-wrap">
                  {transcript}
                </p>
              </div>
            )}
          </div>

          {/* 영상 설명 */}
          {video.description && (
            <div className="bg-[#272727] rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-2">영상 설명</div>
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                {video.description}
              </p>
            </div>
          )}

          {/* YouTube 이동 */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-center py-3.5 rounded-xl font-medium transition text-sm"
          >
            ▶ YouTube에서 시청하기
          </a>

          {/* iOS 안전 영역 */}
          <div className="sm:hidden" style={{ height: 'env(safe-area-inset-bottom)' }} />
        </div>
      </div>
    </div>
  )
}
