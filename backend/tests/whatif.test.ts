import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import app from '../src/api/server.js';
import { parseWithRuleEngine } from '../src/llm/parseWhatIf.js';
import { generateExplanation } from '../src/llm/explain.js';
import type { SimMetrics, WhatIfAction, WhatIfResponse } from '../../contracts/types.js';

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      if (addr && typeof addr === 'object') {
        baseUrl = `http://127.0.0.1:${addr.port}`;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('Stage C6: LLM What-If Service & Presets', () => {
  describe('Rule-based What-If Parser (POLALI-001 Catalog)', () => {
    it('parses shift_departure queries', () => {
      const action = parseWithRuleEngine('Move Bus 3 departure to 07:45');
      expect(action.action).toBe('shift_departure');
      expect(action.busId).toBe('BUS003');
      expect(action.newTime).toBe('07:45');
    });

    it('parses add_trip queries', () => {
      const action = parseWithRuleEngine('Add extra trip at 08:00 for Bus B1');
      expect(action.action).toBe('add_trip');
      expect(action.busId).toBe('BUS001');
      expect(action.newTime).toBe('08:00');
    });

    it('parses remove_trip / cancel queries', () => {
      const action = parseWithRuleEngine('Cancel the 12:00 run of bus B3');
      expect(action.action).toBe('remove_trip');
      expect(action.busId).toBe('BUS003');
      expect(action.newTime).toBe('12:00');
    });

    it('parses change_capacity queries', () => {
      const action = parseWithRuleEngine('Increase capacity of Bus B1 to 50 seats');
      expect(action.action).toBe('change_capacity');
      expect(action.busId).toBe('BUS001');
      expect(action.capacity).toBe(50);
    });

    it('parses skip_stop queries', () => {
      const action = parseWithRuleEngine('Skip stop S2 on R01');
      expect(action.action).toBe('skip_stop');
      expect(action.stopId).toBe('S2');
      expect(action.routeId).toBe('R01');
    });

    it('parses apply_scenario queries for weather and breakdowns', () => {
      const rain = parseWithRuleEngine('What happens if heavy monsoon rain starts?');
      expect(rain.action).toBe('apply_scenario');
      expect(rain.scenarioId).toBe('monsoon_rain');

      const surge = parseWithRuleEngine('Simulate board exam surge');
      expect(surge.action).toBe('apply_scenario');
      expect(surge.scenarioId).toBe('exam_surge');

      const breakdown = parseWithRuleEngine('What if bus 1 has a breakdown?');
      expect(breakdown.action).toBe('apply_scenario');
      expect(breakdown.scenarioId).toBe('breakdown_b1');
    });

    it('rejects unsupported requests with a clear validation error', () => {
      expect(() => parseWithRuleEngine('Can we optimize things better?')).toThrow();
    });
  });

  describe('Metric Diff Explanation Generator', () => {
    const beforeMetrics: SimMetrics = {
      servedOnTime: 320,
      stranded: 180,
      avgWaitMin: 18.4,
      loadFactor: 0.92,
      revenue: 6400,
      cost: 12000,
      viabilityGap: 5600
    };

    const afterMetrics: SimMetrics = {
      servedOnTime: 365,
      stranded: 135,
      avgWaitMin: 14.2,
      loadFactor: 0.85,
      revenue: 7300,
      cost: 12000,
      viabilityGap: 4700
    };

    it('generates clear shift_departure explanation with exact numbers', () => {
      const action: WhatIfAction = {
        action: 'shift_departure',
        busId: 'BUS003',
        newTime: '07:45'
      };
      const text = generateExplanation(action, beforeMetrics, afterMetrics);
      expect(text).toContain('BUS003');
      expect(text).toContain('07:45');
      expect(text).toContain('320 → 365 (+45)');
      expect(text).toContain('₹5600 → ₹4700');
    });

    it('generates clear change_capacity explanation', () => {
      const action: WhatIfAction = {
        action: 'change_capacity',
        busId: 'BUS001',
        capacity: 50
      };
      const text = generateExplanation(action, beforeMetrics, afterMetrics);
      expect(text).toContain('50 seats');
      expect(text).toContain('BUS001');
    });

    it('generates clear remove_trip cancellation explanation', () => {
      const action: WhatIfAction = {
        action: 'remove_trip',
        busId: 'BUS003',
        newTime: '12:00'
      };
      const text = generateExplanation(action, beforeMetrics, {
        ...beforeMetrics,
        cost: 11000,
        viabilityGap: 4600,
        stranded: 210
      });
      expect(text).toContain('Removed the BUS003 trip at 12:00');
      expect(text).toContain('₹5600 → ₹4600');
    });
  });

  describe('End-to-End POST /api/whatif Integration', () => {
    it('executes shift_departure what-if using the simulation engine', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Move Bus 3 to 07:45 AM' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('shift_departure');
      expect(data.parsedAction.busId).toBe('BUS003');
      expect(data.parsedAction.newTime).toBe('07:45');
      expect(data.result.events.length).toBeGreaterThan(0);
      expect(data.explanation).toContain('BUS003');
    });

    it('executes change_capacity what-if and updates explanation', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Increase capacity of Bus B1 to 50 seats' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('change_capacity');
      expect(data.parsedAction.capacity).toBe(50);
      expect(data.explanation).toContain('50 seats');
    });

    it('executes scenario what-if and returns appliedScenario plus explanation', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Simulate severe monsoon rain' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('apply_scenario');
      expect(data.parsedAction.scenarioId).toBe('monsoon_rain');
      expect(data.appliedScenario?.id).toBe('monsoon_rain');
      expect(data.explanation).toContain('monsoon_rain');
    });
  });
});
