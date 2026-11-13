import type { Bus, Network, SimEvent, Stop, Student } from '../../../contracts/types.js';

export interface ReplayBounds {
  minMinute: number;
  maxMinute: number;
  totalMinutes: number;
}

export interface BusReplayState {
  bus: Bus;
  x: number;
  y: number;
  lat: number;
  lng: number;
  load: number;
  status: 'parked' | 'en_route' | 'at_stop' | 'completed';
  currentStopId?: string;
  nextStopId?: string;
}

export interface StopReplayState {
  stop: Stop;
  isTerminal: boolean;
  totalHomeStudents: number;
  waiting: number;
  stranded: number;
  boarded: number;
  arrived: number;
}

export interface ReplaySnapshot {
  currentMinute: number;
  currentTimeLabel: string;
  buses: BusReplayState[];
  stops: StopReplayState[];
  totals: {
    boarded: number;
    waiting: number;
    stranded: number;
    arrived: number;
  };
  latestEvent: SimEvent | null;
}

export function formatMinuteHHMM(minute: number): string {
  const clamped = Math.max(0, Math.round(minute));
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getReplayBounds(events: SimEvent[]): ReplayBounds {
  if (!events || events.length === 0) {
    return { minMinute: 420, maxMinute: 510, totalMinutes: 90 };
  }
  let minM = Infinity;
  let maxM = -Infinity;
  for (const ev of events) {
    if (ev.minute < minM) minM = ev.minute;
    if (ev.minute > maxM) maxM = ev.minute;
  }
  const minMinute = Math.max(0, minM - 5);
  const maxMinute = Math.max(minMinute + 1, maxM + 5);
  return {
    minMinute,
    maxMinute,
    totalMinutes: maxMinute - minMinute
  };
}

function getStopById(stops: Stop[], id?: string): Stop | undefined {
  if (!id) return undefined;
  return stops.find((s) => s.id === id);
}

export function computeReplaySnapshot(
  network: Network | null,
  students: Student[],
  events: SimEvent[],
  schedule: Bus[],
  currentMinute: number
): ReplaySnapshot {
  const stops = network?.stops ?? [];
  const routes = network?.routes ?? [];
  const buses = schedule.length > 0 ? schedule : network?.buses ?? [];
  const terminalIds = new Set(routes.map((r) => r.destinationStopId));

  // Count initial students per home stop
  const homeCounts = new Map<string, number>();
  for (const st of students) {
    homeCounts.set(st.homeStopId, (homeCounts.get(st.homeStopId) ?? 0) + 1);
  }

  // Track stop & bus counters up to currentMinute
  const boardedAtStop = new Map<string, number>();
  const strandedAtStop = new Map<string, number>();
  const arrivedAtStop = new Map<string, number>();
  const busLoad = new Map<string, number>();
  const busEvents = new Map<string, SimEvent[]>();

  let totalBoarded = 0;
  let totalStranded = 0;
  let totalArrived = 0;
  let latestEvent: SimEvent | null = null;

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);

  for (const ev of sortedEvents) {
    if (ev.busId) {
      const list = busEvents.get(ev.busId) ?? [];
      list.push(ev);
      busEvents.set(ev.busId, list);
    }

    if (ev.minute > currentMinute) continue;
    latestEvent = ev;

    if (ev.type === 'board') {
      const count = ev.count ?? 1;
      totalBoarded += count;
      if (ev.stopId) {
        boardedAtStop.set(ev.stopId, (boardedAtStop.get(ev.stopId) ?? 0) + count);
      }
      if (ev.busId) {
        busLoad.set(ev.busId, (busLoad.get(ev.busId) ?? 0) + count);
      }
    } else if (ev.type === 'strand') {
      const count = ev.count ?? 1;
      totalStranded += count;
      if (ev.stopId) {
        strandedAtStop.set(ev.stopId, (strandedAtStop.get(ev.stopId) ?? 0) + count);
      }
    } else if (ev.type === 'arrive' && ev.stopId && terminalIds.has(ev.stopId)) {
      const disembark = ev.count ?? (ev.busId ? busLoad.get(ev.busId) ?? 0 : 0);
      totalArrived += disembark;
      arrivedAtStop.set(ev.stopId, (arrivedAtStop.get(ev.stopId) ?? 0) + disembark);
      if (ev.busId) {
        busLoad.set(ev.busId, 0);
      }
    }
  }

  // Compute stop states
  let totalWaiting = 0;
  const stopStates: StopReplayState[] = stops.map((stop) => {
    const isTerminal = terminalIds.has(stop.id);
    const totalHome = homeCounts.get(stop.id) ?? 0;
    const boarded = boardedAtStop.get(stop.id) ?? 0;
    const stranded = strandedAtStop.get(stop.id) ?? 0;
    const arrived = arrivedAtStop.get(stop.id) ?? 0;
    const waiting = isTerminal ? 0 : Math.max(0, totalHome - boarded - stranded);
    totalWaiting += waiting;
    return {
      stop,
      isTerminal,
      totalHomeStudents: totalHome,
      waiting,
      stranded,
      boarded,
      arrived
    };
  });

  // Compute bus positions & status (both 2D and real lat/lng)
  const busStates: BusReplayState[] = buses.map((bus) => {
    const route = routes.find((r) => r.id === bus.routeId);
    const startStop = getStopById(stops, route?.stopIds[0]) ?? stops[0];
    const fallbackX = startStop?.x ?? 100;
    const fallbackY = startStop?.y ?? 100;
    const fallbackLat = startStop?.lat ?? 12.8632;
    const fallbackLng = startStop?.lng ?? 74.8378;

    const evs = (busEvents.get(bus.id) ?? []).filter(
      (e) => e.type === 'depart' || e.type === 'arrive'
    );
    const past = evs.filter((e) => e.minute <= currentMinute);
    const future = evs.filter((e) => e.minute > currentMinute);

    let x = fallbackX;
    let y = fallbackY;
    let lat = fallbackLat;
    let lng = fallbackLng;
    let status: BusReplayState['status'] = 'parked';
    let currentStopId: string | undefined = startStop?.id;
    let nextStopId: string | undefined;

    if (past.length > 0) {
      const last = past[past.length - 1];
      const lastStop = getStopById(stops, last.stopId);
      const next = future[0];
      const nextStop = getStopById(stops, next?.stopId);

      if (last.type === 'depart' && lastStop && next && nextStop && next.type === 'arrive') {
        const span = Math.max(1, next.minute - last.minute);
        const t = Math.min(1, Math.max(0, (currentMinute - last.minute) / span));
        x = lastStop.x + (nextStop.x - lastStop.x) * t;
        y = lastStop.y + (nextStop.y - lastStop.y) * t;

        const startLat = lastStop.lat ?? fallbackLat;
        const startLng = lastStop.lng ?? fallbackLng;
        const targetLat = nextStop.lat ?? startLat;
        const targetLng = nextStop.lng ?? startLng;

        lat = startLat + (targetLat - startLat) * t;
        lng = startLng + (targetLng - startLng) * t;

        status = 'en_route';
        currentStopId = lastStop.id;
        nextStopId = nextStop.id;
      } else if (lastStop) {
        x = lastStop.x;
        y = lastStop.y;
        lat = lastStop.lat ?? fallbackLat;
        lng = lastStop.lng ?? fallbackLng;
        currentStopId = lastStop.id;
        status = terminalIds.has(lastStop.id) && future.length === 0 ? 'completed' : 'at_stop';
      }
    }

    return {
      bus,
      x,
      y,
      lat,
      lng,
      load: busLoad.get(bus.id) ?? 0,
      status,
      currentStopId,
      nextStopId
    };
  });

  return {
    currentMinute,
    currentTimeLabel: formatMinuteHHMM(currentMinute),
    buses: busStates,
    stops: stopStates,
    totals: {
      boarded: totalBoarded,
      waiting: totalWaiting,
      stranded: totalStranded,
      arrived: totalArrived
    },
    latestEvent
  };
}
