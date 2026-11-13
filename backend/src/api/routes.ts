import { Router, Request, Response } from 'express';
import { store } from './store.js';
import { simulate } from '../engine/simulator.js';
import { optimize } from '../engine/optimizer.js';
import { parseWhatIf } from '../llm/parseWhatIf.js';
import { applyWhatIfAction } from '../llm/applyWhatIf.js';
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
apiRouter.get('/dataset', (_req: Request, res: Response) => {
  res.json(store.getDataset());
});

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
  if (scenarioId && !scenario) {
    res.status(404).json({ error: `Unknown scenario: ${scenarioId}` });
    return;
  }
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

  const { weights, seed, scenarioId } = parsed.data;
  const scenario = scenarioId ? store.getScenario(scenarioId) : undefined;
  if (scenarioId && !scenario) {
    res.status(404).json({ error: `Unknown scenario: ${scenarioId}` });
    return;
  }
  const network = store.getNetwork();
  const students = store.getStudents();

  const optResult = optimize(network, students, weights, seed ?? 42, scenario);
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
    const network = store.getNetwork();
    const students = store.getStudents();
    const scenarios = store.getScenarios();
    const action = await parseWhatIf(parsed.data.prompt, process.env.LLM_API_KEY, { network, scenarios });
    const applied = applyWhatIfAction(network, action, scenarios);
    const baseline = simulate(network, students, undefined, 42, true);
    const result = simulate(applied.network, students, applied.scenario, 42, false);
    const explanation = generateExplanation(action, baseline.metrics, result.metrics);

    res.json({
      parsedAction: action,
      ...(applied.scenario ? { appliedScenario: applied.scenario } : {}),
      actionDescription: applied.description,
      explanation,
      result
    });
  } catch (error: any) {
    res.status(422).json({ error: error.message || 'What-if request could not be applied' });
  }
});

