const GRADE_OPTIONS = ['전체', '최상', '상', '중', '하', '최하']

const SORT_OPTIONS = [
  { key: 'viewCount', label: '조회수' },
  { key: 'subscriberCount', label: '구독자' },
  { key: 'publishedAt', label: '게시일' },
  { key: 'likeCount', label: '좋아요' },
  { key: 'commentCount', label: '댓글' },
  { key: 'performance', label: '실적도' },
  { key: 'contribution', label: '공헌도' },
]

export default function ResultFilter({ filters, onChange, total, filtered }) {
  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const isFiltered = filtered < total

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-3 sm:p-4 mb-4 space-y-3">
      {/* 카운트 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-white text-sm font-semibold">결과 필터 / 정렬</span>
        <div className="flex items-center gap-1.5 text-xs flex-wrap">
          <span className="text-gray-500">전체</span>
          <span className="text-white font-bold">{total.toLocaleString()}개</span>
          {isFiltered && (
            <>
              <span className="text-gray-700">→</span>
              <span className="text-yellow-400 font-bold">{filtered.toLocaleString()}개</span>
              <span className="text-gray-600">필터됨</span>
            </>
          )}
        </div>
      </div>

      {/* Shorts */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">Shorts</span>
        <button
          type="button"
          onClick={() => update('includeShorts', !filters.includeShorts)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition ${
            filters.includeShorts ? 'bg-[#272727] text-gray-300' : 'bg-red-700 text-white'
          }`}
        >
          {filters.includeShorts ? '포함' : '제외'}
        </button>
      </div>

      {/* 실적도 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">실적도</span>
        <div className="flex flex-wrap gap-1">
          {GRADE_OPTIONS.map(g => (
            <button key={g} type="button" onClick={() => update('performanceGrade', g)}
              className={`px-2 py-1 rounded-md text-xs transition ${
                filters.performanceGrade === g ? 'bg-blue-600 text-white' : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
              }`}>{g}</button>
          ))}
        </div>
      </div>

      {/* 공헌도 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">공헌도</span>
        <div className="flex flex-wrap gap-1">
          {GRADE_OPTIONS.map(g => (
            <button key={g} type="button" onClick={() => update('contributionGrade', g)}
              className={`px-2 py-1 rounded-md text-xs transition ${
                filters.contributionGrade === g ? 'bg-green-600 text-white' : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
              }`}>{g}</button>
          ))}
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-2 border-t border-[#2a2a2a]">
        <span className="text-gray-500 text-xs w-10 flex-shrink-0">정렬</span>
        <div className="flex flex-wrap gap-1">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} type="button"
              onClick={() => {
                if (filters.sortKey === opt.key) {
                  update('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
                } else {
                  onChange({ ...filters, sortKey: opt.key, sortDir: 'desc' })
                }
              }}
              className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1 ${
                filters.sortKey === opt.key ? 'bg-yellow-600 text-white font-medium' : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
              }`}
            >
              {opt.label}
              {filters.sortKey === opt.key && (
                <span className="text-[10px]">{filters.sortDir === 'desc' ? '▼' : '▲'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
