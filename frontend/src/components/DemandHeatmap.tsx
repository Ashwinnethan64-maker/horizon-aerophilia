import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';

export const DemandHeatmap: React.FC = () => {
  const { network, students } = useStore();
  const data = (network?.routes ?? []).map(route => {
    const assignedBuses = network!.buses.filter(bus => bus.routeId === route.id);
    const averageCapacity = assignedBuses.length
      ? assignedBuses.reduce((sum, bus) => sum + bus.capacity, 0) / assignedBuses.length
      : network!.buses[0]?.capacity ?? 40;
    return {
      stop: route.id,
      demand: students.filter(student => {
        if (student.routeId) return student.routeId === route.id;
        const home = route.stopIds.indexOf(student.homeStopId);
        return home >= 0 && route.stopIds.indexOf(student.destinationId) > home;
      }).length,
      capacityMorning: assignedBuses.reduce((sum, bus) => sum + bus.capacity, 0),
      capacityOptimized: (network!.optimizedAllocation?.[route.id] ?? assignedBuses.length) * averageCapacity
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-800 text-sm mb-3">Route Demand vs Seats per Morning Run</h3>
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

