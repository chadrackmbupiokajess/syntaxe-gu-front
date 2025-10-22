import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function BibliothequeDashboard() {
  const [sum, setSum] = useState(null)
  const [res, setRes] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/library/summary'),
      axios.get('/api/library/gestion/reservations'),
    ])
    setSum(s.data); setRes(r.data); setLoading(false)
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
          <KpiCard label="Prêts actifs" value={sum.loansActive} />
          <KpiCard label="Retards" value={sum.overdue} />
          <KpiCard label="Catalogue" value={sum.catalog} />
          <KpiCard label="Réservations" value={sum.reservations} />
        </div>
      )}

      <ListWithFilters
        title="Réservations en attente"
        data={res}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'titre', header: 'Titre' },
          { key: 'lecteur', header: 'Lecteur' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'lecteur', label: 'Lecteur', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'select', options: [
            { value: 'en attente', label: 'En attente' },
            { value: 'confirmée', label: 'Confirmée' },
          ] },
        ]}
      />
    </div>
  )
}
