import React from 'react';

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  orange: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
  red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
  purple: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
  yellow: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
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
