import type { WhatIfAction } from '../../../contracts/types.js';
import { WhatIfActionSchema } from './schemas.js';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent';

const SYSTEM_INSTRUCTION = `You translate natural-language transit what-if prompts into a single JSON object matching this schema:
{
  "action": "shift_departure" | "skip_stop" | "add_trip" | "remove_trip" | "change_capacity" | "apply_scenario",
  "busId": "B1" | "B2" | "B3" (optional),
  "routeId": "R1" | "R2" (optional),
  "stopId": string (optional),
  "newTime": "HH:MM" 24-hour format (optional),
  "capacity": positive number (optional),
  "scenarioId": "baseline" | "exam_surge" | "monsoon_rain" | "breakdown_b1" | "bridge_repair" (optional)
}
Return ONLY raw JSON without markdown fences.`;

/**
 * Deterministic rule-based fallback when Gemini is unconfigured or unavailable.
 */
function parseWhatIfDeterministic(prompt: string): WhatIfAction {
  const normalized = prompt.toLowerCase();

  const busMatch = normalized.match(/bus\s*([1-3]|b[1-3])/i);
  const timeMatch = normalized.match(/(\d{1,2}:\d{2})/);

  if (busMatch && timeMatch) {
    let busNum = busMatch[1].toUpperCase();
    if (!busNum.startsWith('B')) busNum = `B${busNum}`;
    let timeStr = timeMatch[1];
    if (timeStr.length === 4) timeStr = `0${timeStr}`;

    return WhatIfActionSchema.parse({
      action: 'shift_departure',
      busId: busNum,
      newTime: timeStr
    });
  }

  if (normalized.includes('rain') || normalized.includes('monsoon')) {
    return { action: 'apply_scenario', scenarioId: 'monsoon_rain' };
  }
  if (normalized.includes('exam') || normalized.includes('surge')) {
    return { action: 'apply_scenario', scenarioId: 'exam_surge' };
  }
  if (normalized.includes('breakdown')) {
    return { action: 'apply_scenario', scenarioId: 'breakdown_b1' };
  }
  if (normalized.includes('bridge') || normalized.includes('closure')) {
    return { action: 'apply_scenario', scenarioId: 'bridge_repair' };
  }

  return {
    action: 'shift_departure',
    busId: 'B3',
    newTime: '07:45'
  };
}

/**
 * Parses a free-text what-if prompt into a structured WhatIfAction using Gemini,
 * falling back to deterministic rule matching when no API key is configured or on error.
 */
export async function parseWhatIf(prompt: string, apiKey?: string): Promise<WhatIfAction> {
  const trimmedKey = apiKey?.trim();
  if (!trimmedKey || trimmedKey === 'your_gemini_api_key_here') {
    return parseWhatIfDeterministic(prompt);
  }

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': trimmedKey
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nPrompt: ${prompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: 'application/json'
        }
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return parseWhatIfDeterministic(prompt);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return parseWhatIfDeterministic(prompt);
    }

    const cleaned = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
    const candidate = JSON.parse(cleaned);
    return WhatIfActionSchema.parse(candidate);
  } catch {
    return parseWhatIfDeterministic(prompt);
  }
}
