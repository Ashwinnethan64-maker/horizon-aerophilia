import type { SimMetrics, Weights } from '../../../contracts/types.js';

export const DEFAULT_WEIGHTS: Weights = {
  served: 10.0,
  wait: 2.0,
  crowding: 1.5,
  viability: 1.1
};

export function scoreMetrics(metrics: SimMetrics, weights: Weights = DEFAULT_WEIGHTS): number {
  const weightValues: Array<[keyof Weights, number]> = [
    ['served', weights.served], ['wait', weights.wait],
    ['crowding', weights.crowding], ['viability', weights.viability]
  ];
  for (const [name, value] of weightValues) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Weight "${name}" must be a finite non-negative number`);
    }
  }
  const metricValues: Array<[keyof SimMetrics, number]> = [
    ['servedOnTime', metrics.servedOnTime], ['stranded', metrics.stranded],
    ['avgWaitMin', metrics.avgWaitMin], ['loadFactor', metrics.loadFactor],
    ['revenue', metrics.revenue], ['cost', metrics.cost], ['viabilityGap', metrics.viabilityGap]
  ];
  for (const [name, value] of metricValues) {
    if (!Number.isFinite(value) || value < 0) {
      throw new RangeError(`Metric "${name}" must be a finite non-negative number`);
    }
  }

  const overcrowdingPenalty = Math.max(0, metrics.loadFactor - 0.9) * 100 * weights.crowding;
  const score =
    weights.served * metrics.servedOnTime -
    weights.wait * metrics.avgWaitMin -
    overcrowdingPenalty -
    weights.viability * Math.max(0, metrics.viabilityGap);

  return Math.round(score * 10) / 10;
}

