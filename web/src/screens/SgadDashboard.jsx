import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function SgadDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/sgad/summary'),
      axios.get('/api/sgad/paie'),
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
          <KpiCard label="Actions paie" value={sum.payrollActions} />
          <KpiCard label="Rapports financiers" value={sum.financeReports} />
        </div>
      )}

      <ListWithFilters
        title="Traitements de paie"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'agent', header: 'Agent' },
          { key: 'mois', header: 'Mois' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'agent', label: 'Agent', type: 'text' },
          { key: 'mois', label: 'Mois', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'text' },
        ]}
      />
    </div>
  )
}
