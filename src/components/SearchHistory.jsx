import { useState } from 'react'

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (mins > 0) return `${mins}분 전`
  return '방금 전'
}

export default function SearchHistory({ history, onRestore, onRemove, onClear }) {
  const [expanded, setExpanded] = useState(false)

  if (history.length === 0) return null

  const visible = expanded ? history : history.slice(0, 8)

  return (
    <div className="px-1 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 flex items-center gap-1.5">
          <span>🕐</span>
          <span>검색 기록</span>
          <span className="text-gray-700">({history.length}/15)</span>
          <span className="text-[10px] text-blue-600 bg-blue-950/30 border border-blue-800/30 px-1.5 py-0.5 rounded-full ml-1">
            쿼터 미사용
          </span>
        </span>
        <button
          onClick={onClear}
          className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
        >
          전체 삭제
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {visible.map(h => (
          <div
            key={h.id}
            className="group flex items-center bg-[#1a1a1a] border border-[#2e2e2e] rounded-full hover:border-red-700/50 hover:bg-[#221515] transition-all"
          >
            <button
              onClick={() => onRestore(h)}
              className="flex items-center gap-1.5 text-xs text-gray-400 group-hover:text-white pl-2.5 pr-1 py-1.5 transition-colors"
            >
              <span className="text-red-500 text-[8px]">●</span>
              <span className="font-medium max-w-[100px] sm:max-w-[140px] truncate">{h.query}</span>
              <span className="text-[10px] text-gray-600">{h.videos.length}개</span>
              <span className="text-[10px] text-gray-700">·</span>
              <span className="text-[10px] text-gray-600">{timeAgo(h.timestamp)}</span>
            </button>
            <button
              onClick={e => { e.stopPropagation(); onRemove(h.id) }}
              className="text-gray-700 hover:text-red-400 text-[10px] pr-2.5 pl-1 py-1.5 transition-colors"
              title="삭제"
            >
              ✕
            </button>
          </div>
        ))}

        {history.length > 8 && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[10px] text-gray-500 hover:text-gray-300 px-3 py-1.5 border border-[#2e2e2e] rounded-full hover:border-[#444] transition-colors"
          >
            {expanded ? '접기 ▲' : `+${history.length - 8}개 더보기`}
          </button>
        )}
      </div>
    </div>
  )
}
