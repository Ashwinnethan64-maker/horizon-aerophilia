export interface Stop {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Route {
  id: string;
  name?: string;
  stopIds: string[];
  travelMinutes: number[]; // travel time between consecutive stops (length = stopIds.length - 1)
  destinationStopId: string; // school or college terminal
}

export interface Bus {
  id: string;
  routeId: string;
  capacity: number;
  departureTimes: string[]; // "HH:MM" 24-hr format
  costPerKm: number;
  maxDriverHours: number;
}

export interface Student {
  id: string;
  name?: string;
  homeStopId: string;
  destinationId: string;
  arriveBy: string; // "HH:MM" target arrival deadline
  days: number[]; // 0-6 (0 = Sunday, 1 = Monday, etc.)
}

export interface Network {
  stops: Stop[];
  routes: Route[];
  buses: Bus[];
}

export type PatchType =
  | 'demandMultiplier'
  | 'capacityMultiplier'
  | 'travelTimeMultiplier'
  | 'removeBus'
  | 'closeRoute'
  | 'shiftDeparture';

export interface Patch {
  type: PatchType;
  value?: number;
  busId?: string;
  routeId?: string;
  stopId?: string;
  newTime?: string;
}

export interface Scenario {
  id: string;
  label: string;
  description?: string;
  patches: Patch[];
}

export interface Weights {
  served: number;
  wait: number;
  crowding: number;
  viability: number;
}

export type SimEventType =
  | 'board'
  | 'strand'
  | 'arrive'
  | 'depart'
  | 'bus_position';

export interface SimEvent {
  time: string; // "HH:MM"
  minute: number; // minutes from midnight (e.g. 420 for 07:00)
  type: SimEventType;
  busId?: string;
  routeId?: string;
  stopId?: string;
  studentId?: string;
  count?: number;
  details?: string;
}

export interface SimMetrics {
  servedOnTime: number;
  stranded: number;
  avgWaitMin: number;
  loadFactor: number; // 0.0 to 1.0 (or percentage)
  revenue: number;
  cost: number;
  viabilityGap: number; // max(0, requiredRevenue - revenue)
}

export interface SimResult {
  events: SimEvent[];
  metrics: SimMetrics;
}

export interface ScheduleDiffItem {
  busId: string;
  oldDepartures: string[];
  newDepartures: string[];
  changeDescription: string;
}

export interface OptimizationResult {
  schedule: Bus[];
  diff: ScheduleDiffItem[];
  before: SimResult;
  after: SimResult;
  scoreDelta: number;
}

export interface SimulateRequest {
  network?: Network;
  schedule?: Bus[];
  scenarioId?: string;
  scenario?: Scenario;
  seed?: number;
}

export interface OptimizeRequest {
  network?: Network;
  weights?: Weights;
  scenarioId?: string;
  seed?: number;
}

export type WhatIfActionType =
  | 'shift_departure'
  | 'skip_stop'
  | 'add_trip'
  | 'remove_trip'
  | 'change_capacity'
  | 'apply_scenario';

export interface WhatIfAction {
  action: WhatIfActionType;
  busId?: string;
  routeId?: string;
  stopId?: string;
  newTime?: string;
  capacity?: number;
  scenarioId?: string;
}

export interface WhatIfRequest {
  prompt: string;
  currentNetwork?: Network;
  currentSchedule?: Bus[];
}

export interface WhatIfResponse {
  parsedAction: WhatIfAction;
  appliedScenario?: Scenario;
  explanation: string;
  result: SimResult;
}

