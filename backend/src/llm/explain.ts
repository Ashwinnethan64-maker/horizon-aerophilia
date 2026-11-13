import type { WhatIfAction, SimMetrics } from '../../../contracts/types.js';

export function generateExplanation(
  action: WhatIfAction,
  beforeMetrics: SimMetrics,
  afterMetrics: SimMetrics
): string {
  const strandedDelta = afterMetrics.stranded - beforeMetrics.stranded;
  const servedDelta = afterMetrics.servedOnTime - beforeMetrics.servedOnTime;
  const waitDelta = +(afterMetrics.avgWaitMin - beforeMetrics.avgWaitMin).toFixed(1);
  const costDelta = afterMetrics.cost - beforeMetrics.cost;

  if (action.action === 'shift_departure') {
    const servedText = servedDelta >= 0 ? `+${servedDelta} additional students served on time` : `${servedDelta} fewer students served on time`;
    const strandedText = strandedDelta < 0 ? `stranded count reduced by ${Math.abs(strandedDelta)}` : strandedDelta > 0 ? `stranded count increased by ${strandedDelta}` : 'stranded count unchanged';
    return `Shifted Bus ${action.busId} departure to ${action.newTime}: Results in ${servedText} and ${strandedText} (now ${afterMetrics.stranded} stranded). Average wait time changed by ${waitDelta > 0 ? '+' : ''}${waitDelta} mins.`;
  }

  if (action.action === 'add_trip') {
    return `Added new departure at ${action.newTime} for Bus ${action.busId}: Serves ${afterMetrics.servedOnTime} students on time (${servedDelta >= 0 ? '+' : ''}${servedDelta}), reducing stranded students from ${beforeMetrics.stranded} to ${afterMetrics.stranded}. Extra operational cost: $${costDelta}.`;
  }

  if (action.action === 'remove_trip') {
    return `Cancelled departure at ${action.newTime} for Bus ${action.busId}: Saves $${Math.abs(costDelta)} in operational costs, but leaves ${afterMetrics.stranded} students stranded (${strandedDelta > 0 ? '+' : ''}${strandedDelta}).`;
  }

  if (action.action === 'change_capacity') {
    return `Updated Bus ${action.busId} capacity to ${action.capacity} seats: Serves ${afterMetrics.servedOnTime} students on time with ${afterMetrics.stranded} stranded. Average bus load factor is now ${Math.round(afterMetrics.loadFactor * 100)}%.`;
  }

  if (action.action === 'skip_stop') {
    return `Bypassed Stop ${action.stopId} on Route ${action.routeId || 'R1'}: Decreases overall route travel time, resulting in ${afterMetrics.servedOnTime} on-time arrivals and ${afterMetrics.stranded} stranded students.`;
  }

  if (action.action === 'apply_scenario') {
    const scenarioNames: Record<string, string> = {
      exam_surge: 'Board Exam Surge (1.4x demand)',
      monsoon_rain: 'Monsoon Rain (1.3x slower travel)',
      breakdown_b1: 'Bus B1 Breakdown',
      bridge_repair: 'Chandan Bridge Closure (Route R2 suspended)'
    };
    const label = scenarioNames[action.scenarioId || ''] || action.scenarioId;
    return `Simulated scenario '${label}': Stranded count changed from ${beforeMetrics.stranded} to ${afterMetrics.stranded} (${strandedDelta > 0 ? '+' : ''}${strandedDelta}), with average wait time at ${afterMetrics.avgWaitMin} mins and viability gap of $${afterMetrics.viabilityGap}.`;
  }

  return `Action ${action.action} executed: Serves ${afterMetrics.servedOnTime} students on time with ${afterMetrics.stranded} stranded.`;
}
