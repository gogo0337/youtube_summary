import { useState, useMemo } from 'react'
import SearchBar from './components/SearchBar'
import ResultFilter from './components/ResultFilter'
import VideoTable from './components/VideoTable'
import VideoModal from './components/VideoModal'
import QuotaMonitor from './components/QuotaMonitor'
import { searchVideos } from './api/youtube'
import { useQuota } from './hooks/useQuota'

const DEFAULT_FILTERS = {
  includeShorts: false,
  performanceGrade: '전체',
  contributionGrade: '전체',
  sortKey: 'viewCount',
  sortDir: 'desc',
}

function getPublishedAfter(days) {
  if (!days) return undefined
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function applyFiltersAndSort(videos, filters) {
  let result = [...videos]
  if (!filters.includeShorts) result = result.filter(v => !v.isShorts)
  if (filters.performanceGrade !== '전체') result = result.filter(v => v.performance?.grade === filters.performanceGrade)
  if (filters.contributionGrade !== '전체') result = result.filter(v => v.contribution?.grade === filters.contributionGrade)

  result.sort((a, b) => {
    let av, bv
    if (filters.sortKey === 'performance') { av = a.performance?.score; bv = b.performance?.score }
    else if (filters.sortKey === 'contribution') { av = a.contribution?.score; bv = b.contribution?.score }
    else if (filters.sortKey === 'publishedAt') { av = new Date(a.publishedAt); bv = new Date(b.publishedAt) }
    else { av = a[filters.sortKey]; bv = b[filters.sortKey] }
    return filters.sortDir === 'desc' ? bv - av : av - bv
  })
  return result
}

export default function App() {
  const [allVideos, setAllVideos] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [searchDone, setSearchDone] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')

  const { quota, remaining, percent, addUsage, reset } = useQuota()

  const displayVideos = useMemo(() => applyFiltersAndSort(allVideos, filters), [allVideos, filters])

  async function handleSearch(opts) {
    if (remaining <= 100) {
      setError(`쿼터가 부족합니다. 잔여: ${remaining} 유닛 (검색 최소 100 유닛 필요)`)
      return
    }

    setLoading(true)
    setError('')
    setAllVideos([])
    setSearchDone(false)
    setFilters(DEFAULT_FILTERS)

    try {
      setLoadingMsg(`YouTube 검색 중... (최대 ${opts.pages * 50}개)`)
      const publishedAfter = getPublishedAfter(opts.period)
      const { videos, quotaUsed } = await searchVideos(opts.query, { publishedAfter, pages: opts.pages })

      addUsage(quotaUsed, `"${opts.query}" ${opts.pages * 50}개`)
      setAllVideos(videos)
      setSearchDone(true)
    } catch (e) {
      console.error(e)
      if (e.response?.status === 403) {
        setError('API 쿼터를 초과했거나 키가 유효하지 않습니다. Google Cloud Console을 확인해주세요.')
      } else {
        setError('검색 중 오류가 발생했습니다.')
      }
    } finally {
      setLoading(false)
      setLoadingMsg('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <header className="bg-[#111] border-b border-[#2a2a2a] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="text-red-500 text-2xl">▶</div>
          <div>
            <h1 className="text-white text-lg font-bold leading-none">YouTube 영상 분석기</h1>
            <p className="text-gray-500 text-xs mt-0.5">알고리즘 인기 영상 탐색 도구</p>
          </div>
        </div>
        <QuotaMonitor quota={quota} remaining={remaining} percent={percent} onReset={reset} />
      </header>

      <main className="max-w-screen-xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">{loadingMsg}</span>
          </div>
        )}

        {searchDone && !loading && (
          <>
            <ResultFilter
              filters={filters}
              onChange={setFilters}
              total={allVideos.length}
              filtered={displayVideos.length}
            />
            {displayVideos.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-3">🔍</div>
                <p>필터 조건에 맞는 영상이 없습니다. 조건을 조정해보세요.</p>
              </div>
            ) : (
              <VideoTable videos={displayVideos} onVideoClick={setSelectedVideo} />
            )}
          </>
        )}

        {!searchDone && !loading && (
          <div className="text-center py-24 text-gray-600">
            <div className="text-5xl mb-4">📺</div>
            <p className="text-lg text-gray-500">검색어를 입력해서 YouTube 영상을 분석해보세요</p>
            <p className="text-sm mt-2">조회수, 구독자, 실적도, 공헌도 등 다양한 지표 확인</p>
          </div>
        )}
      </main>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  )
}
