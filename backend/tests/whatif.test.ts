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
  describe('Rule-based What-If Parser (All 6 Action Types)', () => {
    it('parses shift_departure queries', () => {
      const action = parseWithRuleEngine('Move Bus 3 departure to 07:45');
      expect(action.action).toBe('shift_departure');
      expect(action.busId).toBe('B3');
      expect(action.newTime).toBe('07:45');
    });

    it('parses add_trip queries', () => {
      const action = parseWithRuleEngine('Add extra trip at 08:00 for Bus B1');
      expect(action.action).toBe('add_trip');
      expect(action.busId).toBe('B1');
      expect(action.newTime).toBe('08:00');
    });

    it('parses remove_trip / cancel queries', () => {
      const action = parseWithRuleEngine('Cancel the 12:00 run of bus B3');
      expect(action.action).toBe('remove_trip');
      expect(action.busId).toBe('B3');
      expect(action.newTime).toBe('12:00');
    });

    it('parses change_capacity queries', () => {
      const action = parseWithRuleEngine('Increase capacity of Bus B1 to 50 seats');
      expect(action.action).toBe('change_capacity');
      expect(action.busId).toBe('B1');
      expect(action.capacity).toBe(50);
    });

    it('parses skip_stop queries', () => {
      const action = parseWithRuleEngine('Skip stop S2 on Northern Trunk');
      expect(action.action).toBe('skip_stop');
      expect(action.stopId).toBe('S2');
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

    it('falls back to safe default for ambiguous queries without crashing', () => {
      const fallback = parseWithRuleEngine('Can we optimize things better?');
      expect(fallback.action).toBe('shift_departure');
      expect(fallback.busId).toBe('B3');
      expect(fallback.newTime).toBe('07:45');
    });
  });

  describe('Metric Diff Explanation Generator', () => {
    const beforeMetrics: SimMetrics = {
      servedOnTime: 65,
      stranded: 28,
      avgWaitMin: 22.4,
      loadFactor: 0.88,
      revenue: 1625,
      cost: 1950,
      viabilityGap: 325
    };

    const afterMetrics: SimMetrics = {
      servedOnTime: 87,
      stranded: 6,
      avgWaitMin: 11.2,
      loadFactor: 0.84,
      revenue: 2175,
      cost: 2100,
      viabilityGap: 140
    };

    it('generates clear shift_departure explanation with exact numbers', () => {
      const action: WhatIfAction = {
        action: 'shift_departure',
        busId: 'B3',
        newTime: '07:45'
      };
      const text = generateExplanation(action, beforeMetrics, afterMetrics);
      expect(text).toContain('Bus B3');
      expect(text).toContain('07:45');
      expect(text).toContain('+22 additional students served on time');
      expect(text).toContain('stranded count reduced by 22');
    });

    it('generates clear change_capacity explanation', () => {
      const action: WhatIfAction = {
        action: 'change_capacity',
        busId: 'B1',
        capacity: 50
      };
      const text = generateExplanation(action, beforeMetrics, afterMetrics);
      expect(text).toContain('50 seats');
      expect(text).toContain('87 students on time');
    });

    it('generates clear remove_trip cancellation explanation', () => {
      const action: WhatIfAction = {
        action: 'remove_trip',
        busId: 'B3',
        newTime: '12:00'
      };
      const text = generateExplanation(action, beforeMetrics, {
        ...beforeMetrics,
        cost: 1550,
        stranded: 38
      });
      expect(text).toContain('Cancelled departure at 12:00');
      expect(text).toContain('Saves $400');
    });
  });

  describe('End-to-End POST /api/whatif Integration', () => {
    it('executes shift_departure what-if and verifies metric improvement', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Move Bus 3 to 07:45 AM' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('shift_departure');
      expect(data.parsedAction.newTime).toBe('07:45');
      expect(data.result.metrics.servedOnTime).toBe(87);
      expect(data.result.metrics.stranded).toBe(6);
      expect(data.explanation).toContain('+22 additional students served');
    });

    it('executes change_capacity what-if and verifies relief', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Increase capacity of Bus B1 to 50' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('change_capacity');
      expect(data.result.metrics.servedOnTime).toBe(85);
      expect(data.result.metrics.stranded).toBe(8);
      expect(data.explanation).toContain('50 seats');
    });

    it('executes scenario what-if and returns appropriate diff explanation', async () => {
      const res = await fetch(`${baseUrl}/api/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Simulate severe monsoon rain' })
      });

      expect(res.status).toBe(200);
      const data: WhatIfResponse = await res.json();
      expect(data.parsedAction.action).toBe('apply_scenario');
      expect(data.parsedAction.scenarioId).toBe('monsoon_rain');
      expect(data.explanation).toContain('Monsoon Rain');
    });
  });
});
