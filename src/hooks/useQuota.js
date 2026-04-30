import { useState, useEffect, useCallback } from 'react'

const DAILY_LIMIT = 10000
const STORAGE_KEY = 'yt_quota'

// YouTube API 쿼터 비용
export const QUOTA_COST = {
  search: 100,      // search.list 1회
  videos: 1,        // videos.list 1회 (50개 배치)
  channels: 1,      // channels.list 1회 (50개 배치)
}

function getResetTime() {
  // YouTube 쿼터는 태평양 표준시 자정 기준 초기화
  const now = new Date()
  const pst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const nextMidnight = new Date(pst)
  nextMidnight.setDate(nextMidnight.getDate() + 1)
  nextMidnight.setHours(0, 0, 0, 0)
  const diffMs = nextMidnight - pst
  return new Date(Date.now() + diffMs)
}

function loadQuota() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveQuota(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function isNewDay(resetAt) {
  return Date.now() >= new Date(resetAt).getTime()
}

export function useQuota() {
  const [quota, setQuota] = useState(() => {
    const saved = loadQuota()
    if (!saved || isNewDay(saved.resetAt)) {
      return { used: 0, resetAt: getResetTime().toISOString(), history: [] }
    }
    return saved
  })

  // 매분 자동 갱신 (초기화 체크)
  useEffect(() => {
    const timer = setInterval(() => {
      setQuota(prev => {
        if (isNewDay(prev.resetAt)) {
          const fresh = { used: 0, resetAt: getResetTime().toISOString(), history: [] }
          saveQuota(fresh)
          return fresh
        }
        return prev
      })
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  const addUsage = useCallback((cost, label) => {
    setQuota(prev => {
      const entry = {
        time: new Date().toLocaleTimeString('ko-KR'),
        label,
        cost,
      }
      const next = {
        ...prev,
        used: prev.used + cost,
        history: [entry, ...prev.history].slice(0, 20),
      }
      saveQuota(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const fresh = { used: 0, resetAt: getResetTime().toISOString(), history: [] }
    saveQuota(fresh)
    setQuota(fresh)
  }, [])

  const remaining = Math.max(0, DAILY_LIMIT - quota.used)
  const percent = Math.min(100, (quota.used / DAILY_LIMIT) * 100)

  return { quota, remaining, percent, addUsage, reset }
}
