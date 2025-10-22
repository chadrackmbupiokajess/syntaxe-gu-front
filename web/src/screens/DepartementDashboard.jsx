import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function DepartementDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/department/summary'),
      axios.get('/api/department/list'),
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
          <KpiCard label="Départements" value={sum.departments} />
          <KpiCard label="Cours" value={sum.courses} />
          <KpiCard label="Auditoires" value={sum.auditoriums} />
        </div>
      )}

      <ListWithFilters
        title="Départements"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'code', header: 'Code' },
          { key: 'intitule', header: 'Intitulé' },
          { key: 'chefs', header: 'Nb. Chefs' },
        ]}
        filters={[
          { key: 'code', label: 'Code', type: 'text' },
          { key: 'intitule', label: 'Intitulé', type: 'text' },
        ]}
      />
    </div>
  )
}
