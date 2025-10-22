import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function ApparitoratDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/apparitorat/summary'),
      axios.get('/api/apparitorat/presences'),
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
          <KpiCard label="Présence aujourd'hui (%)" value={sum.attendanceToday} />
          <KpiCard label="Incidents" value={sum.incidents} />
        </div>
      )}

      <ListWithFilters
        title="Présences par auditoire"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'date', header: 'Date' },
          { key: 'auditoire', header: 'Auditoire' },
          { key: 'present', header: 'Présents' },
          { key: 'total', header: 'Total' },
        ]}
        filters={[
          { key: 'auditoire', label: 'Auditoire', type: 'text' },
          { key: 'date', label: 'Date', type: 'date' },
        ]}
      />
    </div>
  )
}
