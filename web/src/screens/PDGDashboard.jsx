import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'
import { useToast } from '../shared/ToastProvider'

export default function PDGDashboard() {
  const { push } = useToast()
  const [d, setD] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [s, l] = await Promise.all([
        axios.get('/api/pdg/summary'),
        axios.get('/api/pdg/activities'),
      ])
      setD(s.data)
      setRows(l.data)
    } catch (e) {
      push({ kind: 'error', title: 'Erreur', message: "Impossible de charger les données PDG" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="grid gap-4">
      {!d ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Étudiants" value={d.students} />
          <KpiCard label="Personnel" value={d.staff} />
          <KpiCard label="Revenus YTD" value={d.revenueYTD} />
          <KpiCard label="Satisfaction (%)" value={d.satisfaction} />
        </div>
      )}

      <ListWithFilters
        title="Activités stratégiques"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'type', header: 'Type' },
          { key: 'intitule', header: 'Intitulé' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'select', options: [
            { value: 'planifié', label: 'Planifié' },
            { value: 'en cours', label: 'En cours' },
            { value: 'terminé', label: 'Terminé' },
          ] },
          { key: 'date', label: 'Date', type: 'date' },
        ]}
        actions={[
          { label: 'Détails', onClick: (row) => push({ kind: 'success', title: 'Détails', message: row.intitule }) },
        ]}
      />
    </div>
  )
}
