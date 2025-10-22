import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'
import { useToast } from '../shared/ToastProvider'

export default function SgaDashboard() {
  const { push } = useToast()
  const [sum, setSum] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, r] = await Promise.all([
      axios.get('/api/sga/summary'),
      axios.get('/api/sga/demandes'),
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
          <KpiCard label="Inscriptions en attente" value={sum.enrollmentsPending} />
          <KpiCard label="Auditoires gérés" value={sum.auditoriumsManaged} />
        </div>
      )}

      <ListWithFilters
        title="Demandes administratives"
        data={rows}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'type', header: 'Type' },
          { key: 'etudiant', header: 'Étudiant' },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'select', options: [
            { value: 'en attente', label: 'En attente' },
            { value: 'validé', label: 'Validé' },
          ] },
        ]}
        actions={[
          { label: 'Traiter', onClick: (row) => push({ title: 'Traitement', message: `Demande ${row.id} traitée (mock)` }) },
        ]}
      />
    </div>
  )
}
