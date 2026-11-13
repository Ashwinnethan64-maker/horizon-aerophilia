import React from 'react';
import { useStore } from '../store/useStore';
import { translations } from '../i18n/translations';
import { CloudRain, Wrench, ShieldAlert, Sparkles, Sun, Info } from 'lucide-react';

export const ScenarioBar: React.FC = () => {
  const { activeScenarioId, setActiveScenarioId, isLoading, language } = useStore();
  const t = translations[language].scenarios;

  const scenarios = [
    {
      id: 'baseline',
      label: 'Normal Day',
      icon: Sun,
      description: 'Standard school timetable, 100% nominal travel times and demand.'
    },
    {
      id: 'exam_surge',
      label: 'Exam Day Surge',
      icon: Sparkles,
      description: '1.4x student demand across all stops with early 08:15 AM arrival deadlines.'
    },
    {
      id: 'monsoon_rain',
      label: 'Monsoon Rain',
      icon: CloudRain,
      description: 'Travel times +30% slower due to rural waterlogging and road conditions.'
    },
    {
      id: 'breakdown_b1',
      label: 'Bus B1 Breakdown',
      icon: Wrench,
      description: 'Northern trunk bus B1 unavailable; capacity removed from Route R1.'
    },
    {
      id: 'bridge_repair',
      label: 'Chandan Bridge Closure',
      icon: ShieldAlert,
      description: 'Route R2 temporarily closed at Stop S5 due to bridge maintenance.'
    }
  ];

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-yg-textSecondary uppercase tracking-wider shrink-0 mr-1">
          {t.label}
        </span>
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              type="button"
              disabled={isLoading}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all shrink-0 border-2 border-[#111111] cursor-pointer disabled:opacity-50 ${
                isActive
                  ? 'bg-[#FFD93D] text-[#111111] shadow-[3px_3px_0_0_#111111]'
                  : 'bg-white text-[#111111] hover:bg-[#EAF2FF]'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${isActive ? 'text-[#0866F5]' : 'text-[#454545]'}`}
              />
              {sc.label}
            </button>
          );
        })}
      </div>

      {activeScenario && activeScenario.id !== 'baseline' && (
        <div className="text-[11px] text-yg-secondary bg-yg-surfaceSubtle border border-yg-border px-3 py-1.5 rounded-lg flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-yg-primary shrink-0" />
          <span>
            <strong>Active Scenario:</strong> {activeScenario.description}
          </span>
          <button
            type="button"
            onClick={() => setActiveScenarioId('baseline')}
            className="ml-auto text-yg-primary font-bold hover:underline shrink-0"
          >
            Reset to Normal
          </button>
        </div>
      )}
    </div>
  );
};
