import type { SimMetrics, Weights } from '../../../contracts/types.js';

export const DEFAULT_WEIGHTS: Weights = {
  served: 10.0,
  wait: 2.0,
  crowding: 1.5,
  viability: 1.0
};

export function scoreMetrics(metrics: SimMetrics, weights: Weights = DEFAULT_WEIGHTS): number {
  const overcrowdingPenalty = Math.max(0, metrics.loadFactor - 0.9) * 100 * weights.crowding;
  const score =
    weights.served * metrics.servedOnTime -
    weights.wait * metrics.avgWaitMin -
    overcrowdingPenalty -
    weights.viability * Math.max(0, metrics.viabilityGap);

  return Math.round(score * 10) / 10;
}

