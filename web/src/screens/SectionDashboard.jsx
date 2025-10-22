import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function SectionDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/section/summary'),
      axios.get('/api/section/list'),
    ])
    setSum(s.data); setRows(r.data); setLoading(false)
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
          <KpiCard label="Sections" value={sum.sections} />
          <KpiCard label="Chefs" value={sum.heads} />
          <KpiCard label="Taux de remplissage (%)" value={sum.kpis?.fillRate} />
        </div>
      )}

      <ListWithFilters
        title="Sections"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'code', header: 'Code' },
          { key: 'intitule', header: 'Intitulé' },
          { key: 'effectif', header: 'Effectif' },
        ]}
        filters={[
          { key: 'code', label: 'Code', type: 'text' },
          { key: 'intitule', label: 'Intitulé', type: 'text' },
        ]}
      />
    </div>
  )
}
