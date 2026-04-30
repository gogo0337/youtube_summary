import { useState } from 'react'
import { useTrending } from '../hooks/useTrending'

const CATEGORIES = [
  { id: '0',  label: '전체',   emoji: '🔥' },
  { id: '10', label: '음악',   emoji: '🎵' },
  { id: '20', label: '게임',   emoji: '🎮' },
  { id: '17', label: '스포츠', emoji: '⚽' },
  { id: '24', label: '엔터',   emoji: '🎬' },
  { id: '25', label: '뉴스',   emoji: '📰' },
]

function formatViews(n) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`
  if (n >= 10000)     return `${(n / 10000).toFixed(1)}만`
  return n.toLocaleString()
}

function RankBadge({ rank }) {
  const base = 'absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg'
  if (rank === 0) return <div className={`${base} bg-yellow-400 text-black`}>1</div>
  if (rank === 1) return <div className={`${base} bg-gray-300 text-black`}>2</div>
  if (rank === 2) return <div className={`${base} bg-amber-600 text-white`}>3</div>
  return <div className={`${base} bg-black/70 text-white border border-white/10`}>{rank + 1}</div>
}

export default function TrendingPanel({ onSearch, onQuotaUsed }) {
  const [open, setOpen] = useState(false)
  const {
    trending,
    updatedAt,
    loading,
    error,
    activeCategory,
    switchCategory,
    refresh,
  } = useTrending(onQuotaUsed)

  const updatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
    : ''

  return (
    <div className="mb-4">
      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-all ${
          open
            ? 'text-orange-300 border-orange-700/50 bg-orange-950/30'
            : 'text-gray-400 border-[#2a2a2a] bg-[#161616] hover:text-white hover:border-[#444]'
        }`}
      >
        <span>🔥</span>
        <span className="font-medium">인기 트렌드</span>
        {updatedDate && (
          <span className="text-[10px] text-gray-600 hidden sm:inline">{updatedDate} 기준 · 일 1회 캐시</span>
        )}
        <span className="text-gray-600 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 bg-[#131313] border border-[#252525] rounded-xl p-4">
          {/* 카테고리 탭 + 새로고침 */}
          <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.id)}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-orange-600 border-orange-600 text-white font-medium'
                      : 'bg-[#1e1e1e] border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => refresh()}
              className="text-[10px] text-gray-600 hover:text-gray-300 flex items-center gap-1 transition-colors flex-shrink-0"
              title="강제 새로고침 (쿼터 1유닛 소모)"
            >
              ↻ <span className="hidden sm:inline">새로고침</span>
              <span className="text-gray-700">(1유닛)</span>
            </button>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 에러 */}
          {error && !loading && (
            <p className="text-red-400 text-xs text-center py-6">{error}</p>
          )}

          {/* 영상 그리드 */}
          {!loading && trending.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {trending.map((v, idx) => (
                <div key={v.videoId} className="group relative">
                  <RankBadge rank={idx} />

                  {/* 썸네일 */}
                  <a
                    href={`https://youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-[#222]">
                      {v.thumbnail ? (
                        <img
                          src={v.thumbnail}
                          alt={v.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-2xl">
                          ▶
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="text-white text-3xl opacity-0 group-hover:opacity-90 drop-shadow-lg transition-opacity">
                          ▶
                        </span>
                      </div>
                    </div>
                  </a>

                  {/* 정보 */}
                  <div className="mt-1.5">
                    <p className="text-white text-[11px] font-medium line-clamp-2 leading-snug">
                      {v.title}
                    </p>
                    <p className="text-gray-500 text-[10px] mt-0.5 truncate">
                      {v.channelTitle}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 gap-1">
                      <span className="text-gray-600 text-[10px]">
                        👁 {formatViews(v.viewCount)}
                      </span>
                      <button
                        onClick={() => onSearch(v.channelTitle)}
                        className="text-[9px] text-orange-400 hover:text-orange-300 border border-orange-900/40 hover:border-orange-600/50 rounded px-1.5 py-0.5 transition-all whitespace-nowrap"
                        title={`"${v.channelTitle}" 채널로 검색`}
                      >
                        검색
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
