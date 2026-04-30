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

// 모바일 카드
function VideoCard({ video, index, onVideoClick }) {
  return (
    <div
      onClick={() => onVideoClick(video)}
      className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden active:bg-[#222] transition cursor-pointer"
    >
      <div className="flex gap-3 p-3">
        {/* 썸네일 */}
        <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          {video.isShorts && (
            <span className="absolute top-1 left-1 bg-red-600 text-white text-[9px] px-1 rounded">S</span>
          )}
          <span className="absolute bottom-1 right-1 bg-black/60 text-gray-400 text-[9px] px-1 rounded">
            #{index}
          </span>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* 제목 태그 */}
          <div className="bg-[#272727] border border-[#3a3a3a] text-white text-xs font-medium px-2 py-1 rounded-md leading-snug line-clamp-2">
            {video.title}
          </div>
          {/* 채널 태그 */}
          <span className="inline-flex items-center gap-1 bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[10px] px-2 py-0.5 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
            {video.channelTitle}
          </span>
        </div>
      </div>

      {/* 지표 */}
      <div className="grid grid-cols-4 border-t border-[#2a2a2a]">
        {[
          { label: '조회수', value: fmt(video.viewCount) },
          { label: '구독자', value: fmt(video.subscriberCount) },
          { label: '좋아요', value: fmt(video.likeCount) },
          { label: '댓글', value: fmt(video.commentCount) },
        ].map(item => (
          <div key={item.label} className="py-2 text-center border-r border-[#2a2a2a] last:border-r-0">
            <div className="text-gray-500 text-[9px]">{item.label}</div>
            <div className="text-white text-xs font-medium mt-0.5">{item.value}</div>
          </div>
        ))}
      </div>

      {/* 실적도 / 공헌도 / 게시일 */}
      <div className="grid grid-cols-3 border-t border-[#2a2a2a]">
        <div className="py-2 text-center border-r border-[#2a2a2a]">
          <div className="text-gray-500 text-[9px]">실적도</div>
          <span className={`text-[10px] font-bold ${GRADE_COLOR[video.performance?.grade]} px-1.5 py-0.5 rounded mt-0.5 inline-block`}>
            {video.performance?.grade}
          </span>
        </div>
        <div className="py-2 text-center border-r border-[#2a2a2a]">
          <div className="text-gray-500 text-[9px]">공헌도</div>
          <span className={`text-[10px] font-bold ${GRADE_COLOR[video.contribution?.grade]} px-1.5 py-0.5 rounded mt-0.5 inline-block`}>
            {video.contribution?.grade}
          </span>
        </div>
        <div className="py-2 text-center">
          <div className="text-gray-500 text-[9px]">게시일</div>
          <div className="text-gray-400 text-[10px] mt-0.5">{fmtDate(video.publishedAt)}</div>
        </div>
      </div>
    </div>
  )
}

// 데스크탑 테이블 행
function TableRow({ video, index, onVideoClick }) {
  return (
    <tr
      onClick={() => onVideoClick(video)}
      className="border-t border-[#2a2a2a] cursor-pointer transition hover:bg-[#222] odd:bg-[#111] even:bg-[#141414]"
    >
      <td className="px-3 py-2 text-center text-gray-600 text-xs">{index}</td>
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
}

// 페이지네이션
function Pagination({ page, totalPages, total, onPage }) {
  if (totalPages <= 1) return null
  const start = Math.max(1, Math.min(page - 4, totalPages - 9))
  const end = Math.min(totalPages, start + 9)
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <div className="flex items-center justify-center flex-wrap gap-1 py-3">
      <button onClick={() => onPage(1)} disabled={page === 1}
        className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition">
        ««
      </button>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition">
        ‹
      </button>
      {nums.map(n => (
        <button key={n} onClick={() => onPage(n)}
          className={`w-8 h-8 rounded text-xs transition ${n === page ? 'bg-red-600 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}>
          {n}
        </button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition">
        ›
      </button>
      <button onClick={() => onPage(totalPages)} disabled={page === totalPages}
        className="px-2 py-1.5 rounded text-xs text-gray-400 hover:text-white hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition">
        »»
      </button>
      <span className="text-gray-600 text-xs ml-2 w-full text-center sm:w-auto">
        {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}개
      </span>
    </div>
  )
}

export default function VideoTable({ videos, onVideoClick }) {
  const [page, setPage] = useState(1)
  useEffect(() => { setPage(1) }, [videos])

  if (videos.length === 0) return null

  const totalPages = Math.ceil(videos.length / PAGE_SIZE)
  const pageVideos = videos.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="space-y-3">
      {/* 모바일: 카드 레이아웃 */}
      <div className="md:hidden space-y-3">
        {pageVideos.map((video, i) => (
          <VideoCard
            key={video.videoId}
            video={video}
            index={(page - 1) * PAGE_SIZE + i + 1}
            onVideoClick={onVideoClick}
          />
        ))}
      </div>

      {/* 데스크탑: 테이블 레이아웃 */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#2a2a2a]">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#1a1a1a] text-gray-400 text-xs">
            <tr>
              <th className="px-3 py-3 w-6 text-center text-gray-600">#</th>
              <th className="px-3 py-3">썸네일</th>
              <th className="px-3 py-3">제목 / 채널</th>
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
            {pageVideos.map((video, i) => (
              <TableRow
                key={video.videoId}
                video={video}
                index={(page - 1) * PAGE_SIZE + i + 1}
                onVideoClick={onVideoClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} total={videos.length} onPage={setPage} />
    </div>
  )
}
