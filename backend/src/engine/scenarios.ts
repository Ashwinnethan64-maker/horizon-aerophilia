import type { Scenario, Network, Student } from '../../../contracts/types.js';

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

  for (const patch of scenario.patches) {
    switch (patch.type) {
      case 'removeBus':
        if (patch.busId) {
          modNetwork.buses = modNetwork.buses.filter(b => b.id !== patch.busId);
        }
        break;
      case 'closeRoute':
        if (patch.routeId) {
          modNetwork.routes = modNetwork.routes.filter(r => r.id !== patch.routeId);
          modNetwork.buses = modNetwork.buses.filter(b => b.routeId !== patch.routeId);
        }
        break;
      case 'travelTimeMultiplier':
        if (patch.value && patch.value > 0) {
          for (const route of modNetwork.routes) {
            route.travelMinutes = route.travelMinutes.map(m => Math.round(m * patch.value!));
          }
        }
        break;
      case 'capacityMultiplier':
        if (patch.value && patch.value > 0) {
          for (const bus of modNetwork.buses) {
            bus.capacity = Math.max(1, Math.round(bus.capacity * patch.value!));
          }
        }
        break;
      case 'demandMultiplier':
        if (patch.value && patch.value > 1.0) {
          const additionalCount = Math.round(students.length * (patch.value - 1.0));
          const additions: Student[] = [];
          for (let i = 0; i < additionalCount; i++) {
            const template = students[i % students.length];
            additions.push({
              ...template,
              id: `ST-SURGE-${i + 1}`
            });
          }
          modStudents = [...modStudents, ...additions];
        }
        break;
    }
  }

  return { network: modNetwork, students: modStudents };
}
