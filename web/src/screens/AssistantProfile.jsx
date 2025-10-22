import React, { useEffect, useState } from 'react'
import axios from 'axios'

export default function AssistantProfile() {
  const [p, setP] = useState(null)
  useEffect(() => { axios.get('/api/teacher/profile').then(r => setP(r.data)) }, [])
  if (!p) return <div className="card p-4">Chargement...</div>
  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4">
      <div className="card p-4 text-center">
        <img src={p.avatar} alt={p.name} className="w-32 h-32 rounded-full mx-auto" />
        <div className="mt-3 font-semibold">{p.name}</div>
        <div className="text-sm text-slate-500">{p.department} • {p.faculty}</div>
      </div>
      <div className="card p-4">
        <h3 className="text-lg font-semibold mb-2">Informations</h3>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="text-slate-500">Email</div><div>{p.email}</div>
          <div className="text-slate-500">Téléphone</div><div>{p.phone}</div>
          <div className="text-slate-500">Bureau</div><div>{p.office}</div>
          <div className="text-slate-500">Département</div><div>{p.department}</div>
          <div className="text-slate-500">Faculté</div><div>{p.faculty}</div>
        </div>
      </div>
    </div>
  )
}
