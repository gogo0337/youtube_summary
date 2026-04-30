import { useState } from 'react'

const PERIOD_OPTIONS = [
  { label: '전체', value: '' },
  { label: '1주', value: 7 },
  { label: '1개월', value: 30 },
  { label: '3개월', value: 90 },
  { label: '6개월', value: 180 },
]

const PAGE_OPTIONS = [
  { label: '50개', value: 1 },
  { label: '100개', value: 2 },
  { label: '150개', value: 3 },
  { label: '200개', value: 4 },
]

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')
  const [period, setPeriod] = useState('')
  const [pages, setPages] = useState(2)

  function handleSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    onSearch({ query, period, pages })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-xl p-3 sm:p-4 mb-4 space-y-3">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="검색어 입력 (예: 주식 투자, 요리)"
          className="flex-1 bg-[#272727] text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500 min-w-0"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-50 text-white px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap flex-shrink-0"
        >
          {loading ? '검색 중' : '🔍 검색'}
        </button>
      </div>

      {/* 옵션: 게시일 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">게시일</span>
        <div className="flex flex-wrap gap-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1 rounded-md text-xs transition ${
                period === opt.value
                  ? 'bg-red-600 text-white'
                  : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 옵션: 검색 개수 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">개수</span>
        <div className="flex flex-wrap gap-1">
          {PAGE_OPTIONS.map(opt => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setPages(opt.value)}
              className={`px-3 py-1 rounded-md text-xs transition ${
                pages === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="text-gray-600 text-[10px]">많을수록 시간 소요</span>
      </div>
    </form>
  )
}
