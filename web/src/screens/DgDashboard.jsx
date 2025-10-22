import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'
import { useToast } from '../shared/ToastProvider'

export default function DgDashboard() {
  const { push } = useToast()
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, r] = await Promise.all([
        axios.get('/api/dg/summary'),
        axios.get('/api/dg/actions'),
      ])
      setSum(s.data); setRows(r.data)
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() },[])

  return (
    <div className="grid gap-4">
      {!sum ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
          <Skeleton className="h-20"/>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Décisions en attente" value={sum.decisionsPending} />
          <KpiCard label="Projets" value={sum.projects} />
          <KpiCard label="Budget utilisé (%)" value={sum.budgetUsed} />
          <KpiCard label="Satisfaction (%)" value={sum.satisfaction} />
        </div>
      )}

      <ListWithFilters
        title="Actions récentes"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'date', header: 'Date' },
          { key: 'domaine', header: 'Domaine' },
          { key: 'action', header: 'Action' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'domaine', label: 'Domaine', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'text' },
        ]}
        actions={[
          { label: 'Détails', onClick: (row) => push({ title: 'Détails', message: row.action }) },
        ]}
      />
    </div>
  )
}
