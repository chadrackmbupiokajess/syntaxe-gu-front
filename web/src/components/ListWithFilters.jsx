import React, { useMemo, useState } from 'react'

export default function ListWithFilters({
  title = 'Liste',
  data = [],
  columns = [], // [{ key, header, render?: (row)=>node }]
  filters = [], // [{ key, label, type: 'text'|'select'|'date', options?:[{value,label}], placeholder?:string}]
  loading = false,
  skeletonRows = 5,
  actions = [], // per-row actions [{ label, onClick:(row)=>void }]
  onRefresh,
}) {
  const [filterState, setFilterState] = useState(() => Object.fromEntries(filters.map(f => [f.key, ''])))

  const filtered = useMemo(() => {
    return data.filter(row => {
      return filters.every(f => {
        const val = (filterState[f.key] ?? '').toString().toLowerCase()
        if (!val) return true
        const rowVal = (row[f.key] ?? '').toString().toLowerCase()
        if (f.type === 'text') return rowVal.includes(val)
        if (f.type === 'select') return rowVal === val
        if (f.type === 'date') return rowVal.startsWith(val)
        return true
      })
    })
  }, [data, filters, filterState])

  return (
    <div className="card p-4 bg-white dark:bg-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-black dark:text-white">{title}</h3>
        {onRefresh && (
          <button className="btn btn-sm dark:text-white dark:hover:bg-slate-700" onClick={onRefresh}>Rafraîchir</button>
        )}
      </div>

      {filters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-3">
          {filters.map(f => (
            <div key={f.key} className="flex flex-col">
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  className="input dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  value={filterState[f.key] || ''}
                  onChange={e => setFilterState(s => ({ ...s, [f.key]: e.target.value }))}
                >
                  <option value="">Tous</option>
                  {(f.options || []).map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="input dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  type={f.type === 'date' ? 'date' : 'text'}
                  value={filterState[f.key] || ''}
                  onChange={e => setFilterState(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder || `Filtrer par ${f.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 dark:text-slate-300">
              {columns.map(col => (
                <th key={col.key} className="py-2 pr-4 font-medium">{col.header}</th>
              ))}
              {actions.length > 0 && <th className="py-2 pr-4 font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map(col => (
                    <td key={col.key} className="py-2 pr-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-2 pr-4">
                      <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                  )}
                </tr>
              ))
            ) : (
              filtered.map((row, idx) => (
                <tr key={idx} className="border-t border-slate-200/60 dark:border-slate-800/60 text-black dark:text-white">
                  {columns.map(col => (
                    <td key={col.key} className="py-2 pr-4">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        {actions.map((a, i) => (
                          <button key={i} className="btn btn-xs dark:text-white dark:hover:bg-slate-700" onClick={() => a.onClick(row)}>{a.label}</button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
