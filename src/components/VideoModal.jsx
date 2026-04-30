import { useEffect } from 'react'

const GRADE_COLOR = {
  최상: 'text-red-400',
  상: 'text-orange-400',
  중: 'text-yellow-400',
  하: 'text-blue-400',
  최하: 'text-gray-400',
}

function fmt(n) {
  if (n >= 100000000) return (n / 100000000).toFixed(1) + '억'
  if (n >= 10000) return (n / 10000).toFixed(1) + '만'
  if (n >= 1000) return (n / 1000).toFixed(1) + '천'
  return n.toLocaleString()
}

function fmtDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ko-KR') : '-'
}

export default function VideoModal({ video, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!video) return null

  const youtubeUrl = `https://www.youtube.com/watch?v=${video.videoId}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 썸네일 + 닫기 */}
        <div className="relative">
          <img
            src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
            alt={video.title}
            className="w-full rounded-t-2xl object-cover max-h-72"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
          >
            ✕
          </button>
          {video.isShorts && (
            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              Shorts
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* 제목 태그 */}
          <div className="inline-block w-full bg-[#272727] border border-[#3a3a3a] text-white text-sm font-semibold px-3 py-2 rounded-lg leading-snug">
            {video.title}
          </div>

          {/* 채널 태그 */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              {video.channelTitle}
            </span>
          </div>

          {/* 주요 지표 */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '조회수', value: fmt(video.viewCount) },
              { label: '좋아요', value: fmt(video.likeCount) },
              { label: '댓글', value: fmt(video.commentCount) },
              { label: '구독자', value: fmt(video.subscriberCount) },
              { label: '영상 수', value: fmt(video.videoCount) },
              { label: '게시일', value: fmtDate(video.publishedAt) },
            ].map(item => (
              <div key={item.label} className="bg-[#272727] rounded-lg p-3 text-center">
                <div className="text-gray-400 text-xs mb-1">{item.label}</div>
                <div className="text-white text-sm font-semibold">{item.value}</div>
              </div>
            ))}
          </div>

          {/* 실적도 / 공헌도 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#272727] rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">실적도</div>
              <div className={`text-sm font-bold ${GRADE_COLOR[video.performance?.grade]}`}>
                {video.performance?.grade}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">조회수 / 구독자 확산력</div>
            </div>
            <div className="bg-[#272727] rounded-lg p-3 text-center">
              <div className="text-gray-400 text-xs mb-1">공헌도</div>
              <div className={`text-sm font-bold ${GRADE_COLOR[video.contribution?.grade]}`}>
                {video.contribution?.grade}
              </div>
              <div className="text-gray-500 text-xs mt-0.5">좋아요+댓글 참여율</div>
            </div>
          </div>

          {/* 설명 */}
          {video.description && (
            <div className="bg-[#272727] rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-2">영상 설명</div>
              <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                {video.description}
              </p>
            </div>
          )}

          {/* YouTube 이동 버튼 */}
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-red-600 hover:bg-red-700 text-white text-center py-3 rounded-xl font-medium transition"
          >
            ▶ YouTube에서 시청하기
          </a>
        </div>
      </div>
    </div>
  )
}
