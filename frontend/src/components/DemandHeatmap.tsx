import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../store/useStore';
import { translations } from '../i18n/translations';
import type { Bus, Route } from '../../../contracts/types.js';
import { BarChart2, AlertCircle } from 'lucide-react';

type SlotFilter = 'all' | 'early' | 'late';

function parseHHMM(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function estimateSeatsForStop(
  stopId: string,
  buses: Bus[],
  routes: Route[],
  slot: SlotFilter
): number {
  let seats = 0;
  for (const bus of buses) {
    const route = routes.find((r) => r.id === bus.routeId);
    if (!route) continue;
    const stopIndex = route.stopIds.indexOf(stopId);
    if (stopIndex === -1 || stopId === route.destinationStopId) continue;

    let offsetMin = 0;
    for (let i = 0; i < stopIndex; i++) {
      offsetMin += route.travelMinutes[i] ?? 15;
    }

    for (const dep of bus.departureTimes) {
      const arrivalAtStop = parseHHMM(dep) + offsetMin;
      if (arrivalAtStop >= 11 * 60) continue;
      if (slot === 'early' && arrivalAtStop > 8 * 60 + 15) continue;
      if (slot === 'late' && (arrivalAtStop <= 8 * 60 + 15 || arrivalAtStop > 10 * 60)) continue;
      seats += bus.capacity;
    }
  }
  return seats;
}

export const DemandHeatmap: React.FC = () => {
  const { network, students, currentSchedule, optimizedSchedule, activeScenarioId, language } = useStore();
  const t = translations[language].heatmap;
  const [slot, setSlot] = useState<SlotFilter>('all');

  const data = useMemo(() => {
    if (!network) return [];
    const terminalIds = new Set(network.routes.map((r) => r.destinationStopId));
    const demandMultiplier = activeScenarioId === 'exam_surge' ? 1.4 : 1;

    return network.stops
      .filter((s) => !terminalIds.has(s.id))
      .map((stop) => {
        const stopStudents = students.filter((st) => {
          if (st.homeStopId !== stop.id) return false;
          const arriveMin = parseHHMM(st.arriveBy);
          if (slot === 'early') return arriveMin <= 8 * 60 + 15;
          if (slot === 'late') return arriveMin > 8 * 60 + 15;
          return true;
        });

        const demand = Math.round(stopStudents.length * demandMultiplier);
        const baselineSeats = estimateSeatsForStop(
          stop.id,
          currentSchedule.length > 0 ? currentSchedule : network.buses,
          network.routes,
          slot
        );
        const optimizedSeats = optimizedSchedule
          ? estimateSeatsForStop(stop.id, optimizedSchedule, network.routes, slot)
          : undefined;

        const overCapacityBaseline = Math.max(0, demand - baselineSeats);
        const overCapacityOptimized =
          optimizedSeats !== undefined ? Math.max(0, demand - optimizedSeats) : undefined;

        return {
          stop: `${stop.name.split(' ')[0]} (${stop.id})`,
          demand,
          baselineSeats,
          ...(optimizedSeats !== undefined ? { optimizedSeats } : {}),
          overCapacityBaseline,
          overCapacityOptimized
        };
      });
  }, [network, students, currentSchedule, optimizedSchedule, activeScenarioId, slot]);

  // Find stop with highest deficit in baseline
  const worstStop = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.overCapacityBaseline - a.overCapacityBaseline)[0];
  }, [data]);

  if (!network) {
    return (
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5 text-xs text-yg-textSecondary text-center">
        Loading stop demand analytics...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[4px] shadow-[4px_4px_0_0_#111111] border-2 border-[#111111] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#0866F5]" />
          <h3 className="font-display font-bold text-[#111111] text-sm">
            {t.title}
          </h3>
        </div>

        {/* Time slot toggle tabs */}
        <div className="flex items-center bg-[#F6F4EA] p-0.5 rounded-[4px] text-xs font-bold border-2 border-[#111111]">
          {(
            [
              { id: 'all', label: 'All Morning' },
              { id: 'early', label: '≤ 08:15 AM' },
              { id: 'late', label: '> 08:15 AM' }
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSlot(tab.id)}
              className={`px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer ${
                slot === tab.id
                  ? 'bg-[#0866F5] text-white'
                  : 'text-[#454545] hover:text-[#111111]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessible Bottleneck Callout */}
      {worstStop && worstStop.overCapacityBaseline > 0 && (
        <div className="mb-3 p-2.5 bg-[#FFD93D]/40 border-2 border-[#111111] rounded-[4px] flex items-center gap-2 text-xs text-[#111111]">
          <AlertCircle className="w-4 h-4 text-[#D93636] shrink-0" />
          <span>
            <strong>Capacity Pressure:</strong> {worstStop.stop} is over baseline capacity by{' '}
            <strong>{worstStop.overCapacityBaseline} students</strong> during morning rush.
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-60 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="stop" stroke="#60736B" fontSize={11} tickLine={false} />
            <YAxis stroke="#60736B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#16324F',
                borderColor: '#334E68',
                borderRadius: '8px',
                color: '#FFFFFF',
                fontSize: '12px'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="demand" fill="#D93636" name="Student Demand" radius={[2, 2, 0, 0]} />
            <Bar dataKey="baselineSeats" fill="#10233F" name="Baseline Seats" radius={[2, 2, 0, 0]} />
            {optimizedSchedule && (
              <Bar dataKey="optimizedSeats" fill="#0866F5" name="Optimized Seats" radius={[2, 2, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
