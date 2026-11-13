import type { WhatIfAction, SimMetrics } from '../../../contracts/types.js';

function signedChange(after: number, before: number, suffix = ''): string {
  const change = after - before;
  const value = Number.isInteger(change) ? String(Math.abs(change)) : Math.abs(change).toFixed(1);
  return `${change > 0 ? '+' : change < 0 ? '−' : ''}${value}${suffix}`;
}

function describeAction(action: WhatIfAction): string {
  switch (action.action) {
    case 'shift_departure': return `Moved ${action.busId} to ${action.newTime}`;
    case 'add_trip': return `Added a ${action.busId} trip at ${action.newTime}`;
    case 'remove_trip': return action.newTime
      ? `Removed the ${action.busId} trip at ${action.newTime}`
      : `Removed all trips for ${action.busId}`;
    case 'change_capacity': return `Set ${action.busId} capacity to ${action.capacity} seats`;
    case 'skip_stop': return `Skipped stop ${action.stopId} on ${action.routeId}`;
    case 'close_route': return `Closed route ${action.routeId}`;
    case 'apply_scenario': return `Applied scenario ${action.scenarioId}`;
  }
}

export function generateExplanation(
  action: WhatIfAction,
  beforeMetrics: SimMetrics,
  afterMetrics: SimMetrics
): string {
  return `${describeAction(action)}. Served on time: ${beforeMetrics.servedOnTime} → ${afterMetrics.servedOnTime} (${signedChange(afterMetrics.servedOnTime, beforeMetrics.servedOnTime)}); stranded: ${beforeMetrics.stranded} → ${afterMetrics.stranded} (${signedChange(afterMetrics.stranded, beforeMetrics.stranded)}); average wait: ${beforeMetrics.avgWaitMin} → ${afterMetrics.avgWaitMin} min; viability gap: ₹${beforeMetrics.viabilityGap} → ₹${afterMetrics.viabilityGap}.`;
}
