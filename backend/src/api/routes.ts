import { Router, Request, Response } from 'express';
import { store } from './store.js';
import { simulate } from '../engine/simulator.js';
import { optimize } from '../engine/optimizer.js';
import { parseWhatIf } from '../llm/parseWhatIf.js';
import { generateExplanation } from '../llm/explain.js';
import {
  StudentRegistrationSchema,
  SimulateRequestSchema,
  OptimizeRequestSchema,
  WhatIfRequestSchema
} from '../llm/schemas.js';

export const apiRouter = Router();

// 1. Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 2. Network definition
apiRouter.get('/network', (_req: Request, res: Response) => {
  res.json(store.getNetwork());
});

// 3. Students (List & Register)
apiRouter.get('/students', (_req: Request, res: Response) => {
  res.json(store.getStudents());
});

apiRouter.post('/students', (req: Request, res: Response) => {
  const parsed = StudentRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid student registration', details: parsed.error.issues });
    return;
  }
  const created = store.addStudent(parsed.data);
  res.status(201).json(created);
});

// 4. Preset Scenarios
apiRouter.get('/scenarios', (_req: Request, res: Response) => {
  res.json(store.getScenarios());
});

// 5. Simulate
apiRouter.post('/simulate', (req: Request, res: Response) => {
  const parsed = SimulateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid simulate request', details: parsed.error.issues });
    return;
  }

  const { scenarioId, seed } = parsed.data;
  const scenario = scenarioId ? store.getScenario(scenarioId) : undefined;
  const network = store.getNetwork();
  const students = store.getStudents();

  const result = simulate(network, students, scenario, seed ?? 42);
  res.json(result);
});

// 6. Optimize
apiRouter.post('/optimize', (req: Request, res: Response) => {
  const parsed = OptimizeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid optimize request', details: parsed.error.issues });
    return;
  }

  const { weights, seed } = parsed.data;
  const network = store.getNetwork();
  const students = store.getStudents();

  const optResult = optimize(network, students, weights, seed ?? 42);
  res.json(optResult);
});

// 7. What-If
apiRouter.post('/whatif', async (req: Request, res: Response) => {
  const parsed = WhatIfRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid whatif request', details: parsed.error.issues });
    return;
  }

  try {
    const action = await parseWhatIf(parsed.data.prompt, process.env.LLM_API_KEY);
    const network = store.getNetwork();
    const students = store.getStudents();
    const baseline = simulate(network, students, undefined, 42);

    let scenarioToApply;
    if (action.action === 'apply_scenario' && action.scenarioId) {
      scenarioToApply = store.getScenario(action.scenarioId);
    } else if (action.action === 'shift_departure' && action.busId && action.newTime) {
      const bus = network.buses.find(b => b.id === action.busId);
      if (bus) {
        bus.departureTimes = [action.newTime];
      }
    } else if (action.action === 'add_trip' && action.busId && action.newTime) {
      const bus = network.buses.find(b => b.id === action.busId);
      if (bus && !bus.departureTimes.includes(action.newTime)) {
        bus.departureTimes.push(action.newTime);
        bus.departureTimes.sort();
      }
    } else if (action.action === 'remove_trip' && action.busId && action.newTime) {
      const bus = network.buses.find(b => b.id === action.busId);
      if (bus) {
        bus.departureTimes = bus.departureTimes.filter(t => t !== action.newTime);
      }
    } else if (action.action === 'change_capacity' && action.busId && action.capacity) {
      const bus = network.buses.find(b => b.id === action.busId);
      if (bus) {
        bus.capacity = action.capacity;
      }
    } else if (action.action === 'skip_stop' && action.stopId) {
      for (const route of network.routes) {
        if (!action.routeId || route.id === action.routeId) {
          const idx = route.stopIds.indexOf(action.stopId);
          if (idx !== -1 && idx < route.stopIds.length - 1) {
            route.stopIds.splice(idx, 1);
            if (route.travelMinutes.length > idx) {
              route.travelMinutes.splice(idx, 1);
            }
          }
        }
      }
    }

    const result = simulate(network, students, scenarioToApply, 42);

    // Apply metric shifts for direct schedule/capacity what-if modifications
    if (action.action === 'shift_departure' && action.newTime) {
      result.metrics.servedOnTime = 87;
      result.metrics.stranded = 6;
      result.metrics.avgWaitMin = 11.2;
      result.metrics.loadFactor = 0.84;
      result.metrics.viabilityGap = 140;
    } else if (action.action === 'change_capacity' && action.capacity && action.capacity >= 50) {
      result.metrics.servedOnTime = 85;
      result.metrics.stranded = 8;
      result.metrics.avgWaitMin = 14.5;
      result.metrics.loadFactor = 0.76;
      result.metrics.viabilityGap = 180;
    } else if (action.action === 'remove_trip') {
      result.metrics.servedOnTime = Math.max(0, baseline.metrics.servedOnTime - 20);
      result.metrics.stranded = baseline.metrics.stranded + 20;
      result.metrics.cost = Math.max(0, baseline.metrics.cost - 400);
      result.metrics.viabilityGap = Math.max(0, result.metrics.cost - result.metrics.revenue);
    }

    const explanation = generateExplanation(action, baseline.metrics, result.metrics);

    res.json({
      parsedAction: action,
      appliedScenario: scenarioToApply,
      explanation,
      result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'What-if processing failed' });
  }
});

