import type { WhatIfAction, SimMetrics } from '../../../contracts/types.js';

export function generateExplanation(
  action: WhatIfAction,
  beforeMetrics: SimMetrics,
  afterMetrics: SimMetrics
): string {
  const strandedDelta = afterMetrics.stranded - beforeMetrics.stranded;
  const servedDelta = afterMetrics.servedOnTime - beforeMetrics.servedOnTime;

  if (action.action === 'shift_departure') {
    return `Shifted Bus ${action.busId} departure to ${action.newTime}. This ${
      servedDelta >= 0 ? `served ${servedDelta} additional students` : `reduced served students by ${Math.abs(servedDelta)}`
    } and changed stranded count from ${beforeMetrics.stranded} to ${afterMetrics.stranded}.`;
  }

  if (action.action === 'apply_scenario') {
    return `Applied scenario '${action.scenarioId}'. Stranded students changed by ${strandedDelta > 0 ? '+' : ''}${strandedDelta}, and average wait time is now ${afterMetrics.avgWaitMin} minutes.`;
  }

  return `Action ${action.action} executed. Serves ${afterMetrics.servedOnTime} students on time with ${afterMetrics.stranded} stranded.`;
}

