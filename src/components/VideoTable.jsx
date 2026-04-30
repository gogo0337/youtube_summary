import { useState, useEffect } from 'react'

const PAGE_SIZE = 50

const GRADE_COLOR = {
  최상: 'bg-red-900/50 text-red-400',
  상: 'bg-orange-900/50 text-orange-400',
  중: 'bg-yellow-900/50 text-yellow-400',
  하: 'bg-blue-900/50 text-blue-400',
  최하: 'bg-gray-800 text-gray-400',
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

export default function VideoTable({ videos, onVideoClick }) {
  const [page, setPage] = useState(1)

  // 필터가 바뀌면 (videos prop 교체) 1페이지로 리셋
  useEffect(() => { setPage(1) }, [videos])

  if (videos.length === 0) return null

  const totalPages = Math.ceil(videos.length / PAGE_SIZE)
  const pageVideos = videos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // 최대 10개 페이지 버튼 표시
  const pageStart = Math.max(1, Math.min(page - 4, totalPages - 9))
  const pageEnd = Math.min(totalPages, pageStart + 9)
  const pageNumbers = Array.from({ length: pageEnd - pageStart + 1 }, (_, i) => pageStart + i)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] text-gray-400 text-xs">
            <tr>
              <th className="px-3 py-3 w-6 text-center text-gray-600">#</th>
              <th className="px-3 py-3">썸네일</th>
              <th className="px-3 py-3">제목</th>
              <th className="px-3 py-3 whitespace-nowrap">조회수</th>
              <th className="px-3 py-3 whitespace-nowrap">구독자</th>
              <th className="px-3 py-3 whitespace-nowrap">실적도</th>
              <th className="px-3 py-3 whitespace-nowrap">공헌도</th>
              <th className="px-3 py-3 whitespace-nowrap">게시일</th>
              <th className="px-3 py-3 whitespace-nowrap">좋아요</th>
              <th className="px-3 py-3 whitespace-nowrap">댓글</th>
              <th className="px-3 py-3 whitespace-nowrap">영상수</th>
            </tr>
          </thead>
          <tbody>
            {pageVideos.map((video, i) => {
              const rowNum = (page - 1) * PAGE_SIZE + i + 1
              return (
                <tr
                  key={video.videoId}
                  onClick={() => onVideoClick(video)}
                  className={`border-t border-[#2a2a2a] cursor-pointer transition hover:bg-[#222] ${
                    i % 2 === 0 ? 'bg-[#111]' : 'bg-[#141414]'
                  }`}
                >
                  <td className="px-3 py-2 text-center text-gray-600 text-xs">{rowNum}</td>
                  <td className="px-3 py-2">
                    <div className="relative w-24 h-14 rounded overflow-hidden">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      {video.isShorts && (
                        <span className="absolute top-0.5 left-0.5 bg-red-600 text-white text-[9px] px-1 rounded">S</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-sm">
                    <div className="flex items-start gap-2">
                      <span className="inline-block bg-[#272727] border border-[#3a3a3a] text-white text-xs font-medium px-2 py-1 rounded-md leading-snug line-clamp-2 flex-1 min-w-0">
                        {video.title}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[10px] px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                        {video.channelTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(video.viewCount)}</td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(video.subscriberCount)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_COLOR[video.performance?.grade]}`}>
                      {video.performance?.grade}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${GRADE_COLOR[video.contribution?.grade]}`}>
                      {video.contribution?.grade}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-400 text-xs whitespace-nowrap">{fmtDate(video.publishedAt)}</td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(video.likeCount)}</td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(video.commentCount)}</td>
                  <td className="px-3 py-2 text-gray-300 whitespace-nowrap">{fmt(video.videoCount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ««
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ‹
          </button>

          {pageNumbers.map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded text-xs transition ${
                n === page
                  ? 'bg-red-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            »»
          </button>

          <span className="text-gray-600 text-xs ml-2">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, videos.length)} / {videos.length}개
          </span>
        </div>
      )}
    </div>
  )
}
