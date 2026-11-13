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
```json
{
  "stops": [
    { "id": "S1", "name": "Bari Village", "x": 100, "y": 150 },
    { "id": "S2", "name": "Kishanpur Junction", "x": 250, "y": 180 },
    { "id": "S3", "name": "Rampur Crossing", "x": 420, "y": 210 },
    { "id": "S4", "name": "Neelam Valley", "x": 200, "y": 320 },
    { "id": "S5", "name": "Chandan Bridge", "x": 380, "y": 340 },
    { "id": "S6", "name": "Govt High School / Inter College", "x": 550, "y": 260 }
  ],
  "routes": [
    {
      "id": "R1",
      "name": "Northern Route",
      "stopIds": ["S1", "S2", "S3", "S6"],
      "travelMinutes": [15, 20, 20],
      "destinationStopId": "S6"
    },
    {
      "id": "R2",
      "name": "Southern Route",
      "stopIds": ["S4", "S5", "S3", "S6"],
      "travelMinutes": [18, 15, 20],
      "destinationStopId": "S6"
    }
  ],
  "buses": [
    {
      "id": "B1",
      "routeId": "R1",
      "capacity": 35,
      "departureTimes": ["07:15", "08:30"],
      "costPerKm": 18,
      "maxDriverHours": 8
    },
    {
      "id": "B2",
      "routeId": "R2",
      "capacity": 30,
      "departureTimes": ["07:10", "08:35"],
      "costPerKm": 16,
      "maxDriverHours": 8
    },
    {
      "id": "B3",
      "routeId": "R1",
      "capacity": 35,
      "departureTimes": ["12:00"],
      "costPerKm": 18,
      "maxDriverHours": 6
    }
  ]
}
```

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
  "arriveBy": "08:30",
  "days": [1, 2, 3, 4, 5]
}
```

---

## 4. `POST /api/simulate`
Run simulation for given network, schedule, and optional scenario patch.

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

### Request Body:
```json
{
  "weights": {
    "served": 10.0,
    "wait": 2.0,
    "crowding": 1.5,
    "viability": 1.0
  },
  "scenarioId": null,
  "seed": 42
}
```

### Response `200 OK`:
```json
{
  "schedule": [
    {
      "id": "B1",
      "routeId": "R1",
      "capacity": 35,
      "departureTimes": ["07:05", "08:20"],
      "costPerKm": 18,
      "maxDriverHours": 8
    },
    {
      "id": "B2",
      "routeId": "R2",
      "capacity": 30,
      "departureTimes": ["07:10", "08:15"],
      "costPerKm": 16,
      "maxDriverHours": 8
    },
    {
      "id": "B3",
      "routeId": "R1",
      "capacity": 35,
      "departureTimes": ["07:45"],
      "costPerKm": 18,
      "maxDriverHours": 6
    }
  ],
  "diff": [
    {
      "busId": "B1",
      "oldDepartures": ["07:15", "08:30"],
      "newDepartures": ["07:05", "08:20"],
      "changeDescription": "Shifted morning trip 10m earlier to relieve Stop S2 peak"
    },
    {
      "busId": "B3",
      "oldDepartures": ["12:00"],
      "newDepartures": ["07:45"],
      "changeDescription": "Reallocated midday empty bus B3 to 07:45 morning peak relief"
    }
  ],
  "before": {
    "events": [],
    "metrics": {
      "servedOnTime": 65,
      "stranded": 28,
      "avgWaitMin": 22.4,
      "loadFactor": 0.88,
      "revenue": 1625,
      "cost": 1950,
      "viabilityGap": 325
    }
  },
  "after": {
    "events": [],
    "metrics": {
      "servedOnTime": 89,
      "stranded": 4,
      "avgWaitMin": 9.2,
      "loadFactor": 0.82,
      "revenue": 2225,
      "cost": 2340,
      "viabilityGap": 115
    }
  },
  "scoreDelta": 248.5
}
```

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
    "description": "1.4x student demand and earlier arrival targets",
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
    "label": "Bus B1 Breakdown",
    "description": "Bus B1 is unavailable for service",
    "patches": [{ "type": "removeBus", "busId": "B1" }]
  },
  {
    "id": "bridge_repair",
    "label": "Chandan Bridge Closure",
    "description": "Route R2 unavailable due to bridge maintenance",
    "patches": [{ "type": "closeRoute", "routeId": "R2" }]
  }
]
```

---

## 7. `POST /api/whatif`
Natural language scenario translation and simulation.

### Request Body:
```json
{
  "prompt": "Move Bus 3 from noon to 7:45 AM to handle the rush at Bari Village"
}
```

### Response `200 OK`:
```json
{
  "parsedAction": {
    "action": "shift_departure",
    "busId": "B3",
    "newTime": "07:45"
  },
  "explanation": "Shifted Bus 3 from 12:00 to 07:45. This captures 22 additional students who were previously stranded at Bari Village (S1) and Kishanpur (S2), reducing stranded count from 28 to 6.",
  "result": {
    "events": [],
    "metrics": {
      "servedOnTime": 87,
      "stranded": 6,
      "avgWaitMin": 11.1,
      "loadFactor": 0.84,
      "revenue": 2175,
      "cost": 2340,
      "viabilityGap": 165
    }
  }
}
```

