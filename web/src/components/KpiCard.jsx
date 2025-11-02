import React from 'react';

const colorClasses = {
  blue: 'bg-blue-500 dark:bg-blue-800 text-white',
  green: 'bg-green-500 dark:bg-green-800 text-white',
  orange: 'bg-orange-500 dark:bg-orange-800 text-white',
  red: 'bg-red-500 dark:bg-red-800 text-white',
  default: 'bg-white dark:bg-slate-800 text-black dark:text-white',
};

export default function KpiCard({ label, value, hint, icon, color = 'default' }) {
  const bgColor = colorClasses[color] || colorClasses.default;

  return (
    <div className={`p-6 rounded-xl shadow-lg flex items-center space-x-4 ${bgColor}`}>
      {icon && <div className="text-4xl opacity-90">{icon}</div>}
      <div>
        <div className="text-sm font-semibold uppercase tracking-wider opacity-90">{label}</div>
        <div className="mt-1 text-3xl font-bold">{value}</div>
        {hint && <div className="text-xs opacity-80 mt-1">{hint}</div>}
      </div>
    </div>
  );
}
