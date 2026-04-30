import { useState } from 'react'

function formatCountdown(resetAt) {
  const diff = new Date(resetAt) - Date.now()
  if (diff <= 0) return '곧 초기화'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}시간 ${m}분 후 초기화`
}

export default function QuotaMonitor({ quota, remaining, percent, onReset }) {
  const [open, setOpen] = useState(false)

  const barColor =
    percent >= 90 ? 'bg-red-500' :
    percent >= 70 ? 'bg-orange-500' :
    percent >= 40 ? 'bg-yellow-500' :
    'bg-green-500'

  const statusColor =
    percent >= 90 ? 'text-red-400' :
    percent >= 70 ? 'text-orange-400' :
    percent >= 40 ? 'text-yellow-400' :
    'text-green-400'

  return (
    <div className="relative">
      {/* 토글 버튼 */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg px-3 py-1.5 text-xs transition"
      >
        <span className={`font-bold ${statusColor}`}>쿼터</span>
        <div className="w-16 h-1.5 bg-[#333] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
        <span className="text-gray-400">{quota.used.toLocaleString()} / 10,000</span>
        <span className="text-gray-600">{open ? '▲' : '▼'}</span>
      </button>

      {/* 상세 패널 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl z-40 overflow-hidden">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-semibold">API 쿼터 현황</span>
              <button
                onClick={onReset}
                className="text-gray-500 hover:text-red-400 text-xs transition"
              >
                초기화
              </button>
            </div>

            {/* 게이지 */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-bold ${statusColor}`}>사용: {quota.used.toLocaleString()} 유닛</span>
                <span className="text-gray-400">잔여: {remaining.toLocaleString()} 유닛</span>
              </div>
              <div className="w-full h-3 bg-[#333] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${percent}%` }} />
              </div>
              <div className="text-right text-[10px] text-gray-600 mt-1">
                {formatCountdown(quota.resetAt)}
              </div>
            </div>

            {/* 통계 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '일일 한도', value: '10,000' },
                { label: '사용', value: quota.used.toLocaleString() },
                { label: '잔여', value: remaining.toLocaleString() },
              ].map(item => (
                <div key={item.label} className="bg-[#272727] rounded-lg p-2 text-center">
                  <div className="text-gray-500 text-[10px]">{item.label}</div>
                  <div className="text-white text-xs font-bold mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>

            {/* 비용 안내 */}
            <div className="bg-[#272727] rounded-lg p-3 text-[10px] text-gray-400 space-y-1">
              <div className="text-gray-300 font-medium mb-1.5">검색 1회 쿼터 비용</div>
              <div className="flex justify-between"><span>50개 검색</span><span className="text-yellow-400">≈ 102 유닛</span></div>
              <div className="flex justify-between"><span>100개 검색</span><span className="text-yellow-400">≈ 204 유닛</span></div>
              <div className="flex justify-between"><span>150개 검색</span><span className="text-yellow-400">≈ 306 유닛</span></div>
              <div className="flex justify-between"><span>200개 검색</span><span className="text-yellow-400">≈ 408 유닛</span></div>
              <div className="border-t border-[#333] pt-1 mt-1 text-gray-600">
                하루 최대 약 24회 검색 가능 (200개 기준)
              </div>
            </div>

            {/* 사용 히스토리 */}
            {quota.history.length > 0 && (
              <div>
                <div className="text-gray-500 text-[10px] mb-1.5">최근 사용 내역</div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {quota.history.map((h, i) => (
                    <div key={i} className="flex justify-between text-[10px] text-gray-400">
                      <span className="text-gray-600">{h.time}</span>
                      <span className="truncate mx-2 max-w-[140px]">{h.label}</span>
                      <span className="text-yellow-500 whitespace-nowrap">-{h.cost} 유닛</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
