# Routeless API Contract (v1)

Base URL: `http://localhost:3001/api` (dev default)

All endpoints accept and return JSON unless otherwise specified.

---

## 1. `GET /api/health`
Check server status.

### Response `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-11-13T11:20:00Z",
  "version": "1.0.0"
}
```

---

## 2. `GET /api/network`
Fetch current transportation network (stops, routes, buses).

### Response `200 OK`
Returns a `Network` projection of `transport-dataset.json`. Bus route IDs, route stop IDs, travel times, and fleet IDs correspond to the Mangaluru dataset. The response also includes route distances, simulation ID, recommended optimized allocation, and economics used by the simulator and optimizer.

## 2a. `GET /api/dataset`
Fetch the source operational dataset used by the backend, including route demand, current and optimized fleet allocations, fleet status, and operating economics. The response shape is `TransportDataset` from `types.ts` and is seeded from `fixtures/transport-dataset.json`.

`GET /api/network` is projected from the same dataset. `GET /api/students` exposes synthetic representative records generated from each route's aggregate demand, distributed evenly among its non-terminal stops; these records are not individual observed registrations.

### Response `200 OK`
Returns the full dataset object from the fixture.

---

## 3. `GET /api/students` & `POST /api/students`
Get all student demand registrations or register a new student.

### `GET /api/students`
Returns array of `Student`.

### `POST /api/students`
Request Body:
```json
{
  "name": "Ravi Kumar",
  "homeStopId": "S1",
  "destinationId": "S6",
  "routeId": "R01",
  "arriveBy": "08:30",
  "days": [1, 2, 3, 4, 5]
}
```

Response `201 Created`:
```json
{
  "id": "ST-101",
  "name": "Ravi Kumar",
  "homeStopId": "S1",
  "destinationId": "S6",
  "routeId": "R01",
  "arriveBy": "08:30",
  "days": [1, 2, 3, 4, 5]
}
```

---

## 4. `POST /api/simulate`
Run simulation for given network, schedule, and optional scenario patch.

The current student contract does not contain an individual stop-ready time. The simulator deterministically samples each student's stop arrival between 06:00 and 06:59 from the request seed. Provide a `routeId` on generated route-demand records when a rider must be tied to a particular corridor; manually registered riders can omit it and may use any route serving both stops.

### Request Body:
```json
{
  "network": null,
  "schedule": null,
  "scenarioId": "exam_surge",
  "seed": 42
}
```

### Response `200 OK`:
```json
{
  "events": [
    { "time": "07:15", "minute": 435, "type": "depart", "busId": "B1", "stopId": "S1" },
    { "time": "07:15", "minute": 435, "type": "board", "busId": "B1", "stopId": "S1", "count": 22 },
    { "time": "07:30", "minute": 450, "type": "board", "busId": "B1", "stopId": "S2", "count": 13 },
    { "time": "07:30", "minute": 450, "type": "strand", "busId": "B1", "stopId": "S2", "count": 8, "details": "Bus capacity reached" },
    { "time": "08:10", "minute": 490, "type": "arrive", "busId": "B1", "stopId": "S6", "count": 35 }
  ],
  "metrics": {
    "servedOnTime": 65,
    "stranded": 28,
    "avgWaitMin": 22.4,
    "loadFactor": 0.88,
    "revenue": 1625,
    "cost": 1950,
    "viabilityGap": 325
  }
}
```

---

## 5. `POST /api/optimize`
Execute optimizer to produce a better schedule based on demand and weights.

The optimizer uses seeded random-restart hill climbing with a fixed candidate-evaluation cap. Each diff item includes departure changes and may include `oldRouteId` and `newRouteId` when a bus is reassigned. The precomputed POLALI-001 schedule is considered as a fallback candidate.

### Request Body:
```json
{
  "weights": {
    "served": 10.0,
    "wait": 2.0,
    "crowding": 1.5,
    "viability": 1.1
  },
  "scenarioId": null,
  "seed": 42
}
```

### Response `200 OK`:
Returns an `OptimizationResult` with the simulated schedule, changed bus assignments and departures, baseline and optimized `SimResult`s, and weighted score delta. The route and bus IDs reflect the current network dataset.

---

## 6. `GET /api/scenarios`
Retrieve available preset scenarios.

### Response `200 OK`:
```json
[
  {
    "id": "baseline",
    "label": "Normal Day",
    "description": "Standard school morning schedule and demand",
    "patches": []
  },
  {
    "id": "exam_surge",
    "label": "Board Exam Surge",
    "description": "1.4x student demand",
    "patches": [{ "type": "demandMultiplier", "value": 1.4 }]
  },
  {
    "id": "monsoon_rain",
    "label": "Monsoon Rain",
    "description": "Travel times 1.3x slower due to waterlogging",
    "patches": [{ "type": "travelTimeMultiplier", "value": 1.3 }]
  },
  {
    "id": "breakdown_b1",
    "label": "BUS001 Breakdown",
    "description": "BUS001 is unavailable for service",
    "patches": [{ "type": "removeBus", "busId": "BUS001" }]
  },
  {
    "id": "bridge_repair",
    "label": "Route R02 Closure",
    "description": "Route R02 is unavailable",
    "patches": [{ "type": "closeRoute", "routeId": "R02" }]
  }
]
```

---

## 7. `POST /api/whatif`
Natural language scenario translation and simulation.

Recognized presets and common commands are handled locally without an LLM call. For other prompts, when `LLM_API_KEY` is configured the backend uses `LLM_API_URL` and `LLM_MODEL` to call an OpenAI-compatible chat-completions endpoint and validates the returned action, retrying invalid output once. If the provider is unavailable, deterministic rules remain available; unsupported prompts return a clear validation error. Supported actions include shifting, adding, or removing trips; changing capacity; skipping a stop; closing a route; and applying a preset scenario.

### Request Body:
```json
{
  "prompt": "Move BUS001 to 7:30 AM"
}
```

### Response `200 OK`:
Returns `parsedAction`, an optional `appliedScenario`, `actionDescription`, a metric comparison in `explanation`, and the resulting `SimResult`. Metric values are calculated from the current network and registrations.

