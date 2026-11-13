import { describe, it, expect } from 'vitest';
import { createRNG } from '../src/engine/rng.js';
import { formatHHMM, parseHHMM, simulate } from '../src/engine/simulator.js';
import { optimize } from '../src/engine/optimizer.js';
import { scoreMetrics } from '../src/engine/scorer.js';
import { applyScenario } from '../src/engine/scenarios.js';
import { store } from '../src/api/store.js';

const network = store.getNetwork();
const students = store.getStudents();

describe('Engine foundations', () => {
  it('seeded RNG produces identical sequences for the same seed', () => {
    const rng1 = createRNG(42);
    const rng2 = createRNG(42);
    expect([rng1(), rng1(), rng1()]).toEqual([rng2(), rng2(), rng2()]);
  });

  it('parses and formats strict 24-hour times', () => {
    expect(parseHHMM('07:05')).toBe(425);
    expect(formatHHMM(425)).toBe('07:05');
    expect(() => parseHHMM('7:05')).toThrow(RangeError);
    expect(() => parseHHMM('24:00')).toThrow(RangeError);
    expect(() => formatHHMM(1440)).toThrow(RangeError);
  });
});

describe('Engine simulation', () => {
  it('returns a contract-shaped result and is deterministic for a fixed seed', () => {
    const first = simulate(network, students, undefined, 42);
    const second = simulate(network, students, undefined, 42);
    expect(first).toEqual(second);
    expect(first).toHaveProperty('events');
    expect(first).toHaveProperty('metrics');
    expect(first.metrics).toHaveProperty('servedOnTime');
    expect(first.metrics).toHaveProperty('stranded');
    expect(first.metrics).toHaveProperty('viabilityGap');
    expect(Array.isArray(first.events)).toBe(true);
  });

  it('never boards more riders than a bus can carry', () => {
    const result = simulate(network, students, undefined, 42);
    const capacityByBus = new Map(network.buses.map(bus => [bus.id, bus.capacity]));
    const loadByBus = new Map<string, number>();

    for (const event of result.events) {
      if (!event.busId) continue;
      const load = loadByBus.get(event.busId) ?? 0;
      if (event.type === 'board') {
        const nextLoad = load + (event.count ?? 0);
        expect(nextLoad).toBeLessThanOrEqual(capacityByBus.get(event.busId) ?? 0);
        loadByBus.set(event.busId, nextLoad);
      } else if (event.type === 'arrive') {
        const nextLoad = load - (event.count ?? 0);
        expect(nextLoad).toBeGreaterThanOrEqual(0);
        loadByBus.set(event.busId, nextLoad);
      }
    }
  });

  it('handles empty demand and a fully closed network', () => {
    const empty = simulate(network, [], undefined, 42);
    expect(empty.metrics.servedOnTime).toBe(0);
    expect(empty.metrics.stranded).toBe(0);
    expect(empty.metrics.avgWaitMin).toBe(0);
    expect(empty.metrics.loadFactor).toBe(0);

    const closed = {
      id: 'all-routes-closed',
      label: 'All Routes Closed',
      patches: network.routes.map(route => ({ type: 'closeRoute' as const, routeId: route.id }))
    };
    const result = simulate(network, students, closed, 42);
    expect(result.metrics.servedOnTime).toBe(0);
    expect(result.metrics.stranded).toBe(students.length);
  });
});

describe('Engine scenarios', () => {
  const baseline = simulate(network, students, undefined, 42, true);

  it('increases demand and unmet riders during an exam surge', () => {
    const surge = store.getScenario('exam_surge');
    expect(surge).toBeDefined();
    const result = simulate(network, students, surge, 42, true);
    expect(result.metrics.stranded).toBeGreaterThan(baseline.metrics.stranded);
  });

  it('changes capacity and reduces service when capacity is halved', () => {
    const scenario = {
      id: 'half-capacity', label: 'Half Capacity',
      patches: [{ type: 'capacityMultiplier' as const, value: 0.5 }]
    };
    const applied = applyScenario(network, students, scenario);
    expect(applied.network.buses.every(bus => bus.capacity === 20)).toBe(true);
    expect(simulate(network, students, scenario, 42, true).metrics.servedOnTime)
      .toBeLessThan(baseline.metrics.servedOnTime);
  });

  it('delays route arrivals in the rain scenario', () => {
    const rain = store.getScenario('monsoon_rain');
    expect(rain).toBeDefined();
    const baselineArrival = simulate(network, students, undefined, 42).events
      .find(event => event.type === 'arrive' && event.routeId === 'R01')!;
    const rainArrival = simulate(network, students, rain, 42).events
      .find(event => event.type === 'arrive' && event.routeId === 'R01')!;
    expect(rainArrival.minute).toBeGreaterThan(baselineArrival.minute);
  });

  it('reduces service during a bus breakdown and route closure', () => {
    const breakdown = store.getScenario('breakdown_b1');
    const closure = store.getScenario('bridge_repair');
    expect(simulate(network, students, breakdown, 42, true).metrics.servedOnTime)
      .toBeLessThan(baseline.metrics.servedOnTime);
    expect(simulate(network, students, closure, 42, true).metrics.servedOnTime)
      .toBeLessThan(baseline.metrics.servedOnTime);
  });

  it('applies departure shifts to the targeted bus', () => {
    const scenario = {
      id: 'shift-bus', label: 'Shift BUS001',
      patches: [{ type: 'shiftDeparture' as const, busId: 'BUS001', newTime: '07:30' }]
    };
    const applied = applyScenario(network, students, scenario);
    expect(applied.network.buses.find(bus => bus.id === 'BUS001')?.departureTimes).toEqual(['07:30']);
    expect(simulate(network, students, scenario, 42, true).metrics.avgWaitMin)
      .toBeGreaterThan(baseline.metrics.avgWaitMin);
  });
});

describe('Engine optimizer', () => {
  it('produces a feasible schedule that scores at least as well as baseline', () => {
    const result = optimize(network, students, undefined, 42);
    const baselineScore = scoreMetrics(result.before.metrics);
    const optimizedScore = scoreMetrics(result.after.metrics);
    expect(optimizedScore).toBeGreaterThanOrEqual(baselineScore);
    expect(result.scoreDelta).toBeGreaterThanOrEqual(0);
    expect(result.after).toEqual(simulate({ ...network, buses: result.schedule }, students, undefined, 42));
    expect(result.schedule.every(bus => network.routes.some(route => route.id === bus.routeId))).toBe(true);
    expect(result.diff).toBeInstanceOf(Array);
  });
});
