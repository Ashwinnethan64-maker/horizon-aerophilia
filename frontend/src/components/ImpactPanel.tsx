import React from 'react';
import { useStore } from '../store/useStore';
import { Users, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

export const ImpactPanel: React.FC = () => {
  const { baselineResult, optimizedResult, viewingOptimized } = useStore();

  const baseline = baselineResult?.metrics;
  const current = viewingOptimized && optimizedResult ? optimizedResult.metrics : baseline;

  if (!current) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
        Loading impact metrics...
      </div>
    );
  }

  const getDeltaBadge = (currVal: number, baseVal?: number, lowerIsBetter: boolean = false) => {
    if (!baseVal || !viewingOptimized || !optimizedResult) return null;
    const diff = currVal - baseVal;
    if (diff === 0) return null;

    const isGood = lowerIsBetter ? diff < 0 : diff > 0;
    const sign = diff > 0 ? '+' : '';
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
      }`}>
        {sign}{typeof diff === 'number' && !Number.isInteger(diff) ? diff.toFixed(1) : diff}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h2 className="font-semibold text-slate-800 text-base mb-4 flex items-center justify-between">
        <span>Performance & Viability Metrics</span>
        {viewingOptimized && (
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
            Showing Optimized Plan
          </span>
        )}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Served On Time
            </span>
            {getDeltaBadge(current.servedOnTime, baseline?.servedOnTime)}
          </div>
          <div className="text-2xl font-bold text-slate-900">{current.servedOnTime}</div>
          <div className="text-xs text-slate-400 mt-1">students reached school</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Stranded
            </span>
            {getDeltaBadge(current.stranded, baseline?.stranded, true)}
          </div>
          <div className="text-2xl font-bold text-rose-600">{current.stranded}</div>
          <div className="text-xs text-slate-400 mt-1">could not board on time</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Avg Wait Time
            </span>
            {getDeltaBadge(current.avgWaitMin, baseline?.avgWaitMin, true)}
          </div>
          <div className="text-2xl font-bold text-slate-900">{current.avgWaitMin}m</div>
          <div className="text-xs text-slate-400 mt-1">stop waiting time</div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Load Factor
            </span>
            {getDeltaBadge(Math.round(current.loadFactor * 100), baseline ? Math.round(baseline.loadFactor * 100) : undefined)}
          </div>
          <div className="text-2xl font-bold text-slate-900">{Math.round(current.loadFactor * 100)}%</div>
          <div className="text-xs text-slate-400 mt-1">average capacity utilization</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <span className="text-slate-500">Revenue: </span>
            <strong className="text-emerald-700">₹{current.revenue}</strong>
          </div>
          <div>
            <span className="text-slate-500">Operating Cost: </span>
            <strong className="text-slate-700">₹{current.cost}</strong>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Viability Gap:</span>
          <span className={`text-sm font-bold px-2.5 py-1 rounded-md ${
            current.viabilityGap === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            ₹{current.viabilityGap}
          </span>
        </div>
      </div>
    </div>
  );
};
