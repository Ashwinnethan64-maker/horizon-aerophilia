import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import type { Network, Student, TransportDataset, SimResult, OptimizedScheduleSeed } from '../../../contracts/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../../../contracts/fixtures');

const positiveInt = z.number().int().positive();
const nonNegativeInt = z.number().int().nonnegative();
const HHMM = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/);

export const TransportDatasetSchema: z.ZodType<TransportDataset> = z.object({
  simulation: z.object({
    id: z.string().min(1), name: z.string().min(1), type: z.string().min(1),
    totalBuses: positiveInt, availableBuses: nonNegativeInt, maintenanceBuses: nonNegativeInt,
    capacityPerBus: positiveInt, peakPeriod: z.string().regex(/^\d{2}:\d{2}-\d{2}:\d{2}$/)
  }),
  routes: z.array(z.object({
    id: z.string().min(1), name: z.string().min(1), stops: z.array(z.string().min(1)).min(2),
    distanceKm: positiveInt, travelMinutes: positiveInt, demand: nonNegativeInt,
    priority: z.number().int().min(1).max(5), allocatedBuses: nonNegativeInt
  }).refine(route => new Set(route.stops).size === route.stops.length, 'Route stop names must be unique')),
  fleet: z.array(z.object({
    id: z.string().min(1), operator: z.string().min(1), capacity: positiveInt,
    status: z.enum(['available', 'maintenance'])
  })),
  optimizedAllocation: z.record(z.string(), nonNegativeInt),
  economics: z.object({
    dieselPrice: positiveInt, mileageKmPerLitre: positiveInt, maintenanceCostPerKm: nonNegativeInt,
    crewCostPerBusPerDay: nonNegativeInt, averageFare: nonNegativeInt
  })
}).superRefine((dataset, ctx) => {
  const addIssue = (message: string, path: Array<string | number> = []) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, message, path });
  const available = dataset.fleet.filter(bus => bus.status === 'available').length;
  const maintenance = dataset.fleet.length - available;
  const currentAllocation = dataset.routes.reduce((sum, route) => sum + route.allocatedBuses, 0);
  const optimizedAllocation = Object.values(dataset.optimizedAllocation).reduce((sum, count) => sum + count, 0);
  if (dataset.simulation.totalBuses !== dataset.fleet.length) addIssue('totalBuses must match fleet length', ['simulation', 'totalBuses']);
  if (dataset.simulation.availableBuses !== available) addIssue('availableBuses must match available fleet count', ['simulation', 'availableBuses']);
  if (dataset.simulation.maintenanceBuses !== maintenance) addIssue('maintenanceBuses must match maintenance fleet count', ['simulation', 'maintenanceBuses']);
  if (currentAllocation !== available) addIssue('Current route allocations must use all available buses', ['routes']);
  if (optimizedAllocation !== available) addIssue('Optimized allocation must use all available buses', ['optimizedAllocation']);
  const routeIds = new Set(dataset.routes.map(route => route.id));
  if (routeIds.size !== dataset.routes.length) addIssue('Route IDs must be unique', ['routes']);
  for (const routeId of Object.keys(dataset.optimizedAllocation)) {
    if (!routeIds.has(routeId)) addIssue(`Optimized allocation references unknown route ${routeId}`, ['optimizedAllocation', routeId]);
  }
  for (const route of dataset.routes) {
    if (dataset.optimizedAllocation[route.id] === undefined) addIssue(`Optimized allocation is missing route ${route.id}`, ['optimizedAllocation', route.id]);
  }
});

export const NetworkSchema: z.ZodType<Network> = z.object({
  stops: z.array(z.object({ id: z.string().min(1), name: z.string().min(1), x: z.number(), y: z.number() })),
  routes: z.array(z.object({
    id: z.string().min(1), name: z.string().optional(), stopIds: z.array(z.string().min(1)).min(2),
    travelMinutes: z.array(positiveInt), destinationStopId: z.string().min(1), distanceKm: positiveInt.optional()
  }).refine(route => route.travelMinutes.length === route.stopIds.length - 1, 'travelMinutes must cover each route segment')),
  buses: z.array(z.object({
    id: z.string().min(1), routeId: z.string().min(1), capacity: positiveInt,
    departureTimes: z.array(HHMM), costPerKm: z.number().nonnegative(), maxDriverHours: positiveInt,
    crewCostPerDay: nonNegativeInt.optional(), permittedRouteIds: z.array(z.string().min(1)).optional()
  })),
  economics: z.object({ averageFare: nonNegativeInt, crewCostPerBusPerDay: nonNegativeInt }).optional(),
  simulationId: z.string().optional(),
  optimizedAllocation: z.record(z.string(), nonNegativeInt).optional()
}).superRefine((network, ctx) => {
  const stopIds = new Set(network.stops.map(stop => stop.id));
  const routeIds = new Set(network.routes.map(route => route.id));
  for (const route of network.routes) {
    for (const stopId of route.stopIds) {
      if (!stopIds.has(stopId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Route ${route.id} references unknown stop ${stopId}` });
    }
    if (!stopIds.has(route.destinationStopId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Route ${route.id} references unknown destination ${route.destinationStopId}` });
  }
  for (const bus of network.buses) {
    if (!routeIds.has(bus.routeId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Bus ${bus.id} references unknown route ${bus.routeId}` });
    for (const routeId of bus.permittedRouteIds ?? []) {
      if (!routeIds.has(routeId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Bus ${bus.id} permits unknown route ${routeId}` });
    }
  }
  if (network.optimizedAllocation) {
    const optimizedBuses = Object.values(network.optimizedAllocation).reduce((sum, count) => sum + count, 0);
    if (optimizedBuses !== network.buses.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'optimizedAllocation must account for every bus' });
    }
    for (const routeId of Object.keys(network.optimizedAllocation)) {
      if (!routeIds.has(routeId)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: `optimizedAllocation references unknown route ${routeId}` });
    }
  }
});

export const OptimizedScheduleSeedSchema: z.ZodType<OptimizedScheduleSeed> = z.object({
  simulationId: z.string().min(1),
  assignments: z.array(z.object({
    busId: z.string().min(1), routeId: z.string().min(1), departureTimes: z.array(HHMM)
  }))
});

export const StudentsSchema: z.ZodType<Student[]> = z.array(z.object({
  id: z.string().min(1), name: z.string().optional(), homeStopId: z.string().min(1),
  destinationId: z.string().min(1), arriveBy: HHMM, days: z.array(z.number().int().min(0).max(6)),
  routeId: z.string().optional()
}));

export const SimResultSchema: z.ZodType<SimResult> = z.object({
  events: z.array(z.object({
    time: HHMM, minute: nonNegativeInt,
    type: z.enum(['board', 'strand', 'arrive', 'depart', 'bus_position']),
    busId: z.string().optional(), routeId: z.string().optional(), stopId: z.string().optional(),
    studentId: z.string().optional(), count: nonNegativeInt.optional(), details: z.string().optional()
  })),
  metrics: z.object({
    servedOnTime: nonNegativeInt, stranded: nonNegativeInt, avgWaitMin: z.number().nonnegative(),
    loadFactor: z.number().nonnegative(), revenue: z.number().nonnegative(), cost: z.number().nonnegative(),
    viabilityGap: z.number().nonnegative()
  })
});

export function loadFixture<T>(filename: string, schema: z.ZodType<T>): T {
  const filePath = path.join(fixturesDir, filename);
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`Unable to read JSON fixture ${filename}: ${error instanceof Error ? error.message : String(error)}`);
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues.map(issue => `${issue.path.join('.') || '<root>'}: ${issue.message}`).join('; ');
    throw new Error(`Invalid fixture ${filename}: ${details}`);
  }
  return parsed.data;
}

export function validateNetworkAndStudents(network: Network, students: Student[]): void {
  const parsedNetwork = NetworkSchema.parse(network);
  const parsedStudents = StudentsSchema.parse(students);
  const stopIds = new Set(parsedNetwork.stops.map(stop => stop.id));
  for (const student of parsedStudents) {
    if (!stopIds.has(student.homeStopId)) throw new Error(`Student ${student.id} references unknown home stop ${student.homeStopId}`);
    if (!stopIds.has(student.destinationId)) throw new Error(`Student ${student.id} references unknown destination ${student.destinationId}`);
    if (student.routeId && !parsedNetwork.routes.some(route => route.id === student.routeId)) {
      throw new Error(`Student ${student.id} references unknown route ${student.routeId}`);
    }
  }
}
