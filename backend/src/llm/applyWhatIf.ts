import type { Network, Scenario, WhatIfAction } from '../../../contracts/types.js';
import { parseHHMM } from '../engine/time.js';

export interface AppliedWhatIf {
  network: Network;
  scenario?: Scenario;
  description: string;
}

function required(value: string | undefined, field: string): string {
  if (!value) throw new Error(`${field} is required for this what-if action`);
  return value;
}

function routeDuration(network: Network, routeId: string): number {
  const route = network.routes.find(candidate => candidate.id === routeId);
  if (!route) throw new Error(`Unknown route: ${routeId}`);
  return route.travelMinutes.reduce((sum, minutes) => sum + minutes, 0);
}

function validateDuty(network: Network, busId: string): void {
  const bus = network.buses.find(candidate => candidate.id === busId);
  if (!bus) throw new Error(`Unknown bus: ${busId}`);
  const duration = routeDuration(network, bus.routeId);
  const departures = bus.departureTimes.map(parseHHMM).sort((a, b) => a - b);
  let driveMinutes = 0;
  let previousArrival = -Infinity;
  for (const departure of departures) {
    if (departure < previousArrival) throw new Error(`Trips for ${busId} overlap`);
    driveMinutes += duration;
    previousArrival = departure + duration;
  }
  if (driveMinutes > bus.maxDriverHours * 60) {
    throw new Error(`Adding this trip would exceed ${busId}'s ${bus.maxDriverHours}-hour driver limit`);
  }
}

export function applyWhatIfAction(network: Network, action: WhatIfAction, scenarios: Scenario[]): AppliedWhatIf {
  const updated: Network = JSON.parse(JSON.stringify(network));
  let description: string;

  switch (action.action) {
    case 'apply_scenario': {
      const scenarioId = required(action.scenarioId, 'scenarioId');
      const scenario = scenarios.find(candidate => candidate.id === scenarioId);
      if (!scenario) throw new Error(`Unknown scenario: ${scenarioId}`);
      return { network: updated, scenario, description: `Applied ${scenario.label}.` };
    }
    case 'shift_departure': {
      const busId = required(action.busId, 'busId');
      const newTime = required(action.newTime, 'newTime');
      parseHHMM(newTime);
      const bus = updated.buses.find(candidate => candidate.id === busId);
      if (!bus) throw new Error(`Unknown bus: ${busId}`);
      bus.departureTimes = [newTime];
      validateDuty(updated, busId);
      description = `Moved ${busId}'s service to ${newTime}.`;
      break;
    }
    case 'change_capacity': {
      const busId = required(action.busId, 'busId');
      const bus = updated.buses.find(candidate => candidate.id === busId);
      if (!bus) throw new Error(`Unknown bus: ${busId}`);
      if (!action.capacity || !Number.isInteger(action.capacity)) throw new Error('capacity must be a positive integer');
      bus.capacity = action.capacity;
      description = `Changed ${busId}'s capacity to ${bus.capacity} seats.`;
      break;
    }
    case 'add_trip': {
      const busId = required(action.busId, 'busId');
      const newTime = required(action.newTime, 'newTime');
      parseHHMM(newTime);
      const bus = updated.buses.find(candidate => candidate.id === busId);
      if (!bus) throw new Error(`Unknown bus: ${busId}`);
      if (bus.departureTimes.includes(newTime)) throw new Error(`${busId} already has a trip at ${newTime}`);
      bus.departureTimes.push(newTime);
      bus.departureTimes.sort((a, b) => parseHHMM(a) - parseHHMM(b));
      validateDuty(updated, busId);
      description = `Added a ${busId} trip at ${newTime}.`;
      break;
    }
    case 'remove_trip': {
      const busId = required(action.busId, 'busId');
      const bus = updated.buses.find(candidate => candidate.id === busId);
      if (!bus) throw new Error(`Unknown bus: ${busId}`);
      if (action.newTime) {
        const remaining = bus.departureTimes.filter(time => time !== action.newTime);
        if (remaining.length === bus.departureTimes.length) throw new Error(`${busId} has no trip at ${action.newTime}`);
        bus.departureTimes = remaining;
        description = `Removed ${busId}'s ${action.newTime} trip.`;
      } else {
        bus.departureTimes = [];
        description = `Removed all scheduled trips for ${busId}.`;
      }
      break;
    }
    case 'skip_stop': {
      const routeId = required(action.routeId, 'routeId');
      const stopId = required(action.stopId, 'stopId');
      const route = updated.routes.find(candidate => candidate.id === routeId);
      if (!route) throw new Error(`Unknown route: ${routeId}`);
      const stopIndex = route.stopIds.indexOf(stopId);
      if (stopIndex <= 0 || stopIndex >= route.stopIds.length - 1) {
        throw new Error('Only an intermediate stop can be skipped');
      }
      const combinedTravel = route.travelMinutes[stopIndex - 1] + route.travelMinutes[stopIndex];
      route.stopIds.splice(stopIndex, 1);
      route.travelMinutes.splice(stopIndex - 1, 2, combinedTravel);
      description = `Skipped ${stopId} on ${routeId}; adjacent travel legs were combined.`;
      break;
    }
    case 'close_route': {
      const routeId = required(action.routeId, 'routeId');
      if (!updated.routes.some(route => route.id === routeId)) throw new Error(`Unknown route: ${routeId}`);
      updated.routes = updated.routes.filter(route => route.id !== routeId);
      updated.buses = updated.buses.filter(bus => bus.routeId !== routeId);
      description = `Closed ${routeId} and removed its assigned buses from service.`;
      break;
    }
  }

  return { network: updated, description };
}
