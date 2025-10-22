import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function ITDashboard() {
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/it/summary'),
      axios.get('/api/it/incidents'),
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
          <KpiCard label="Incidents ouverts" value={sum.incidentsOpen} />
          <KpiCard label="Déploiements" value={sum.deployments} />
          <KpiCard label="Disponibilité (%)" value={sum.uptime} />
        </div>
      )}

      <ListWithFilters
        title="Incidents"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'date', header: 'Date' },
          { key: 'service', header: 'Service' },
          { key: 'priorite', header: 'Priorité' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'service', label: 'Service', type: 'text' },
          { key: 'priorite', label: 'Priorité', type: 'select', options: [
            { value: 'haute', label: 'Haute' },
            { value: 'moyenne', label: 'Moyenne' },
          ] },
          { key: 'statut', label: 'Statut', type: 'text' },
        ]}
      />
    </div>
  )
}
