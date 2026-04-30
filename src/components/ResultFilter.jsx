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
    <div className="bg-[#1a1a1a] rounded-xl p-4 mb-4 space-y-3">
      {/* 검색 결과 카운트 */}
      <div className="flex items-center justify-between">
        <span className="text-white text-sm font-semibold">결과 필터 / 정렬</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500">전체</span>
          <span className="text-white font-bold text-sm">{total.toLocaleString()}</span>
          <span className="text-gray-600">개 검색됨</span>
          {isFiltered && (
            <>
              <span className="text-gray-700">|</span>
              <span className="text-gray-500">필터 후</span>
              <span className="text-yellow-400 font-bold text-sm">{filtered.toLocaleString()}</span>
              <span className="text-gray-600">개</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {/* Shorts */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">Shorts</span>
          <button
            type="button"
            onClick={() => update('includeShorts', !filters.includeShorts)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              filters.includeShorts
                ? 'bg-[#272727] text-gray-300 hover:bg-[#333]'
                : 'bg-red-700 text-white'
            }`}
          >
            {filters.includeShorts ? '포함' : '제외'}
          </button>
        </div>

        {/* 실적도 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">실적도</span>
          <div className="flex gap-1">
            {GRADE_OPTIONS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('performanceGrade', g)}
                className={`px-2 py-1 rounded-md text-xs transition ${
                  filters.performanceGrade === g
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 공헌도 */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">공헌도</span>
          <div className="flex gap-1">
            {GRADE_OPTIONS.map(g => (
              <button
                key={g}
                type="button"
                onClick={() => update('contributionGrade', g)}
                className={`px-2 py-1 rounded-md text-xs transition ${
                  filters.contributionGrade === g
                    ? 'bg-green-600 text-white'
                    : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 정렬 */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2a2a2a]">
        <span className="text-gray-500 text-xs">정렬</span>
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              if (filters.sortKey === opt.key) {
                update('sortDir', filters.sortDir === 'desc' ? 'asc' : 'desc')
              } else {
                onChange({ ...filters, sortKey: opt.key, sortDir: 'desc' })
              }
            }}
            className={`px-3 py-1 rounded-md text-xs transition flex items-center gap-1 ${
              filters.sortKey === opt.key
                ? 'bg-yellow-600 text-white font-medium'
                : 'bg-[#272727] text-gray-300 hover:bg-[#333]'
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
  )
}
