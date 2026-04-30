import { useState } from 'react'

const HISTORY_KEY = 'yt_search_history'
const MAX_HISTORY = 15

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState(loadHistory)

  function addHistory(query, videos, pages) {
    setHistory(prev => {
      // 동일 검색어가 있으면 제거 후 최신으로 추가
      const filtered = prev.filter(h => h.query !== query)
      const newEntry = {
        id: Date.now(),
        query,
        timestamp: new Date().toISOString(),
        pages,
        videos, // 전체 영상 데이터 캐시
      }
      const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function removeHistory(id) {
    setHistory(prev => {
      const updated = prev.filter(h => h.id !== id)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      return updated
    })
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY)
    setHistory([])
  }

  return { history, addHistory, removeHistory, clearHistory }
}
