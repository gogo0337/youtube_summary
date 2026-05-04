import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const CACHE_PREFIX = 'yt_trending_v3_' // v3: categoryId 필드 추가
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

function isTodaysCached(data) {
  if (!data?.date) return false
  const cached = new Date(data.date)
  const now = new Date()
  return (
    cached.getFullYear() === now.getFullYear() &&
    cached.getMonth() === now.getMonth() &&
    cached.getDate() === now.getDate()
  )
}

function loadCache(categoryId) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + categoryId)
    if (!raw) return null
    const data = JSON.parse(raw)
    return isTodaysCached(data) ? data : null
  } catch {
    return null
  }
}

function saveCache(categoryId, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + categoryId, JSON.stringify(data))
  } catch {
    // localStorage 용량 초과 시 무시
  }
}

export function useTrending(onQuotaUsed) {
  const [trendingMap, setTrendingMap] = useState({})
  const [activeCategory, setActiveCategory] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const onQuotaUsedRef = useRef(onQuotaUsed)
  onQuotaUsedRef.current = onQuotaUsed

  async function fetchCategory(categoryId, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = loadCache(categoryId)
      if (cached) {
        setTrendingMap(prev => ({ ...prev, [categoryId]: cached }))
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${BASE_URL}/videos`, {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: 'KR',
          maxResults: 20,
          videoCategoryId: categoryId,
          key: API_KEY,
        },
      })

      const videos = (res.data.items || []).map(v => ({
        videoId: v.id,
        title: v.snippet.title,
        channelTitle: v.snippet.channelTitle,
        thumbnail: v.snippet.thumbnails?.medium?.url || '',
        viewCount: parseInt(v.statistics?.viewCount || 0),
        likeCount: parseInt(v.statistics?.likeCount || 0),
        commentCount: parseInt(v.statistics?.commentCount || 0),
        publishedAt: v.snippet.publishedAt,
        categoryId: v.snippet.categoryId || '',
      }))

      const data = { date: new Date().toISOString(), videos }
      saveCache(categoryId, data)
      setTrendingMap(prev => ({ ...prev, [categoryId]: data }))

      // 쿼터 1유닛 소모 (videos.list 1회)
      if (onQuotaUsedRef.current) {
        onQuotaUsedRef.current(1, `트렌드 조회 (카테고리 ${categoryId})`)
      }
    } catch (e) {
      console.error('Trending fetch error:', e)
      setError('트렌드 데이터를 불러오지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  function switchCategory(categoryId) {
    setActiveCategory(categoryId)
    if (!trendingMap[categoryId]) {
      fetchCategory(categoryId)
    }
  }

  function refresh(categoryId) {
    const target = categoryId ?? activeCategory
    // 캐시 삭제 후 재조회
    try { localStorage.removeItem(CACHE_PREFIX + target) } catch {}
    setTrendingMap(prev => {
      const next = { ...prev }
      delete next[target]
      return next
    })
    fetchCategory(target, true)
  }

  // 앱 시작 시 전체 카테고리 조회
  useEffect(() => {
    fetchCategory('0')
  }, [])

  const currentData = trendingMap[activeCategory]

  return {
    trending: currentData?.videos || [],
    updatedAt: currentData?.date || null,
    loading,
    error,
    activeCategory,
    switchCategory,
    refresh,
  }
}
