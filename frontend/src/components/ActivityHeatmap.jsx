import React, { useMemo } from 'react'

const DAYS   = ['S','M','T','W','T','F','S']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKS  = 16

function getColor(count) {
  if (!count)     return 'var(--surface-2)'
  if (count < 2)  return 'rgba(37,99,235,0.25)'
  if (count < 4)  return 'rgba(37,99,235,0.50)'
  if (count < 6)  return 'rgba(37,99,235,0.75)'
  return 'rgba(96,165,250,0.95)'
}

export default function ActivityHeatmap({ activity = [] }) {
  const cells = useMemo(() => {
    const map = {}
    activity.forEach(d => { const k = d.date || d.day || d; map[k] = (map[k] || 0) + 1 })
    const result = []
    const now = new Date()
    for (let w = WEEKS - 1; w >= 0; w--) {
      const week = []
      for (let d = 0; d < 7; d++) {
        const date = new Date(now)
        date.setDate(now.getDate() - (w * 7 + (6 - d)))
        const key = date.toISOString().split('T')[0]
        week.push({ date: key, count: map[key] || 0, month: date.getMonth() })
      }
      result.push(week)
    }
    return result
  }, [activity])

  if (!activity.length) return (
    <div style={{ textAlign: 'center', padding: 'var(--s8)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
      No activity data yet — complete interviews to see your heatmap.
    </div>
  )

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        <div style={{ width: 20 }} />
        {cells.map((week, wi) => {
          const m = week[0].month
          const prev = wi > 0 ? cells[wi - 1][0].month : -1
          return (
            <div key={wi} style={{ width: 12, fontSize: '0.6rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              {m !== prev ? MONTHS[m].slice(0, 1) : ''}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', gap: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginRight: 2 }}>
          {DAYS.map((d, i) => (
            <div key={i} style={{ height: 12, fontSize: '0.58rem', color: 'var(--text-dim)', lineHeight: '12px', textAlign: 'right', paddingRight: 2 }}>
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        {cells.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.date}: ${cell.count} session${cell.count !== 1 ? 's' : ''}`}
                style={{ width: 12, height: 12, borderRadius: 2, background: getColor(cell.count), cursor: 'default', transition: 'opacity 0.15s' }}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>Less</span>
        {[0,1,3,5,7].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: 2, background: getColor(c) }} />)}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>More</span>
      </div>
    </div>
  )
}
