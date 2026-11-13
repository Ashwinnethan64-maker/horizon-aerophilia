import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const DemandHeatmap: React.FC = () => {
  const data = [
    { stop: 'Bari (S1)', demand: 24, capacityMorning: 35, capacityOptimized: 35 },
    { stop: 'Kishanpur (S2)', demand: 22, capacityMorning: 13, capacityOptimized: 30 },
    { stop: 'Rampur (S3)', demand: 18, capacityMorning: 6, capacityOptimized: 20 },
    { stop: 'Neelam (S4)', demand: 16, capacityMorning: 30, capacityOptimized: 25 },
    { stop: 'Chandan (S5)', demand: 16, capacityMorning: 18, capacityOptimized: 20 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 text-sm mb-3">Stop Demand vs Seats Offered (07:00 - 08:30)</h3>
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stop" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            <Bar dataKey="demand" fill="#f43f5e" name="Student Demand" radius={[4, 4, 0, 0]} />
            <Bar dataKey="capacityMorning" fill="#94a3b8" name="Baseline Seats" radius={[4, 4, 0, 0]} />
            <Bar dataKey="capacityOptimized" fill="#6366f1" name="Optimized Seats" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
