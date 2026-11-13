# YatraGrid — Geographic Map, Leaflet Simulation & UI Refresh Plan

**Scope:** Mangaluru–Gurupura–Polali and a 5 km outward buffer  
**Purpose:** Replace the current schematic/fictitious map in the Owner Portal with a real, interactive Leaflet map and refresh the existing UI to the supplied industrial-command-deck design reference.  
**Planning status:** Geographic anchors researched; detailed bus-stop geometry and final operating-area polygon still require validation.

---

## 1. Product and map objective

YatraGrid is a student-mobility and bus-operations planning platform. The Owner Portal map must help an operator understand:

- Where registered student demand is concentrated.
- Which stops are served by each bus route.
- Which stops have insufficient seats.
- Where buses are during a deterministic schedule simulation.
- How the baseline and optimized schedules differ.

This is an **operations simulation map**, not a live-GPS product. Do not label simulated bus positions as live tracking.

The initial study area is the connected Mangaluru–Gurupura–Polali corridor, with a single 5,000 m buffer outward from the final operating-area polygon.

## 2. Geographic anchors and preliminary view

Use these reference anchors for initial map framing only:

| Anchor | Latitude | Longitude | Reference |
|---|---:|---:|---|
| Mangaluru city reference point | 12.87170 | 74.84250 | OpenStreetMap Mangaluru page |
| Gurupura locality | 12.93828 | 74.92799 | Mapcarta / OSM-based place record |
| Polali Rajarajeshwari Temple | 12.933954 | 74.955291 | Published coordinate record / Wikimedia Commons |

These are locality/landmark reference points, not verified bus-stop coordinates or municipal boundaries.

Approximate straight-line distances between the anchors:
- Mangaluru–Gurupura: approximately 11.9 km.
- Mangaluru–Polali: approximately 14.1 km.
- Gurupura–Polali: approximately 3.0 km.

A provisional rectangular viewing envelope, expanded approximately 5 km beyond the anchor bounding box, is:

- Southwest: `12.8268, 74.7964`
- Northeast: `12.9832, 75.0014`
- Approximate initial center: `12.9050, 74.8989`

**Important:** This envelope is for initial `fitBounds`/map framing only. It is not the final 5 km buffer polygon, an administrative boundary, or a claim that all places inside it are served.

### Correct 5 km buffer method

1. Create a core `operating-area.geojson` polygon that follows the actual candidate road corridor and service catchment.
2. Use route centerlines or an agreed operating-area boundary to define the core area.
3. Project the geometry to UTM Zone 43N (`EPSG:32643`).
4. Apply a true outward buffer of 5,000 metres to the core polygon.
5. Reproject the buffered result to WGS84 (`EPSG:4326`) for Leaflet.
6. Store the resulting geometry as GeoJSON and label it **“Proposed 5 km study buffer”** until locally validated.

Do not draw three independent 5 km circles around Mangaluru, Gurupura and Polali. Do not use a degree-based buffer as the final 5 km geometry. Do not present the provisional rectangle as an exact buffer.

## 3. Candidate route corridor and local data

A published Mangaluru city-bus route listing describes Route 12A from State Bank through Jyothi, Bunts Hostel, Mallikatte, Kadri, Kulshekar, Kudupu, Vamanjoor, Gurupura, Kaikamba, Addoor and Polali.

A separate 2025 report describes a Mangaluru–Polali KSRTC service via Vamanjoor and Bondantila and notes that smaller buses are used because some rural roads are narrow and winding.

Use these as **candidate route references / seed-data leads only**. They do not prove that a particular timetable is current or that every listed stop has a verified coordinate.

Suggested route datasets to validate:
- `Mangaluru / State Bank ↔ Polali` corridor.
- `Gurupura ↔ Polali` local connection.
- `Vamanjoor / Bondantila` feeder connection, where confirmed.
- Nearby villages and stops inside the final 5 km buffer.

For each stop, capture:
- Stable stop ID.
- Display name in English and Kannada where known.
- Latitude and longitude.
- Data source and verification date.
- Route IDs.
- Whether it is a candidate, verified, or demo-only stop.

Never invent precise stop coordinates. If a coordinate is a placeholder, mark it `demoOnly: true` and visibly identify it as illustrative in the UI.

## 4. Leaflet implementation architecture

Use the existing Vite + React + TypeScript frontend. Prefer `react-leaflet` with Leaflet rather than replacing the frontend stack.

Recommended packages:
- `leaflet`
- `react-leaflet`
- `@types/leaflet` if required by the installed TypeScript setup

Inspect the current dependencies before installing duplicates.

### Suggested component boundaries

Adapt to the existing code structure; do not create redundant components if equivalents already exist.

- `TransportMap`: Leaflet map container, initial bounds and map lifecycle.
- `BaseMapLayer`: OpenStreetMap raster tiles and mandatory attribution.
- `OperatingAreaLayer`: proposed core operating-area GeoJSON.
- `BufferBoundaryLayer`: 5 km buffered GeoJSON boundary, dashed outline and subtle fill.
- `RouteLayer`: validated route polylines, selected-route emphasis and route labels.
- `StopMarkers`: clickable stop markers with demand/status styling.
- `BusMarkers`: simulated buses positioned from the current simulation event.
- `DemandLayer`: stop-level demand circles or heat-style layer.
- `MapLegend`: routes, buses, stops, demand and buffer legend.
- `MapFilters`: route, time window and layer visibility controls.
- `SelectedStopPanel`: stop demand, seats, waiting passengers and next scheduled bus.
- `SimulationControls`: play, pause, reset, speed and timeline scrubber.

Keep simulation calculations outside the map-rendering components. The map should render the current simulation state supplied by the existing engine/store.

## 5. Map layer design

Provide independent toggles for:

1. Base map.
2. Core operating-area boundary.
3. Proposed 5 km buffer boundary.
4. Routes.
5. Stops.
6. Demand intensity.
7. Simulated buses.
8. Unserved-demand indicators.

### Visual conventions

- Normal route: neutral slate/charcoal line.
- Selected route: YatraGrid vermillion accent.
- Bus marker: simple bus icon with route ID.
- Normal stop: neutral marker.
- Selected stop: vermillion outline/ring.
- Balanced capacity: semantic green.
- High utilization: semantic amber.
- Over-capacity / stranded demand: semantic red.
- Proposed 5 km buffer: translucent warm outline/fill, visually distinct from the core boundary.

Do not use random route colours without a legend. Keep route IDs and stop names readable at the initial zoom. Cluster or simplify markers at lower zoom levels if the number of stops grows.

### Stop interaction

Clicking a stop should show a compact popup or side panel containing:
- Stop name and stop ID.
- Registered demand for the selected time bucket.
- Waiting students.
- Students boarded in the simulation.
- Stranded students.
- Available seats / capacity relevant to the next bus.
- Next scheduled departure.
- Data status: verified or illustrative.

The map must also have a list/table alternative so users can access stop information without relying on map interactions.

## 6. Owner Portal simulation behaviour

The map must be driven by the same deterministic simulation used for the impact panel and before/after comparison.

### Simulation inputs

- Stop coordinates and route stop sequences.
- Route geometry or road-following polylines.
- Bus capacity.
- Bus-to-route assignment.
- Departure times.
- Travel-time estimates between stops.
- Driver-hour and permitted-route constraints.
- Student demand by stop, destination and time slot.
- Scenario modifiers.

### Simulation timeline

Use a realistic morning demonstration window, initially `06:00–10:00`, adjustable to the selected dataset.

At each event:
1. Advance the simulation clock.
2. Move a bus along its route geometry using elapsed simulation time.
3. Process alighting, if represented by the data model.
4. Board waiting students up to remaining capacity.
5. Keep overflow passengers waiting if a later service exists.
6. Mark students unserved/stranded only according to the simulation's explicit service rule.
7. Update bus load, stop counters, map markers and impact metrics together.

Use a fixed random seed or deterministic fixtures so the same inputs produce the same replay.

### Controls

- Play / Pause.
- Reset to start.
- 1× / 2× / 4× speed.
- Timeline scrubber.
- Baseline / Optimized result selector.
- Scenario selector: Normal, Exam Day, Monsoon Rain, Bus Breakdown, Route Closure.
- Layer toggles and time filter.

### Metrics that must stay synchronized

- Registered demand.
- Boarded.
- Waiting.
- Stranded / unserved.
- Arrived / served.
- Average wait.
- Load factor.
- Estimated operating cost.
- Estimated revenue.
- Viability gap.

Changing the simulation time must update map positions, event counters, selected-stop detail and replay timeline consistently.

### Before / after optimization

Provide a clear switch between baseline and optimized results.

Show:
- Original route and departure.
- Optimized route/departure.
- Bus reassignment changes.
- Additional students served.
- Change in average waiting time.
- Change in load factor.
- Change in estimated cost/revenue/viability gap.

The optimizer must respect fleet count, seats, driver hours and permitted/fixed routes. Do not claim improvement if the actual result does not improve the selected objective or violates a constraint.

## 7. Owner Portal map layout

Use a clean operations layout:

- Header: page title, service area, date/time filter, scenario state.
- Main area: large interactive map occupying about 60–70% of the useful content width.
- Map toolbar: layer toggles, route selector, zoom-to-area and reset view.
- Side panel: selected route/stop details and demand/capacity insights.
- Below or adjacent: simulation timeline and compact impact cards.
- Map legend: always visible or available in one clear control.

Do not squeeze the map into a small decorative card. It is a primary decision-making surface.

### Student Portal map

Reuse the same verified base geography and route data, but simplify the experience:
- Home/boarding stop.
- Destination institution.
- Assigned route.
- Nearby served stops.
- Scheduled departures.
- Honest unserved/fallback notice.

Do not show owner-only demand counts, cost details or fleet controls to students.

## 8. Replace the existing UI/UX without breaking functionality

The current screenshot shows a dark, grid-based schematic map with fictional labels such as Kishanpur Junction, Rampur Crossing and Chandan Bridge. Replace that presentation with the real Mangaluru–Gurupura–Polali Leaflet map.

Before editing:
1. Inspect the current `OwnerView`, `StudentView`, `SimMap`, `simReplay`, `DemandHeatmap`, `ImpactPanel`, `ScenarioBar`, stores, API clients and current `DESIGN.md`.
2. Identify which components are visual-only and which contain working simulation/business logic.
3. Preserve useful engine logic, data contracts, API behaviour, student registration, demand updates, replay events and existing tests.
4. Replace the old visual system and map renderer; do not delete functioning product features merely because their current styling is being replaced.
5. Remove fictional stop names/data from the active demo network. Keep test fixtures only if they are clearly isolated and not presented as the Mangaluru-area dataset.
6. Do not keep the old SVG/grid map as the primary Owner Portal map. It may be retained only as a test fixture if existing tests depend on it.

### Design reference to apply

Use the supplied **Orderful — Style Reference** as a visual direction, adapted into an original YatraGrid system.

Adopt:
- Light industrial command-deck aesthetic.
- Matte off-white canvas (`#F5F5F5`).
- White surfaces (`#FFFFFF`).
- Slate/ink headings (`#101828`).
- Carbon panels (`#1F1F1F`) only for deliberate emphasis.
- Vermillion action accent (`#E42B0C`) for primary actions and selected/active emphasis.
- Neutral hairline borders (`#E5E7EB`).
- Consistent 8px radius.
- 8px spacing base.
- Restrained shadows.
- Inter as a readily available substitute for the reference's proprietary Telegraf font; do not assume the custom font is installed or licensed.

Keep transportation status colours semantic and separate from brand action colour:
- Green = served / available / balanced.
- Amber = attention / high utilization.
- Red = overcrowded / disruption / unserved.
- Vermillion = primary action / selected route / important CTA.

Do not copy Orderful's logo, brand name, retailer logo grid, trading-partner content or irrelevant components. Replace its product visual with a YatraGrid route-network/map visualization.

Apply the updated `DESIGN.md` consistently to:
- Landing page.
- Login / role selection.
- Owner dashboard and all owner subpages.
- Student dashboard and registration.
- Map controls, popups, charts, tables and dialogs.

Keep the student experience simpler and more welcoming while retaining the same design tokens. Do not make the student UI as dense as the owner operations console.

## 9. Map data and tile-provider safeguards

- Use verified OpenStreetMap-derived coordinates or validated local route data for stops and roads.
- Keep the data source and verification date with each route/stop fixture.
- Do not geocode every stop from the browser at runtime.
- Do not invent roads, bus-stop positions, schedules or live vehicle telemetry.
- Include visible `© OpenStreetMap contributors` attribution when using OSM tiles.
- Use the documented HTTPS tile URL and respect the provider's caching and usage policy.
- Do not prefetch or bulk-download OSM tiles.
- Make the tile provider configurable so it can be changed without rewriting map components.
- Provide a graceful map-unavailable state and a text/list fallback.

For the initial prototype, an OSM tile layer is acceptable for human interactive viewing, subject to its published usage policy. If the product needs an SLA, high traffic or offline operation, plan a suitable commercial/self-hosted tile provider.

## 10. Acceptance criteria

### Geography
- Map opens focused on the Mangaluru–Gurupura–Polali corridor.
- Three locality anchors are visible.
- Map bounds show the approximate 5 km study envelope.
- Final 5 km boundary is a metric buffer from the agreed core GeoJSON polygon, not three circles.
- Boundary is explicitly labelled proposed until validated.
- The user can zoom, pan and reset to operating area.

### Leaflet interactions
- Tiles load with attribution.
- Route, stop, buffer, demand and bus layers can be toggled.
- Stop click opens correct data.
- Route selection highlights the correct path.
- No fictional stops appear in the active area network.
- Map resizes correctly on navigation and viewport changes.

### Simulation
- Play, pause, reset, speed and scrubber work.
- Bus markers move according to deterministic events and route geometry.
- Stop counters and impact metrics update with the same simulation clock.
- Baseline and optimized replay are distinguishable.
- Constraints are respected and demo data is labelled.

### UI refresh
- Old grid/SVG visual map is no longer the primary map.
- Existing product functionality remains available.
- The updated YatraGrid design system is applied consistently.
- Desktop owner dashboard keeps the map prominent.
- Student map remains mobile-friendly and simple.
- No horizontal overflow or broken navigation.

### Quality
- Run the actual frontend build and relevant tests.
- Fix verified TypeScript, runtime and console errors.
- Do not claim live GPS or verified timetables.
- Report any stop coordinates or route geometry still requiring local validation.

## 11. Source references

Geographic anchors:
- Mangaluru coordinates: https://wiki.openstreetmap.org/wiki/Mangaluru
- Gurupura locality and coordinates: https://mapcarta.com/N1813841057
- Polali temple coordinates: https://en.wikipedia.org/wiki/Polali_Rajarajeshwari_Temple

Candidate corridor references:
- Mangaluru city bus route listing: https://mangalore.city/mangalore-city-bus-routes-numbers/
- Report of Mangaluru–Polali KSRTC service: https://www.mangaloretoday.com/mainnewsprint/MLA-Dr-Bharath-Shetty-launches-new-KSRTC-bus-service-between-Mangaluru-and-Polali.html

Technical references:
- Leaflet reference: https://leafletjs.com/reference
- React Leaflet: https://react-leaflet.js.org/
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- OpenStreetMap copyright/attribution: https://www.openstreetmap.org/copyright

---

# Recommended implementation order

1. Audit the current map, simulation and UI components.
2. Refine `DESIGN.md` to the YatraGrid adaptation of the supplied industrial command-deck reference.
3. Validate the operating-area boundary and stop-coordinate source.
4. Add Leaflet and display the real geographic map.
5. Add routes, stops, buffer and demand layers.
6. Connect simulated bus markers to the existing replay event model.
7. Add stop popups, layer controls and simulation controls.
8. Refresh the complete Owner and Student UI using the refined design system.
9. Verify shared demand updates, baseline/optimized replay, responsive layouts and build.

**Do not start by deleting the existing UI files. First map existing functionality to the new screens, then replace the visual layer deliberately.**
