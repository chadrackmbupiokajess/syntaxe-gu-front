import React from 'react';

export default function KpiCard({ label, value, hint, icon, color = 'bg-white dark:bg-slate-800' }) {
  return (
    <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 text-black dark:text-white ${color}`}>
      {icon && <div className="text-4xl opacity-90">{icon}</div>}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider opacity-90">{label}</div>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        {hint && <div className="text-xs opacity-80 mt-1">{hint}</div>}
      </div>
    </div>
  );
}
