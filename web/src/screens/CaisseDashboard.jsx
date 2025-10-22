import React, { useEffect, useState } from 'react'
import axios from 'axios'
import KpiCard from '../components/KpiCard'
import ListWithFilters from '../components/ListWithFilters'
import Skeleton from '../components/Skeleton'

export default function CaisseDashboard() {
  const [sum, setSum] = useState(null)
  const [ops, setOps] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const [s, o] = await Promise.all([
      axios.get('/api/finance/summary'),
      axios.get('/api/finance/operations'),
    ])
    setSum(s.data); setOps(o.data); setLoading(false)
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
          <KpiCard label="Paiements aujourd'hui" value={sum.paymentsToday} />
          <KpiCard label="Total du jour" value={sum.totalToday.toLocaleString('fr-FR',{style:'currency',currency:'CDF'})} />
          <KpiCard label="Factures en attente" value={sum.pendingInvoices} />
          <KpiCard label="Remboursements" value={sum.refunds} />
        </div>
      )}

      <ListWithFilters
        title="Opérations du jour"
        data={ops}
        loading={loading}
        onRefresh={load}
        columns={[
          { key: 'id', header: '#' },
          { key: 'date', header: 'Date' },
          { key: 'type', header: 'Type' },
          { key: 'montant', header: 'Montant', render: (r)=> r.montant.toLocaleString('fr-FR', { style:'currency', currency:'CDF' }) },
          { key: 'statut', header: 'Statut' },
        ]}
        filters={[
          { key: 'type', label: 'Type', type: 'text' },
          { key: 'statut', label: 'Statut', type: 'select', options: [
            { value: 'ok', label: 'OK' },
          ] },
          { key: 'date', label: 'Date', type: 'date' },
        ]}
      />
    </div>
  )
}
