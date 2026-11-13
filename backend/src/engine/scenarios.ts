import type { Scenario, Network, Student } from '../../../contracts/types.js';
import { parseHHMM } from './time.js';

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'baseline',
    label: 'Normal Day',
    description: 'Standard school morning schedule and demand',
    patches: []
  },
  {
    id: 'exam_surge',
    label: 'Board Exam Surge',
    description: '1.4x student demand',
    patches: [{ type: 'demandMultiplier', value: 1.4 }]
  },
  {
    id: 'monsoon_rain',
    label: 'Monsoon Rain',
    description: 'Travel times increase by 30% due to waterlogging',
    patches: [{ type: 'travelTimeMultiplier', value: 1.3 }]
  },
  {
    id: 'breakdown_b1',
    label: 'BUS001 Breakdown',
    description: 'BUS001 is unavailable for service',
    patches: [{ type: 'removeBus', busId: 'BUS001' }]
  },
  {
    id: 'bridge_repair',
    label: 'Route R02 Closure',
    description: 'Route R02 is unavailable',
    patches: [{ type: 'closeRoute', routeId: 'R02' }]
  }
];

function requireMultiplier(value: number | undefined, patchType: string, allowZero = false): number {
  if (value === undefined || !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) {
    throw new RangeError(`${patchType} requires a ${allowZero ? 'non-negative' : 'positive'} finite multiplier`);
  }
  return value;
}

export function applyScenario(
  network: Network,
  students: Student[],
  scenario?: Scenario
): { network: Network; students: Student[] } {
  if (!scenario || scenario.patches.length === 0) {
    return {
      network: JSON.parse(JSON.stringify(network)),
      students: JSON.parse(JSON.stringify(students))
    };
  }

  const modNetwork: Network = JSON.parse(JSON.stringify(network));
  let modStudents: Student[] = JSON.parse(JSON.stringify(students));

  for (const [patchIndex, patch] of scenario.patches.entries()) {
    switch (patch.type) {
      case 'removeBus':
        if (!patch.busId) throw new Error('removeBus patch requires busId');
        modNetwork.buses = modNetwork.buses.filter(b => b.id !== patch.busId);
        break;
      case 'closeRoute':
        if (!patch.routeId) throw new Error('closeRoute patch requires routeId');
        modNetwork.routes = modNetwork.routes.filter(r => r.id !== patch.routeId);
        modNetwork.buses = modNetwork.buses.filter(b => b.routeId !== patch.routeId);
        break;
      case 'travelTimeMultiplier':
        {
          const multiplier = requireMultiplier(patch.value, patch.type);
          for (const route of modNetwork.routes) {
            route.travelMinutes = route.travelMinutes.map(minutes => Math.max(1, Math.round(minutes * multiplier)));
          }
        }
        break;
      case 'capacityMultiplier':
        {
          const multiplier = requireMultiplier(patch.value, patch.type);
          for (const bus of modNetwork.buses) {
            bus.capacity = Math.max(1, Math.round(bus.capacity * multiplier));
          }
        }
        break;
      case 'demandMultiplier':
        {
          const multiplier = requireMultiplier(patch.value, patch.type, true);
          const previous = modStudents;
          const targetCount = Math.round(previous.length * multiplier);
          if (targetCount < previous.length) {
            modStudents = targetCount === 0
              ? []
              : Array.from({ length: targetCount }, (_, index) =>
                  previous[Math.floor(((index + 0.5) * previous.length) / targetCount)]
                );
          } else if (targetCount > previous.length && previous.length > 0) {
            const additionCount = targetCount - previous.length;
            const spreadCount = Math.min(additionCount, previous.length);
            const additions: Student[] = Array.from({ length: additionCount }, (_, index) => ({
              ...previous[Math.floor((index % spreadCount) * previous.length / spreadCount)],
              id: `SCN-${scenario.id}-${patchIndex + 1}-${index + 1}`
            }));
            modStudents = [...previous, ...additions];
          }
        }
        break;
      case 'shiftDeparture':
        {
          if (!patch.busId || !patch.newTime) throw new Error('shiftDeparture patch requires busId and newTime');
          parseHHMM(patch.newTime);
          const bus = modNetwork.buses.find(candidate => candidate.id === patch.busId);
          if (bus) bus.departureTimes = [patch.newTime];
        }
        break;
    }
  }

  return { network: modNetwork, students: modStudents };
}

