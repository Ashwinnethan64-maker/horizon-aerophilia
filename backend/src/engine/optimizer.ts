import type {
  Network,
  Student,
  Weights,
  OptimizationResult,
  ScheduleDiffItem,
  Bus,
  OptimizedScheduleSeed,
  Scenario
} from '../../../contracts/types.js';
import { createRNG } from './rng.js';
import { formatHHMM, parseHHMM } from './time.js';
import { loadFixture, OptimizedScheduleSeedSchema } from './fixtures.js';
import { simulate } from './simulator.js';
import { scoreMetrics, DEFAULT_WEIGHTS } from './scorer.js';

const RESTARTS = 6;
const STEPS_PER_RESTART = 18;
const DEPARTURE_OFFSETS = [-30, -20, -10, -5, 5, 10, 20, 30];
const FIRST_DEPARTURE = 6 * 60;
const SIMULATION_END = 10 * 60;

function cloneSchedule(buses: Bus[]): Bus[] {
  return JSON.parse(JSON.stringify(buses)) as Bus[];
}

function routeDuration(network: Network, routeId: string): number | undefined {
  const route = network.routes.find(candidate => candidate.id === routeId);
  return route?.travelMinutes.reduce((sum, minutes) => sum + minutes, 0);
}

function isScheduleFeasible(network: Network, buses: Bus[]): boolean {
  const routesById = new Map(network.routes.map(route => [route.id, route] as const));
  for (const bus of buses) {
    const route = routesById.get(bus.routeId);
    if (!route || !Number.isInteger(bus.capacity) || bus.capacity <= 0) return false;
    if (bus.permittedRouteIds && !bus.permittedRouteIds.includes(route.id)) return false;
    const oneWayMinutes = route.travelMinutes.reduce((sum, minutes) => sum + minutes, 0);
    if (oneWayMinutes > bus.maxDriverHours * 60) return false;

    let totalDrivingMinutes = 0;
    let lastArrival = -Infinity;
    const departures = [...bus.departureTimes].map(parseHHMM).sort((a, b) => a - b);
    for (const departure of departures) {
      if (departure < lastArrival) return false;
      totalDrivingMinutes += oneWayMinutes;
      lastArrival = departure + oneWayMinutes;
    }
    if (totalDrivingMinutes > bus.maxDriverHours * 60) return false;
  }
  return true;
}

function applyFallbackSchedule(network: Network): Bus[] | undefined {
  if (!network.simulationId) return undefined;
  try {
    const fallback = loadFixture<OptimizedScheduleSeed>('optimized-schedule.json', OptimizedScheduleSeedSchema);
    if (fallback.simulationId !== network.simulationId) return undefined;

    const assignmentByBus = new Map(fallback.assignments.map(assignment => [assignment.busId, assignment] as const));
    if (assignmentByBus.size !== network.buses.length || network.buses.some(bus => !assignmentByBus.has(bus.id))) {
      return undefined;
    }
    const candidate = network.buses.map(bus => {
      const assignment = assignmentByBus.get(bus.id)!;
      return { ...bus, routeId: assignment.routeId, departureTimes: [...assignment.departureTimes] };
    });
    if (network.optimizedAllocation) {
      const actualAllocation = candidate.reduce<Record<string, number>>((counts, bus) => {
        counts[bus.routeId] = (counts[bus.routeId] ?? 0) + 1;
        return counts;
      }, {});
      const allocationRoutes = new Set([...Object.keys(network.optimizedAllocation), ...Object.keys(actualAllocation)]);
      if ([...allocationRoutes].some(routeId =>
        (actualAllocation[routeId] ?? 0) !== (network.optimizedAllocation![routeId] ?? 0)
      )) return undefined;
    }
    return isScheduleFeasible(network, candidate) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

function makeNeighbor(schedule: Bus[], network: Network, rng: () => number): Bus[] {
  if (schedule.length === 0) return cloneSchedule(schedule);
  const candidate = cloneSchedule(schedule);
  const bus = candidate[Math.floor(rng() * candidate.length)];
  if (!bus) return candidate;

  const permittedRoutes = network.routes.filter(route =>
    !bus.permittedRouteIds || bus.permittedRouteIds.includes(route.id)
  );
  const canReassign = permittedRoutes.some(route => route.id !== bus.routeId);
  const reassign = canReassign && rng() < 0.62;

  if (reassign) {
    const choices = permittedRoutes.filter(route => route.id !== bus.routeId);
    bus.routeId = choices[Math.floor(rng() * choices.length)]!.id;
    return candidate;
  }

  const duration = routeDuration(network, bus.routeId);
  if (duration === undefined) return candidate;
  const maxDeparture = Math.min(SIMULATION_END - duration, 9 * 60 + 30);
  const currentIndex = bus.departureTimes.length > 0 ? Math.floor(rng() * bus.departureTimes.length) : -1;
  const current = currentIndex >= 0 ? parseHHMM(bus.departureTimes[currentIndex]!) : 7 * 60;
  const offset = DEPARTURE_OFFSETS[Math.floor(rng() * DEPARTURE_OFFSETS.length)]!;
  const shifted = Math.max(FIRST_DEPARTURE, Math.min(maxDeparture, current + offset));
  if (currentIndex < 0) bus.departureTimes = [formatHHMM(shifted)];
  else bus.departureTimes[currentIndex] = formatHHMM(shifted);
  return candidate;
}

function makeDiff(before: Bus[], after: Bus[]): ScheduleDiffItem[] {
  const originalById = new Map(before.map(bus => [bus.id, bus] as const));
  return after.flatMap(bus => {
    const original = originalById.get(bus.id);
    if (!original) return [];
    const routeChanged = original.routeId !== bus.routeId;
    const departuresChanged = original.departureTimes.join('|') !== bus.departureTimes.join('|');
    if (!routeChanged && !departuresChanged) return [];

    const changes: string[] = [];
    if (routeChanged) changes.push(`reassigned from ${original.routeId} to ${bus.routeId}`);
    if (departuresChanged) changes.push(`departure changed from ${original.departureTimes.join(', ') || 'none'} to ${bus.departureTimes.join(', ') || 'none'}`);
    return [{
      busId: bus.id,
      oldRouteId: original.routeId,
      newRouteId: bus.routeId,
      oldDepartures: [...original.departureTimes],
      newDepartures: [...bus.departureTimes],
      changeDescription: changes.join('; ')
    }];
  });
}

export function optimize(
  network: Network,
  students: Student[],
  weights: Weights = DEFAULT_WEIGHTS,
  seed: number = 42,
  scenario?: Scenario
): OptimizationResult {
  const before = simulate(network, students, scenario, seed, false);
  const baselineScore = scoreMetrics(before.metrics, weights);
  let bestSchedule = cloneSchedule(network.buses);
  let bestScore = baselineScore;

  const evaluate = (schedule: Bus[]): number => {
    if (!isScheduleFeasible(network, schedule)) return Number.NEGATIVE_INFINITY;
    const result = simulate({ ...network, buses: schedule }, students, scenario, seed, true);
    return scoreMetrics(result.metrics, weights);
  };

  const fallback = applyFallbackSchedule(network);
  if (fallback) {
    const fallbackScore = evaluate(fallback);
    if (fallbackScore > bestScore) {
      bestSchedule = fallback;
      bestScore = fallbackScore;
    }
  }

  const rng = createRNG((seed ^ 0x5f3759df) >>> 0);
  for (let restart = 0; restart < RESTARTS; restart++) {
    let current = cloneSchedule(bestSchedule);
    if (restart > 0) {
      for (let perturbation = 0; perturbation < restart + 1; perturbation++) {
        const perturbed = makeNeighbor(current, network, rng);
        if (isScheduleFeasible(network, perturbed)) current = perturbed;
      }
    }
    let currentScore = evaluate(current);

    for (let step = 0; step < STEPS_PER_RESTART; step++) {
      let candidate: Bus[] | undefined;
      for (let attempt = 0; attempt < 5; attempt++) {
        const proposed = makeNeighbor(current, network, rng);
        if (isScheduleFeasible(network, proposed)) {
          candidate = proposed;
          break;
        }
      }
      if (!candidate) continue;

      const candidateScore = evaluate(candidate);
      if (candidateScore > currentScore) {
        current = candidate;
        currentScore = candidateScore;
      }
      if (candidateScore > bestScore) {
        bestSchedule = candidate;
        bestScore = candidateScore;
      }
    }
  }

  const after = simulate({ ...network, buses: bestSchedule }, students, scenario, seed, false);
  const afterScore = scoreMetrics(after.metrics, weights);
  return {
    schedule: bestSchedule,
    diff: makeDiff(network.buses, bestSchedule),
    before,
    after,
    scoreDelta: Math.round((afterScore - baselineScore) * 10) / 10
  };
}
