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

function rankColor(idx) {
  if (idx === 0) return 'text-yellow-400'
  if (idx === 1) return 'text-gray-400'
  if (idx === 2) return 'text-amber-500'
  return 'text-gray-600'
}

// 제목에서 핵심 키워드 추출 (대괄호·특수문자 제거, 앞 20자)
function extractKeyword(title) {
  return title
    .replace(/[\[\]【】「」《》()（）『』]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/[,\-·|\/]/)[0]
    .trim()
    .slice(0, 22)
}

export default function TrendingPanel({ onSearch, onQuotaUsed }) {
  const [open, setOpen] = useState(false)
  const [view, setView]  = useState('list') // 'list' | 'keyword'

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

  // 채널명 중복 제거 키워드
  const channelKeywords = [...new Map(trending.map(v => [v.channelTitle, v])).values()]
  // 제목 기반 키워드
  const titleKeywords   = trending.map(v => extractKeyword(v.title)).filter(Boolean)

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
          <span className="text-[10px] text-gray-600 hidden sm:inline">{updatedDate} 기준</span>
        )}
        <span className="text-gray-600 text-xs ml-1">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="mt-2 bg-[#131313] border border-[#252525] rounded-xl p-3 sm:p-4">

          {/* 카테고리 탭 + 뷰 토글 + 새로고침 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => switchCategory(cat.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    activeCategory === cat.id
                      ? 'bg-orange-600 border-orange-600 text-white font-medium'
                      : 'bg-[#1e1e1e] border-[#333] text-gray-400 hover:border-[#555] hover:text-gray-200'
                  }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* 뷰 모드 + 새로고침 */}
            <div className="flex items-center gap-2 ml-auto flex-shrink-0">
              <div className="flex bg-[#1e1e1e] border border-[#333] rounded-full overflow-hidden text-[10px]">
                <button
                  onClick={() => setView('list')}
                  className={`px-2.5 py-1 transition-colors ${view === 'list' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  목록
                </button>
                <button
                  onClick={() => setView('keyword')}
                  className={`px-2.5 py-1 transition-colors ${view === 'keyword' ? 'bg-[#333] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  키워드
                </button>
              </div>
              <button
                onClick={() => refresh()}
                className="text-[10px] text-gray-600 hover:text-gray-300 transition-colors"
                title="새로고침 (쿼터 1유닛)"
              >
                ↻
              </button>
            </div>
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 에러 */}
          {error && !loading && (
            <p className="text-red-400 text-xs text-center py-4">{error}</p>
          )}

          {/* ── 목록 뷰 ── */}
          {!loading && trending.length > 0 && view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0.5">
              {trending.map((v, idx) => (
                <div
                  key={v.videoId}
                  className="flex items-center gap-2 px-1.5 py-1.5 rounded-lg hover:bg-[#1c1c1c] transition-colors group"
                >
                  {/* 순위 */}
                  <span className={`text-xs font-bold w-5 text-center flex-shrink-0 tabular-nums ${rankColor(idx)}`}>
                    {idx + 1}
                  </span>

                  {/* 미니 썸네일 */}
                  <a
                    href={`https://youtube.com/watch?v=${v.videoId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 block rounded overflow-hidden"
                    title="YouTube에서 보기"
                  >
                    <div className="w-14 h-8 bg-[#222] overflow-hidden rounded">
                      {v.thumbnail
                        ? <img src={v.thumbnail} alt="" loading="lazy" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">▶</div>
                      }
                    </div>
                  </a>

                  {/* 제목 + 채널 + 조회수 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-[11px] font-medium leading-tight line-clamp-1">
                      {v.title}
                    </p>
                    <p className="text-gray-600 text-[10px] mt-0.5 flex items-center gap-1.5">
                      <span className="truncate max-w-[80px]">{v.channelTitle}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">👁 {formatViews(v.viewCount)}</span>
                    </p>
                  </div>

                  {/* 검색 버튼 */}
                  <button
                    onClick={() => onSearch(v.channelTitle)}
                    className="flex-shrink-0 text-[9px] text-orange-400 hover:text-orange-200 border border-orange-900/40 hover:border-orange-500/50 rounded px-1.5 py-0.5 transition-all opacity-60 group-hover:opacity-100"
                    title={`"${v.channelTitle}" 채널로 검색`}
                  >
                    검색
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── 키워드 뷰 ── */}
          {!loading && trending.length > 0 && view === 'keyword' && (
            <div className="space-y-4">

              {/* 채널 키워드 */}
              <div>
                <p className="text-[10px] text-gray-600 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                  채널 키워드
                  <span className="text-gray-700">(클릭하면 해당 채널 영상 검색)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {channelKeywords.map((v, idx) => (
                    <button
                      key={v.videoId}
                      onClick={() => onSearch(v.channelTitle)}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 bg-[#1e1e1e] border border-[#333] text-gray-300 rounded-full hover:border-orange-600/60 hover:text-orange-300 hover:bg-orange-950/20 transition-all"
                    >
                      <span className={`text-[9px] font-bold ${rankColor(idx)}`}>{idx + 1}</span>
                      {v.channelTitle}
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 키워드 */}
              <div>
                <p className="text-[10px] text-gray-600 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  인기 영상 키워드
                  <span className="text-gray-700">(클릭하면 해당 키워드로 검색)</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {titleKeywords.map((kw, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSearch(kw)}
                      className="text-xs px-2.5 py-1 bg-[#1a1e2a] border border-blue-900/40 text-blue-300/80 rounded-full hover:border-blue-500/60 hover:text-blue-200 hover:bg-blue-950/30 transition-all"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  )
}
