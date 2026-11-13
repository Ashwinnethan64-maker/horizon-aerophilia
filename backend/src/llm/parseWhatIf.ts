import type { WhatIfAction } from '../../../contracts/types.js';
import { WhatIfActionSchema } from './schemas.js';

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
}
