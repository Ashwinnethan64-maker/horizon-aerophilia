import React from 'react';
import { useStore } from '../store/useStore';
import { Users, AlertTriangle, Clock, TrendingUp, Sparkles, HelpCircle } from 'lucide-react';

export const ImpactPanel: React.FC = () => {
  const { baselineResult, optimizedResult, viewingOptimized, scoreDelta, isLoading } = useStore();

  const baseline = baselineResult?.metrics;
  const current = viewingOptimized && optimizedResult ? optimizedResult.metrics : baseline;

  if (!current && isLoading) {
    return (
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 text-center text-yg-textSecondary text-sm">
        Running simulation &amp; calculating operational metrics...
      </div>
    );
  }

  if (!current) {
    return (
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-6 text-center text-yg-textSecondary text-sm">
        No simulation metrics available yet.
      </div>
    );
  }

  const getDeltaBadge = (
    currVal: number,
    baseVal?: number,
    lowerIsBetter: boolean = false,
    prefix: string = '',
    suffix: string = ''
  ) => {
    if (baseVal === undefined || !viewingOptimized || !optimizedResult) return null;
    const diff = currVal - baseVal;
    if (Math.abs(diff) < 0.05) return null;

    const isGood = lowerIsBetter ? diff < 0 : diff > 0;
    const sign = diff > 0 ? '+' : '-';
    const absVal = Math.abs(diff);
    const formatted = Number.isInteger(absVal) ? String(absVal) : absVal.toFixed(1);

    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
          isGood
            ? 'bg-yg-primarySoft text-yg-primary border border-yg-primary/30'
            : 'bg-red-50 text-yg-danger border border-red-200'
        }`}
      >
        {sign}{prefix}{formatted}{suffix}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-yg-border">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-yg-secondary text-base">
              Performance &amp; Financial Viability Metrics
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-yg-secondarySoft text-yg-secondary">
              Simulated
            </span>
          </div>
          <p className="text-xs text-yg-textSecondary mt-0.5">
            Holistic assessment of student accessibility, travel comfort, and carrier operating costs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {viewingOptimized && optimizedResult && scoreDelta !== null && (
            <span className="inline-flex items-center gap-1 text-xs bg-yg-primarySoft text-yg-primary px-3 py-1 rounded-full font-bold border border-yg-primary/25">
              <Sparkles className="w-3.5 h-3.5" />
              Score {scoreDelta >= 0 ? `+${scoreDelta.toFixed(1)}` : scoreDelta.toFixed(1)}
            </span>
          )}
          {viewingOptimized && optimizedResult ? (
            <span className="text-xs bg-yg-primary text-white px-3 py-1 rounded-yg-btn font-semibold shadow-xs">
              Optimized Plan
            </span>
          ) : (
            <span className="text-xs bg-yg-surfaceSubtle text-yg-secondary border border-yg-border px-3 py-1 rounded-yg-btn font-semibold">
              Baseline Schedule
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Served on time */}
        <div className="p-3.5 bg-yg-surfaceSubtle/60 rounded-xl border border-yg-border">
          <div className="flex items-center justify-between text-yg-textSecondary mb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-yg-primary">
              <Users className="w-4 h-4 text-yg-primary" /> Served On Time
            </span>
            {getDeltaBadge(current.servedOnTime, baseline?.servedOnTime)}
          </div>
          <div className="text-2xl font-bold text-yg-secondary tabular-nums tracking-tight">
            {current.servedOnTime}
          </div>
          <div className="text-[11px] text-yg-textSecondary mt-1">students reached school</div>
        </div>

        {/* Stranded */}
        <div className="p-3.5 bg-yg-surfaceSubtle/60 rounded-xl border border-yg-border">
          <div className="flex items-center justify-between text-yg-textSecondary mb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-yg-danger">
              <AlertTriangle className="w-4 h-4 text-yg-danger" /> Stranded (Unserved)
            </span>
            {getDeltaBadge(current.stranded, baseline?.stranded, true)}
          </div>
          <div className="text-2xl font-bold text-yg-danger tabular-nums tracking-tight">
            {current.stranded}
          </div>
          <div className="text-[11px] text-yg-textSecondary mt-1">could not board on time</div>
        </div>

        {/* Avg Wait */}
        <div className="p-3.5 bg-yg-surfaceSubtle/60 rounded-xl border border-yg-border">
          <div className="flex items-center justify-between text-yg-textSecondary mb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-yg-info">
              <Clock className="w-4 h-4 text-yg-info" /> Avg Wait Time
            </span>
            {getDeltaBadge(current.avgWaitMin, baseline?.avgWaitMin, true, '', 'm')}
          </div>
          <div className="text-2xl font-bold text-yg-secondary tabular-nums tracking-tight">
            {current.avgWaitMin}m
          </div>
          <div className="text-[11px] text-yg-textSecondary mt-1">stop waiting duration</div>
        </div>

        {/* Load Factor */}
        <div className="p-3.5 bg-yg-surfaceSubtle/60 rounded-xl border border-yg-border">
          <div className="flex items-center justify-between text-yg-textSecondary mb-1.5">
            <span className="text-xs font-semibold flex items-center gap-1.5 text-yg-secondary">
              <TrendingUp className="w-4 h-4 text-yg-secondary" /> Load Factor
            </span>
            {getDeltaBadge(
              Math.round(current.loadFactor * 100),
              baseline ? Math.round(baseline.loadFactor * 100) : undefined,
              false,
              '',
              '%'
            )}
          </div>
          <div className="text-2xl font-bold text-yg-secondary tabular-nums tracking-tight">
            {Math.round(current.loadFactor * 100)}%
          </div>
          <div className="text-[11px] text-yg-textSecondary mt-1">capacity utilization</div>
        </div>
      </div>

      {/* Financial Breakdown Bar */}
      <div className="mt-4 pt-3.5 border-t border-yg-border flex flex-wrap items-center justify-between gap-4 bg-yg-surfaceSubtle/40 -mx-5 -mb-5 px-5 py-3 rounded-b-yg-card">
        <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-yg-textSecondary font-medium">Estimated Revenue:</span>
            <strong className="text-yg-primary tabular-nums font-bold">₹{current.revenue}</strong>
            {getDeltaBadge(current.revenue, baseline?.revenue, false, '₹')}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-yg-textSecondary font-medium">Operating Cost:</span>
            <strong className="text-yg-secondary tabular-nums font-bold">₹{current.cost}</strong>
            {getDeltaBadge(current.cost, baseline?.cost, true, '₹')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-yg-textSecondary font-medium flex items-center gap-1" title="Viability Gap = Operating Cost - Revenue">
            Viability Deficit:
            <HelpCircle className="w-3.5 h-3.5 text-yg-textSecondary" />
          </span>
          <span
            className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-yg-btn tabular-nums border ${
              current.viabilityGap === 0
                ? 'bg-yg-primarySoft text-yg-primary border-yg-primary/30'
                : 'bg-amber-50 text-yg-warning border-amber-200'
            }`}
          >
            {current.viabilityGap === 0 ? '₹0 (Fully Covered)' : `₹${current.viabilityGap} gap`}
          </span>
          {getDeltaBadge(current.viabilityGap, baseline?.viabilityGap, true, '₹')}
        </div>
      </div>
    </div>
  );
};
