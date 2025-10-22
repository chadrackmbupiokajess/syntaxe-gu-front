import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function JuryDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/jury/summary'),
      axios.get('/api/jury/defenses'),
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
          <KpiCard label="Soutenances à venir" value={sum.defensesUpcoming} />
          <KpiCard label="Rapports en attente" value={sum.reportsPending} />
        </div>
      )}

      <ListWithFilters
        title="Soutenances"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'etudiant', header: 'Étudiant' },
          { key: 'sujet', header: 'Sujet' },
          { key: 'date', header: 'Date' },
          { key: 'jury', header: 'Jury' },
        ]}
        filters={[
          { key: 'etudiant', label: 'Étudiant', type: 'text' },
          { key: 'jury', label: 'Jury', type: 'text' },
          { key: 'date', label: 'Date', type: 'date' },
        ]}
      />
    </div>
  )
}
