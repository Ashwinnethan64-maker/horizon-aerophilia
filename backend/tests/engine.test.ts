import { describe, it, expect } from 'vitest';
import { createRNG } from '../src/engine/rng.js';
import { simulate } from '../src/engine/simulator.js';
import { optimize } from '../src/engine/optimizer.js';
import { store } from '../src/api/store.js';

describe('Engine - Foundations & Contracts', () => {
  it('seeded RNG produces identical sequence for same seed', () => {
    const rng1 = createRNG(42);
    const rng2 = createRNG(42);

    const seq1 = [rng1(), rng1(), rng1()];
    const seq2 = [rng2(), rng2(), rng2()];

    expect(seq1).toEqual(seq2);
  });

  it('simulate returns valid SimResult matching contract', () => {
    const network = store.getNetwork();
    const students = store.getStudents();
    const result = simulate(network, students, undefined, 42);

    expect(result).toHaveProperty('events');
    expect(result).toHaveProperty('metrics');
    expect(result.metrics).toHaveProperty('servedOnTime');
    expect(result.metrics).toHaveProperty('stranded');
    expect(result.metrics).toHaveProperty('viabilityGap');
    expect(Array.isArray(result.events)).toBe(true);
  });

  it('optimize improves baseline score on fixture network', () => {
    const network = store.getNetwork();
    const students = store.getStudents();
    const opt = optimize(network, students);

    expect(opt.after.metrics.servedOnTime).toBeGreaterThanOrEqual(opt.before.metrics.servedOnTime);
    expect(opt.after.metrics.stranded).toBeLessThanOrEqual(opt.before.metrics.stranded);
    expect(opt.scoreDelta).toBeGreaterThanOrEqual(0);
  });
});

