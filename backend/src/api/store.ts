import type { Network, Student, Scenario, TransportDataset } from '../../../contracts/types.js';
import { loadFixture, NetworkSchema, TransportDatasetSchema, validateNetworkAndStudents } from '../engine/fixtures.js';
import { PRESET_SCENARIOS } from '../engine/scenarios.js';

export class MemoryStore {
  private dataset: TransportDataset;
  private network: Network;
  private students: Student[];
  private scenarios: Scenario[];

  constructor() {
    this.dataset = loadFixture<TransportDataset>('transport-dataset.json', TransportDatasetSchema);
    const stopNames = [...new Set(this.dataset.routes.flatMap(route => route.stops))];
    const stopIds = new Map(stopNames.map((name, index) => [name, `S${index + 1}`]));
    const stops = stopNames.map((name, index) => ({
      id: stopIds.get(name)!, name,
      x: 60 + (index % 4) * 175,
      y: 50 + Math.floor(index / 4) * 115
    }));
    const routes = this.dataset.routes.map(route => {
      const segments = route.stops.length - 1;
      const baseMinutes = Math.floor(route.travelMinutes / segments);
      const remainder = route.travelMinutes % segments;
      return {
        id: route.id,
        name: route.name,
        stopIds: route.stops.map(name => stopIds.get(name)!),
        travelMinutes: Array.from({ length: segments }, (_, i) => baseMinutes + (i < remainder ? 1 : 0)),
        destinationStopId: stopIds.get(route.stops[route.stops.length - 1])!,
        distanceKm: route.distanceKm
      };
    });
    const availableFleet = this.dataset.fleet.filter(bus => bus.status === 'available');
    let fleetIndex = 0;
    const buses = this.dataset.routes.flatMap(route =>
      Array.from({ length: route.allocatedBuses }, (_, index) => {
        const vehicle = availableFleet[fleetIndex++];
        return {
          id: vehicle?.id ?? `BUS-${route.id}-${index + 1}`,
          routeId: route.id,
          capacity: vehicle?.capacity ?? this.dataset.simulation.capacityPerBus,
          departureTimes: ['07:00'],
          costPerKm: this.dataset.economics.dieselPrice / this.dataset.economics.mileageKmPerLitre + this.dataset.economics.maintenanceCostPerKm,
          maxDriverHours: 8,
          crewCostPerDay: this.dataset.economics.crewCostPerBusPerDay
        };
      })
    );
    this.network = {
      stops,
      routes,
      buses,
      economics: {
        averageFare: this.dataset.economics.averageFare,
        crewCostPerBusPerDay: this.dataset.economics.crewCostPerBusPerDay
      },
      simulationId: this.dataset.simulation.id,
      optimizedAllocation: this.dataset.optimizedAllocation
    };
    this.students = this.dataset.routes.flatMap(route => {
      const homeStops = route.stops.slice(0, -1);
      const destinationId = stopIds.get(route.stops[route.stops.length - 1])!;
      return Array.from({ length: route.demand }, (_, index) => ({
        id: `DEM-${route.id}-${String(index + 1).padStart(3, '0')}`,
        routeId: route.id,
        homeStopId: stopIds.get(homeStops[index % homeStops.length])!,
        destinationId,
        arriveBy: '10:00',
        days: [1, 2, 3, 4, 5]
      }));
    });
    validateNetworkAndStudents(this.network, this.students);
    this.scenarios = JSON.parse(JSON.stringify(PRESET_SCENARIOS));
  }

  getDataset(): TransportDataset {
    return JSON.parse(JSON.stringify(this.dataset));
  }

  getNetwork(): Network {
    return JSON.parse(JSON.stringify(this.network));
  }

  setNetwork(network: Network): void {
    NetworkSchema.parse(network);
    this.network = JSON.parse(JSON.stringify(network));
  }

  getStudents(): Student[] {
    return JSON.parse(JSON.stringify(this.students));
  }

  addStudent(student: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...student,
      id: `ST-${String(this.students.length + 1).padStart(3, '0')}`
    };
    this.students.push(newStudent);
    return newStudent;
  }

  getScenarios(): Scenario[] {
    return JSON.parse(JSON.stringify(this.scenarios));
  }

  getScenario(id: string): Scenario | undefined {
    return this.scenarios.find(s => s.id === id);
  }
}

export const store = new MemoryStore();
