import React from 'react';
import { useStore } from '../store/useStore';
import { CloudRain, Wrench, ShieldAlert, Sparkles, Sun } from 'lucide-react';

export const ScenarioBar: React.FC = () => {
  const { activeScenarioId, setActiveScenarioId } = useStore();

  const scenarios = [
    { id: 'baseline', label: 'Normal Day', icon: Sun },
    { id: 'exam_surge', label: 'Exam Surge (1.4x)', icon: Sparkles },
    { id: 'monsoon_rain', label: 'Monsoon Rain', icon: CloudRain },
    { id: 'breakdown_b1', label: 'Bus Breakdown', icon: Wrench },
    { id: 'bridge_repair', label: 'Bridge Closure', icon: ShieldAlert }
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
        Scenarios:
      </span>
      {scenarios.map((sc) => {
        const Icon = sc.icon;
        const isActive = activeScenarioId === sc.id;
        return (
          <button
            key={sc.id}
            onClick={() => setActiveScenarioId(sc.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
              isActive
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
            {sc.label}
          </button>
        );
      })}
    </div>
  );
};
