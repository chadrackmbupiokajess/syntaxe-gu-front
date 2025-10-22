import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

const ToastCtx = createContext({ push: () => {} })

function ToastItem({ t, onClose }) {
  return (
    <div className={`pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/80 backdrop-blur shadow-lg ring-1 ring-black/5 transition transform ${t.kind==='error'?'border-red-300/60 dark:border-red-800/60':''}`}>
      <div className="p-4 flex items-start gap-3">
        <div className={`mt-0.5 w-2 h-2 rounded-full ${t.kind==='error'?'bg-red-500':'bg-emerald-500'}`}></div>
        <div className="flex-1">
          <p className="text-sm font-medium">{t.title || (t.kind==='error'?'Erreur':'Succès')}</p>
          {t.message && <p className="text-sm text-slate-500 dark:text-slate-400">{t.message}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2)
    setItems((arr) => [...arr, { id, ...toast }])
    setTimeout(() => setItems(arr => arr.filter(x => x.id !== id)), toast.duration || 3000)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 flex items-end gap-2 p-4 sm:items-start sm:p-6 z-[60]">
        <div className="flex w-full flex-col items-center gap-2 sm:items-end">
          {items.map(t => (
            <ToastItem key={t.id} t={t} onClose={() => setItems(arr => arr.filter(x => x.id !== t.id))} />
          ))}
        </div>
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  return useContext(ToastCtx)
}
