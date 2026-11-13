import type { Bus, Network, Route, Scenario, SimEvent, SimResult, Student } from '../../../contracts/types.js';
import { createRNG } from './rng.js';
import { applyScenario } from './scenarios.js';
import { formatHHMM, parseHHMM } from './time.js';

export { parseHHMM, formatHHMM } from './time.js';

const SIMULATION_START = 6 * 60;
const SIMULATION_END = 10 * 60;
const ARRIVAL_WINDOW_MINUTES = 60;

type RiderState = 'waiting' | 'onBus' | 'served' | 'stranded';

interface Rider extends Student {
  readyAt: number;
  state: RiderState;
  waitMinutes?: number;
}

interface Trip {
  bus: Bus;
  route: Route;
  departureMinute: number;
  currentStopIndex: number;
  segmentStartMinute: number;
  nextStopMinute: number;
  passengers: Rider[];
  active: boolean;
}

function routeForStudent(network: Network, student: Student, requiredRouteId?: string): { route: Route; homeIndex: number; destinationIndex: number } | undefined {
  for (const route of network.routes) {
    if (requiredRouteId && route.id !== requiredRouteId) continue;
    if (student.routeId && student.routeId !== route.id) continue;
    const homeIndex = route.stopIds.indexOf(student.homeStopId);
    const destinationIndex = route.stopIds.indexOf(student.destinationId);
    if (homeIndex >= 0 && destinationIndex > homeIndex) return { route, homeIndex, destinationIndex };
  }
  return undefined;
}

function eventAt(minute: number, type: SimEvent['type'], data: Omit<SimEvent, 'minute' | 'time' | 'type'> = {}): SimEvent {
  return { minute, time: formatHHMM(minute), type, ...data };
}

/**
 * Simulate a school-day service from 06:00 to 10:00 in deterministic one-minute ticks.
 * The source data has no individual ready-time field, so each rider's stop arrival is
 * sampled from 06:00-07:00 using the supplied seed. Identical inputs and seed are repeatable.
 */
export function simulate(
  network: Network,
  students: Student[],
  scenario?: Scenario,
  seed: number = 42,
  headless: boolean = false
): SimResult {
  const rng = createRNG(seed);
  const { network: activeNetwork, students: activeStudents } = applyScenario(network, students, scenario);
  const riders: Rider[] = activeStudents.map(student => ({
    ...student,
    readyAt: SIMULATION_START + Math.floor(rng() * ARRIVAL_WINDOW_MINUTES),
    state: 'waiting'
  }));
  const events: SimEvent[] = [];
  const tripsByMinute = new Map<number, Trip[]>();
  const busesById = new Map<string, Bus>(activeNetwork.buses.map(bus => [bus.id, bus] as const));

  for (const bus of activeNetwork.buses) {
    const route = activeNetwork.routes.find(candidate => candidate.id === bus.routeId);
    if (!route) continue;
    for (const departure of bus.departureTimes) {
      const departureMinute = parseHHMM(departure);
      if (departureMinute < SIMULATION_START || departureMinute > SIMULATION_END) continue;
      const trip: Trip = {
        bus, route, departureMinute, currentStopIndex: 0,
        segmentStartMinute: departureMinute,
        nextStopMinute: departureMinute + route.travelMinutes[0],
        passengers: [], active: true
      };
      const queue = tripsByMinute.get(departureMinute) ?? [];
      queue.push(trip);
      tripsByMinute.set(departureMinute, queue);
    }
  }

  let passengerMinutes = 0;
  let capacityMinutes = 0;
  let waitMinutesTotal = 0;
  const busesUsed = new Set<string>();
  let tripCost = 0;

  const addEvents = (...newEvents: SimEvent[]) => {
    if (!headless) events.push(...newEvents);
  };

  const boardAtCurrentStop = (trip: Trip, minute: number) => {
    const stopId = trip.route.stopIds[trip.currentStopIndex];
    const eligible = riders
      .filter(rider => rider.state === 'waiting' && rider.homeStopId === stopId && rider.readyAt <= minute)
      .filter(rider => {
        const match = routeForStudent(activeNetwork, rider, trip.route.id);
        if (!match || match.homeIndex < trip.currentStopIndex) return false;
        const rideMinutes = trip.route.travelMinutes
          .slice(trip.currentStopIndex, match.destinationIndex)
          .reduce((sum, minutes) => sum + minutes, 0);
        return minute + rideMinutes <= parseHHMM(rider.arriveBy);
      })
      .sort((a, b) => a.readyAt - b.readyAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const seatCount = Math.max(0, trip.bus.capacity - trip.passengers.length);
    const boarded = eligible.slice(0, seatCount);
    for (const rider of boarded) {
      rider.state = 'onBus';
      rider.waitMinutes = minute - rider.readyAt;
      waitMinutesTotal += rider.waitMinutes;
      trip.passengers.push(rider);
    }
    if (boarded.length > 0) {
      addEvents(eventAt(minute, 'board', {
        busId: trip.bus.id, routeId: trip.route.id, stopId, count: boarded.length
      }));
    }
  };

  for (let minute = SIMULATION_START; minute <= SIMULATION_END; minute++) {
    const started = tripsByMinute.get(minute) ?? [];
    for (const trip of started) {
      busesUsed.add(trip.bus.id);
      const distance = trip.route.distanceKm ?? trip.route.travelMinutes.reduce((sum, value) => sum + value, 0) / 2;
      tripCost += distance * trip.bus.costPerKm;
      addEvents(eventAt(minute, 'depart', {
        busId: trip.bus.id, routeId: trip.route.id, stopId: trip.route.stopIds[0]
      }));
      boardAtCurrentStop(trip, minute);
    }

    const activeTrips = [...started, ...[...tripsByMinute.values()].flat().filter(trip => trip.active && trip.departureMinute < minute)];
    for (const trip of activeTrips) {
      if (!trip.active) continue;
      if (minute === trip.nextStopMinute) {
        trip.currentStopIndex++;
        const stopId = trip.route.stopIds[trip.currentStopIndex];
        const delivered = trip.passengers.filter(rider => rider.destinationId === stopId);
        trip.passengers = trip.passengers.filter(rider => rider.destinationId !== stopId);
        let lateCount = 0;
        for (const rider of delivered) {
          if (minute <= parseHHMM(rider.arriveBy)) rider.state = 'served';
          else {
            rider.state = 'stranded';
            lateCount++;
          }
        }
        addEvents(eventAt(minute, 'arrive', {
          busId: trip.bus.id, routeId: trip.route.id, stopId, count: delivered.length
        }));
        if (lateCount > 0) {
          addEvents(eventAt(minute, 'strand', {
            busId: trip.bus.id, routeId: trip.route.id, stopId, count: lateCount,
            details: 'Arrived after the student arrival deadline'
          }));
        }

        if (trip.currentStopIndex >= trip.route.stopIds.length - 1) {
          if (trip.passengers.length > 0) {
            const failed = trip.passengers;
            trip.passengers = [];
            for (const rider of failed) rider.state = 'stranded';
            addEvents(eventAt(minute, 'strand', {
              busId: trip.bus.id, routeId: trip.route.id, stopId, count: failed.length,
              details: 'Destination is not served by this route'
            }));
          }
          trip.active = false;
          continue;
        }

        trip.segmentStartMinute = minute;
        trip.nextStopMinute = minute + trip.route.travelMinutes[trip.currentStopIndex];
        boardAtCurrentStop(trip, minute);
      }

      if (!trip.active) continue;
      passengerMinutes += trip.passengers.length;
      capacityMinutes += trip.bus.capacity;
      const fromStop = trip.route.stopIds[trip.currentStopIndex];
      const toStop = trip.route.stopIds[trip.currentStopIndex + 1];
      const duration = trip.nextStopMinute - trip.segmentStartMinute;
      const progress = duration > 0 ? Math.min(1, (minute - trip.segmentStartMinute) / duration) : 1;
      addEvents(eventAt(minute, 'bus_position', {
        busId: trip.bus.id, routeId: trip.route.id, stopId: fromStop,
        details: `to=${toStop};progress=${progress.toFixed(2)}`
      }));
    }

    for (const rider of riders) {
      if (rider.state !== 'waiting' || minute < parseHHMM(rider.arriveBy)) continue;
      rider.state = 'stranded';
      rider.waitMinutes = Math.max(0, minute - rider.readyAt);
      waitMinutesTotal += rider.waitMinutes;
      addEvents(eventAt(minute, 'strand', {
        stopId: rider.homeStopId, studentId: rider.id, count: 1,
        details: 'No available bus reached the stop before the arrival deadline'
      }));
    }
  }

  // Riders still aboard or waiting at the end of the simulation are counted as unserved.
  for (const trip of [...tripsByMinute.values()].flat()) {
    if (!trip.active) continue;
    for (const rider of trip.passengers) {
      rider.state = 'stranded';
      addEvents(eventAt(SIMULATION_END, 'strand', {
        busId: trip.bus.id, routeId: trip.route.id, stopId: trip.route.stopIds[trip.currentStopIndex],
        studentId: rider.id, count: 1, details: 'Trip did not reach destination by simulation end'
      }));
    }
    trip.active = false;
  }
  for (const rider of riders) {
    if (rider.state !== 'waiting') continue;
    rider.state = 'stranded';
    rider.waitMinutes = Math.max(0, SIMULATION_END - rider.readyAt);
    waitMinutesTotal += rider.waitMinutes;
    addEvents(eventAt(SIMULATION_END, 'strand', {
      stopId: rider.homeStopId, studentId: rider.id, count: 1,
      details: 'No service before simulation end'
    }));
  }

  const crewCostPerBus = activeNetwork.economics?.crewCostPerBusPerDay ?? 0;
  const additionalCrewCost = [...busesById.values()].reduce((sum, bus) =>
    sum + (busesUsed.has(bus.id) ? (bus.crewCostPerDay ?? crewCostPerBus) : 0), 0);
  const servedOnTime = riders.filter(rider => rider.state === 'served').length;
  const stranded = riders.length - servedOnTime;
  const revenue = servedOnTime * (activeNetwork.economics?.averageFare ?? 20);
  const cost = Math.round(tripCost + additionalCrewCost);

  return {
    events,
    metrics: {
      servedOnTime,
      stranded,
      avgWaitMin: riders.length === 0 ? 0 : Math.round((waitMinutesTotal / riders.length) * 10) / 10,
      loadFactor: capacityMinutes === 0 ? 0 : Math.round((passengerMinutes / capacityMinutes) * 1000) / 1000,
      revenue,
      cost,
      viabilityGap: Math.max(0, cost - revenue)
    }
  };
}
