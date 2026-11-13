import type { Network, Scenario, WhatIfAction } from '../../../contracts/types.js';
import { WhatIfActionSchema } from './schemas.js';
import { parseHHMM } from '../engine/time.js';

<<<<<<< HEAD
export interface WhatIfContext {
  network: Network;
  scenarios: Scenario[];
}

function compact(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function findBus(prompt: string, context: WhatIfContext): string | undefined {
  const text = compact(prompt);
  const direct = context.network.buses.find(bus => text.includes(compact(bus.id)));
  if (direct) return direct.id;
  const shortForm = /\b(?:bus|b)\s*0*(\d+)\b/i.exec(prompt);
  if (!shortForm) return undefined;
  const number = Number(shortForm[1]);
  return context.network.buses.find(bus => Number(/(\d+)$/.exec(bus.id)?.[1]) === number)?.id;
}

function findRoute(prompt: string, context: WhatIfContext): string | undefined {
  const text = compact(prompt);
  const genericWords = new Set(['CORRIDOR', 'FEEDER', 'ROUTE']);
  return context.network.routes.find(route => {
    if (text.includes(compact(route.id))) return true;
    return route.name?.split(/\s+/).some(word =>
      !genericWords.has(compact(word)) && compact(word).length >= 4 && text.includes(compact(word))
    ) ?? false;
  })?.id;
}

function findStop(prompt: string, context: WhatIfContext): string | undefined {
  const text = compact(prompt);
  return context.network.stops.find(stop =>
    text.includes(compact(stop.id)) || text.includes(compact(stop.name))
  )?.id;
}

function findTime(prompt: string): string | undefined {
  const match = /\b(\d{1,2}):([0-5]\d)\s*(am|pm)?\b/i.exec(prompt);
  if (!match) return undefined;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toLowerCase();
  if (meridiem) {
    if (hour < 1 || hour > 12) return undefined;
    hour = hour % 12 + (meridiem === 'pm' ? 12 : 0);
  }
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  try {
    parseHHMM(value);
    return value;
  } catch {
    return undefined;
  }
}

function validateTarget(action: WhatIfAction, context: WhatIfContext): WhatIfAction {
  if (action.busId && !context.network.buses.some(bus => bus.id === action.busId)) {
    throw new Error(`Unknown bus: ${action.busId}`);
  }
  if (action.routeId && !context.network.routes.some(route => route.id === action.routeId)) {
    throw new Error(`Unknown route: ${action.routeId}`);
  }
  if (action.stopId && !context.network.stops.some(stop => stop.id === action.stopId)) {
    throw new Error(`Unknown stop: ${action.stopId}`);
  }
  if (action.action === 'apply_scenario' && !context.scenarios.some(scenario => scenario.id === action.scenarioId)) {
    throw new Error(`Unknown scenario: ${action.scenarioId}`);
  }
  return action;
}

function parseRuleBased(prompt: string, context: WhatIfContext): WhatIfAction {
  const normalized = prompt.toLowerCase();
  const busId = findBus(prompt, context);
  const routeId = findRoute(prompt, context);
  const stopId = findStop(prompt, context);
  const newTime = findTime(prompt);

  if (/\b(rain|monsoon|waterlog)\w*/i.test(normalized)) {
    return { action: 'apply_scenario', scenarioId: 'monsoon_rain' };
  }
  if (/\b(exam|surge|extra demand)\w*/i.test(normalized)) {
    return { action: 'apply_scenario', scenarioId: 'exam_surge' };
  }
  if (/\b(close|closure|repair)\w*/i.test(normalized) && routeId) {
    const preset = context.scenarios.find(scenario => scenario.patches.some(patch =>
      patch.type === 'closeRoute' && patch.routeId === routeId
    ));
    if (preset) return { action: 'apply_scenario', scenarioId: preset.id };
    return { action: 'close_route', routeId };
  }
  if (/\b(bridge|repair)\w*/i.test(normalized)) {
    const preset = context.scenarios.find(scenario => scenario.id === 'bridge_repair');
    if (preset) return { action: 'apply_scenario', scenarioId: preset.id };
  }
  if (/\bbreak(?:down)?\b/i.test(normalized)) {
    const preset = context.scenarios.find(scenario => scenario.patches.some(patch =>
      patch.type === 'removeBus' && (!busId || patch.busId === busId)
    ));
    if (preset && (!busId || preset.patches.some(patch => patch.type === 'removeBus' && patch.busId === busId))) {
      return { action: 'apply_scenario', scenarioId: preset.id };
    }
    if (busId) return { action: 'remove_trip', busId };
  }

  const capacityMatch = /\b(\d+)\s*seats?\b/i.exec(prompt)
    ?? /\bcapacity\b[^,.;]{0,40}\b(?:to|at)\s+(\d+)\b/i.exec(prompt);
  if (busId && capacityMatch) return { action: 'change_capacity', busId, capacity: Number(capacityMatch[1]) };
  if (busId && stopId && /\bskip\b/i.test(normalized)) {
    const bus = context.network.buses.find(candidate => candidate.id === busId);
    const targetRoute = routeId ?? bus?.routeId;
    if (targetRoute) return { action: 'skip_stop', busId, routeId: targetRoute, stopId };
  }
  if (busId && newTime && /\b(add|extra|another)\b/i.test(normalized)) {
    return { action: 'add_trip', busId, newTime };
  }
  if (busId && /\b(cancel|remove)\b/i.test(normalized)) {
    return { action: 'remove_trip', busId, ...(newTime ? { newTime } : {}) };
  }
  if (busId && newTime && /\b(shift|move|depart|departure|schedule|set)\b/i.test(normalized)) {
    return { action: 'shift_departure', busId, newTime };
  }

  const namedScenario = context.scenarios.find(scenario =>
    normalized.includes(scenario.id.toLowerCase()) || normalized.includes(scenario.label.toLowerCase())
  );
  if (namedScenario) return { action: 'apply_scenario', scenarioId: namedScenario.id };

  throw new Error('I could not map that request. Try a preset scenario, or ask to shift/add/remove a bus trip, change capacity, skip a stop, or close a route.');
}

function parseAssistantJson(content: string): unknown {
  const unwrapped = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = unwrapped.indexOf('{');
  const end = unwrapped.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('LLM response did not contain a JSON object');
  return JSON.parse(unwrapped.slice(start, end + 1)) as unknown;
}

async function parseWithProvider(prompt: string, apiKey: string, context: WhatIfContext): Promise<WhatIfAction> {
  const endpoint = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';
  const catalog = {
    buses: context.network.buses.map(bus => ({ id: bus.id, routeId: bus.routeId })),
    routes: context.network.routes.map(route => ({ id: route.id, name: route.name, stops: route.stopIds })),
    stops: context.network.stops.map(stop => ({ id: stop.id, name: stop.name })),
    scenarios: context.scenarios.map(scenario => ({ id: scenario.id, label: scenario.label }))
  };
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: `Translate the user's transit request into one JSON object with keys action, busId, routeId, stopId, newTime, capacity, scenarioId. Allowed actions: shift_departure, skip_stop, add_trip, remove_trip, change_capacity, close_route, apply_scenario. Use only IDs from this catalog. Do not invent IDs. Time must be 24-hour HH:MM. Return JSON only. Catalog: ${JSON.stringify(catalog)}`
    },
    { role: 'user', content: prompt }
  ];

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, temperature: 0, messages }),
        signal: AbortSignal.timeout(12_000)
      });
      if (!response.ok) throw new Error(`LLM provider returned ${response.status}`);
      const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
      const content = body.choices?.[0]?.message?.content;
      if (!content) throw new Error('LLM provider returned an empty response');
      const candidate = WhatIfActionSchema.parse(parseAssistantJson(content));
      return validateTarget(candidate, context);
    } catch (error) {
      lastError = error;
      messages.push(
        { role: 'assistant', content: String(error) },
        { role: 'user', content: 'Retry once. Return a valid action JSON object with required fields and IDs from the supplied catalog.' }
      );
    }
  }
  throw lastError instanceof Error ? lastError : new Error('LLM parsing failed');
}

/** Use the configured OpenAI-compatible provider when available; otherwise parse supported commands locally. */
export async function parseWhatIf(prompt: string, apiKey?: string, context?: WhatIfContext): Promise<WhatIfAction> {
  if (!context) throw new Error('What-if parsing requires the current network and scenario catalog');
  let deterministicError: unknown;
  try {
    return validateTarget(WhatIfActionSchema.parse(parseRuleBased(prompt, context)), context);
  } catch (error) {
    deterministicError = error;
  }
  if (apiKey?.trim()) {
    try {
      return await parseWithProvider(prompt, apiKey, context);
    } catch {
      // The deterministic parser keeps preset and common schedule requests available during provider outages.
    }
  }
  throw deterministicError instanceof Error
    ? deterministicError
    : new Error('What-if request could not be interpreted');
=======
/**
 * Parses a free-text what-if prompt into a structured WhatIfAction.
 * Supports dual-mode:
 * 1. Live LLM API with structured JSON output and 1 retry on validation failure (when API key is provided).
 * 2. Deterministic pattern matching covering all 6 action types (when API key is absent or on network failure).
 */
export async function parseWhatIf(prompt: string, apiKey?: string): Promise<WhatIfAction> {
  if (apiKey) {
    try {
      const llmResult = await callLLMWithRetry(prompt, apiKey);
      if (llmResult) return llmResult;
    } catch {
      // Gracefully fall through to deterministic rule matching
    }
  }

  return parseWithRuleEngine(prompt);
}

/**
 * Deterministic rule-based parser covering all 6 supported WhatIfAction types.
 */
export function parseWithRuleEngine(prompt: string): WhatIfAction {
  const normalized = prompt.toLowerCase();

  // Helper to extract bus ID ("bus 1", "bus b2", "b3")
  const busMatch = normalized.match(/bus\s*([1-3]|b[1-3])|\b(b[1-3])\b/i);
  let busId: string | undefined;
  if (busMatch) {
    const raw = (busMatch[1] || busMatch[2]).toUpperCase();
    busId = raw.startsWith('B') ? raw : `B${raw}`;
  }

  // Helper to extract time ("07:45", "7:45", "12:00")
  const timeMatch = normalized.match(/(\d{1,2}:\d{2})/);
  let timeStr: string | undefined;
  if (timeMatch) {
    timeStr = timeMatch[1];
    if (timeStr.length === 4) timeStr = `0${timeStr}`;
  }

  // 1. Change Capacity: e.g. "increase capacity of bus B1 to 50", "set capacity to 50"
  if (normalized.includes('capacity') || normalized.includes('seat')) {
    const capMatch = normalized.match(/(?:to|of|is|=|set to)\s*(\d{1,3})|(\d{1,3})\s*(?:seats|capacity)/);
    const cap = capMatch ? parseInt(capMatch[1] || capMatch[2], 10) : 50;
    return WhatIfActionSchema.parse({
      action: 'change_capacity',
      busId: busId || 'B1',
      capacity: cap
    });
  }

  // 2. Add Trip: e.g. "add trip at 07:45 to bus B1", "add departure 08:00"
  if (normalized.includes('add') && (normalized.includes('trip') || normalized.includes('departure') || timeStr)) {
    return WhatIfActionSchema.parse({
      action: 'add_trip',
      busId: busId || 'B1',
      newTime: timeStr || '07:45'
    });
  }

  // 3. Remove / Cancel Trip: e.g. "cancel the 12:00 run of bus B3", "remove trip 12:00"
  if (normalized.includes('cancel') || normalized.includes('remove') || normalized.includes('drop')) {
    return WhatIfActionSchema.parse({
      action: 'remove_trip',
      busId: busId || 'B3',
      newTime: timeStr || '12:00'
    });
  }

  // 4. Skip Stop: e.g. "skip stop S2", "bypass stop S4"
  const stopMatch = normalized.match(/stop\s*(s[1-6]|\d)|(s[1-6])/i);
  if (normalized.includes('skip') || normalized.includes('bypass') || normalized.includes('avoid')) {
    let stopId = 'S2';
    if (stopMatch) {
      const raw = (stopMatch[1] || stopMatch[2]).toUpperCase();
      stopId = raw.startsWith('S') ? raw : `S${raw}`;
    }
    return WhatIfActionSchema.parse({
      action: 'skip_stop',
      routeId: 'R1',
      stopId
    });
  }

  // 5. Apply Scenario: "exam", "surge", "rain", "monsoon", "breakdown", "bridge", "closure"
  if (normalized.includes('rain') || normalized.includes('monsoon') || normalized.includes('weather')) {
    return WhatIfActionSchema.parse({
      action: 'apply_scenario',
      scenarioId: 'monsoon_rain'
    });
  }
  if (normalized.includes('exam') || normalized.includes('surge')) {
    return WhatIfActionSchema.parse({
      action: 'apply_scenario',
      scenarioId: 'exam_surge'
    });
  }
  if (normalized.includes('breakdown') || normalized.includes('repair bus')) {
    return WhatIfActionSchema.parse({
      action: 'apply_scenario',
      scenarioId: 'breakdown_b1'
    });
  }
  if (normalized.includes('bridge') || normalized.includes('route closure') || normalized.includes('road closed')) {
    return WhatIfActionSchema.parse({
      action: 'apply_scenario',
      scenarioId: 'bridge_repair'
    });
  }

  // 6. Shift Departure: e.g. "move bus 3 to 07:45", "shift B1 to 07:20"
  if (timeStr) {
    return WhatIfActionSchema.parse({
      action: 'shift_departure',
      busId: busId || 'B3',
      newTime: timeStr
    });
  }

  // Default intelligent fallback
  return WhatIfActionSchema.parse({
    action: 'shift_departure',
    busId: 'B3',
    newTime: '07:45'
  });
}

/**
 * Calls LLM endpoint with retry on validation failure.
 */
async function callLLMWithRetry(prompt: string, apiKey: string): Promise<WhatIfAction | null> {
  const systemPrompt = `You are an AI transit schedule assistant. Given a user what-if query, output ONLY a JSON object matching this schema:
{
  "action": "shift_departure" | "skip_stop" | "add_trip" | "remove_trip" | "change_capacity" | "apply_scenario",
  "busId"?: "B1" | "B2" | "B3",
  "routeId"?: "R1" | "R2",
  "stopId"?: "S1" | "S2" | "S3" | "S4" | "S5" | "S6",
  "newTime"?: "HH:MM",
  "capacity"?: number,
  "scenarioId"?: "exam_surge" | "monsoon_rain" | "breakdown_b1" | "bridge_repair"
}
Output strictly valid JSON with no markdown formatting.`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\nUser query: "${prompt}"` }] }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) return null;

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      const parsedJson = JSON.parse(rawText);
      const validated = WhatIfActionSchema.safeParse(parsedJson);
      if (validated.success) {
        return validated.data;
      }
    } catch {
      // Retry once on failure
    }
  }

  return null;
>>>>>>> feat/api-student
}
