import { useEffect, useState } from 'react'
import { fetchTopComments } from '../api/youtube'

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
  const [comments, setComments]           = useState(null)   // null = 미로드
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [showFullComment, setShowFullComment] = useState(null)

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

          {/* 채널 */}
          <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            {video.channelTitle}
          </span>

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

          {/* 채널 평균 조회수 */}
          {video.avgViewsPerVideo > 0 && (
            <div className="bg-[#1e2a1e] border border-emerald-800/40 rounded-lg p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-emerald-400 text-xs font-semibold">채널 평균 조회수</span>
                  <span className="text-gray-500 text-[10px] ml-1.5">총 {fmt(video.channelTotalViews)}회 ÷ {fmt(video.videoCount)}개</span>
                </div>
                <span className="text-emerald-300 text-lg font-bold">{fmt(video.avgViewsPerVideo)}</span>
              </div>
              {/* 이 영상 vs 채널 평균 비교 */}
              {video.viewCount > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        video.viewCount >= video.avgViewsPerVideo ? 'bg-emerald-500' : 'bg-gray-600'
                      }`}
                      style={{ width: `${Math.min(100, (video.viewCount / Math.max(video.avgViewsPerVideo, 1)) * 50)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${
                    video.viewCount >= video.avgViewsPerVideo ? 'text-emerald-400' : 'text-gray-500'
                  }`}>
                    {video.viewCount >= video.avgViewsPerVideo
                      ? `평균 ${((video.viewCount / video.avgViewsPerVideo) * 100 - 100).toFixed(0)}% 초과`
                      : `평균 ${(100 - (video.viewCount / video.avgViewsPerVideo) * 100).toFixed(0)}% 미달`
                    }
                  </span>
                </div>
              )}
            </div>
          )}

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
