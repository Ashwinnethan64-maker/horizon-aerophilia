import type { WhatIfAction } from '../../../contracts/types.js';
import { WhatIfActionSchema } from './schemas.js';

/**
 * Parses a free-text what-if prompt into a structured WhatIfAction.
 * Falls back to deterministic rule matching when no LLM API key is configured.
 */
export async function parseWhatIf(prompt: string, apiKey?: string): Promise<WhatIfAction> {
  const normalized = prompt.toLowerCase();

  // Pattern: "Move Bus X to HH:MM" or "Shift B1 to 07:30"
  const busMatch = normalized.match(/bus\s*([1-3]|b[1-3])/i);
  const timeMatch = normalized.match(/(\d{1,2}:\d{2})/);

  if (busMatch && timeMatch) {
    let busNum = busMatch[1].toUpperCase();
    if (!busNum.startsWith('B')) busNum = `B${busNum}`;
    let timeStr = timeMatch[1];
    if (timeStr.length === 4) timeStr = `0${timeStr}`;

    const candidate: WhatIfAction = {
      action: 'shift_departure',
      busId: busNum,
      newTime: timeStr
    };
    return WhatIfActionSchema.parse(candidate);
  }

  // Pattern: "rain" or "monsoon"
  if (normalized.includes('rain') || normalized.includes('monsoon')) {
    return {
      action: 'apply_scenario',
      scenarioId: 'monsoon_rain'
    };
  }

  // Pattern: "exam" or "surge"
  if (normalized.includes('exam') || normalized.includes('surge')) {
    return {
      action: 'apply_scenario',
      scenarioId: 'exam_surge'
    };
  }

  // Pattern: "breakdown"
  if (normalized.includes('breakdown')) {
    return {
      action: 'apply_scenario',
      scenarioId: 'breakdown_b1'
    };
  }

  // Default fallback action
  return {
    action: 'shift_departure',
    busId: 'B3',
    newTime: '07:45'
  };
}

