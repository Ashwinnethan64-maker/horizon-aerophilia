---
name: "YatraGrid — Neo-Brutalist Mobility Intelligence"
description: "A bold, high-contrast student mobility and bus-operations platform for Mangaluru, Gurupura, Polali and surrounding communities."
colors:
  primary: "#0866F5"
  primary-dark: "#064DB8"
  navy: "#10233F"
  ink: "#111111"
  background: "#FFFDF5"
  surface: "#FFFFFF"
  surface-blue: "#EAF2FF"
  secondary: "#FFD93D"
  tertiary: "#C4B5FD"
  success: "#178653"
  warning: "#D99127"
  danger: "#D93636"
  text: "#111111"
  text-secondary: "#454545"
  border: "#111111"
typography:
  fontFamily: "Space Grotesk"
  fontFamilyStack: "'Space Grotesk', Inter, ui-sans-serif, system-ui, sans-serif"
  heading-1:
    fontFamily: "Space Grotesk"
    fontSize: "clamp(2.75rem, 6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.98
  heading-2:
    fontFamily: "Space Grotesk"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
  heading-3:
    fontFamily: "Space Grotesk"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Inter"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Space Grotesk"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.08em"
rounded:
  default: "4px"
  card: "4px"
  button: "4px"
  input: "4px"
  pill: "999px"
spacing:
  scale: ["4px", "8px", "12px", "16px", "24px", "32px", "40px", "48px", "64px"]
shadows:
  small: "4px 4px 0 0 #111111"
  medium: "6px 6px 0 0 #111111"
  large: "8px 8px 0 0 #111111"
components:
  button:
    primary:
      background: "#0866F5"
      color: "#FFFFFF"
      border: "2px solid #111111"
      radius: "4px"
      shadow: "4px 4px 0 0 #111111"
      padding: "12px 18px"
      fontWeight: 700
    secondary:
      background: "#FFD93D"
      color: "#111111"
      border: "2px solid #111111"
      radius: "4px"
      shadow: "4px 4px 0 0 #111111"
      padding: "12px 18px"
  card:
    background: "#FFFFFF"
    color: "#111111"
    border: "2px solid #111111"
    radius: "4px"
    padding: "16px"
  input:
    background: "#FFFFFF"
    color: "#111111"
    border: "2px solid #111111"
    radius: "4px"
    padding: "12px 14px"
---

# YatraGrid — Neo-Brutalist Design System

## 1. Product context

YatraGrid is an intelligent student-mobility and bus-operations platform. It connects travel needs submitted by students with bus capacity, routes, schedules and operating constraints managed by bus owners.

The first demonstration area is the **Mangaluru–Gurupura–Polali corridor with a proposed 5 km outward buffer around the combined operating-area boundary**. The boundary and all stop/road geometry must be validated from geographic data before being presented as authoritative.

The product has two connected interfaces:

- **Owner portal:** demand intelligence, geographic operations map, schedule simulation, route optimization, fleet constraints and financial impact.
- **Student portal:** travel-need registration, upcoming journey, assigned bus, schedule, route map, alerts and honest fallback information.

The key product story is: **student demand → shared demand data → simulation and optimization → recommended schedule → student journey information.**

## 2. Design direction: functional neo-brutalism

Use neo-brutalism as the recognizable visual language, but adapt its intensity to a real transportation tool.

### Keep from the supplied neo-brutalism reference

- Strong black outlines and visible component boundaries.
- Flat, high-contrast colour blocks.
- Hard offset shadows with no blur.
- Mechanical button press interactions.
- Bold Space Grotesk headings.
- Cream paper-like canvas.
- A few sticker-style badges and expressive landing-page compositions.
- Fast, direct interactions.

### Adapt for YatraGrid usability

The source style guide recommends thick borders, 8–16 px shadows, frequent rotations, maximal textures and heavy typography everywhere. Applying all of those rules to a dense operations dashboard or geographic map would reduce map legibility and make analytics harder to scan.

Therefore:

- Use **2 px black borders as the default**, 3–4 px only for hero panels, selected cards and primary emphasis.
- Use **4 px hard shadows for ordinary cards** and 6 px for important callouts. Reserve 8 px shadows for landing-page feature panels.
- Keep dashboard cards, map controls, tables and forms square or 4 px radius; use pill shapes only for compact status badges and chips.
- Keep rotations and sticker overlaps to the landing page and decorative storytelling sections. Never rotate dashboard cards, charts, forms, map controls or data labels.
- Use subtle grid/halftone texture only in decorative landing-page areas, never behind map tiles, charts or dense text.
- Use Space Grotesk for display/headings and Inter for body text, table rows, form values and map labels.
- Avoid forcing all body copy into bold or uppercase. Use bold uppercase for short labels, not paragraphs.
- Keep motion snappy but respect reduced-motion preferences.

The intended result is **bold and memorable, but still credible, accessible and operationally usable**.

## 3. Brand identity and palette

YatraGrid uses blue as its brand colour. Do not use the source reference's hot-red primary palette.

| Token | Hex | Use |
|---|---|---|
| Electric blue | `#0866F5` | Primary actions, selected route, active navigation |
| Deep blue | `#064DB8` | Hover/pressed primary states |
| Deep navy | `#10233F` | Dark sections, high-emphasis text, map panel headers |
| Ink black | `#111111` | Text, strong borders and hard shadows |
| Warm paper | `#FFFDF5` | Main page canvas |
| White | `#FFFFFF` | Cards, form surfaces and panels |
| Pale blue | `#EAF2FF` | Selected filters, information panels and selected stop |
| Signal yellow | `#FFD93D` | Attention badges, scenario highlights and secondary actions |
| Violet | `#C4B5FD` | Optional decorative accents, not status meaning |
| Success green | `#178653` | Served, available, completed |
| Warning amber | `#D99127` | Near capacity, pending verification, caution |
| Danger red | `#D93636` | Over-capacity, cancelled, stranded or failed |

### Colour rules

- Blue is the brand/action colour, not a generic data colour for every chart series.
- Yellow is for attention and secondary emphasis, not large body-text backgrounds.
- Green, amber and red communicate operational status and must be paired with labels/icons.
- Use ink black for structural borders; use white/paper for readable content surfaces.
- Keep chart colours distinguishable and accessible. Do not rely on colour alone.
- Ensure text contrast meets WCAG AA where practical; do not put small black text on saturated blue unless contrast is verified.

## 4. Typography

### Families

- **Space Grotesk:** brand wordmark styling, page titles, hero headings, KPI numerals and short section headings.
- **Inter:** body content, forms, buttons, table cells, tooltips, map labels and long explanations.
- Fallback: `ui-sans-serif, system-ui, sans-serif`.

### Scale

| Role | Desktop | Mobile | Weight |
|---|---:|---:|---:|
| Landing hero | 64–88 px | 42–52 px | 700 |
| Page title | 36–48 px | 30–36 px | 700 |
| Section title | 24–32 px | 22–26 px | 700 |
| Card title | 16–20 px | 16–18 px | 700 |
| Body | 14–16 px | 14–16 px | 400–500 |
| Table/map label | 12–14 px | 12–14 px | 500–600 |
| Eyebrow | 11–12 px | 11–12 px | 700 uppercase |

Do not use the 96–128 px display scale inside dashboards. Avoid long all-caps labels and body paragraphs.

## 5. Shape, border and shadow system

- Default radius: 4 px.
- Cards: 4 px.
- Buttons and inputs: 4 px.
- Status pills: fully rounded.
- Standard border: 2 px solid `#111111`.
- Emphasis border: 3–4 px solid `#111111`.
- Small hard shadow: `4px 4px 0 #111111`.
- Medium hard shadow: `6px 6px 0 #111111`.
- Large hard shadow: `8px 8px 0 #111111`.

Use shadows to establish hierarchy, not on every nested element. Do not place multiple hard shadows inside a map because they compete with geographic information.

## 6. Shared application shell

### Navigation

- Use a clear YatraGrid wordmark with a compact road/route symbol.
- Show the current portal (Owner or Student) prominently.
- Provide language selection and account controls.
- Use a 2 px ink divider under the top navigation.
- On mobile, collapse navigation into a clear menu; student navigation may use a bottom bar.

### Interaction states

All controls must have visible:

- Default state.
- Hover state.
- Keyboard focus state.
- Pressed state.
- Disabled state.
- Loading state, where relevant.

Primary buttons use electric blue, white text, 2 px ink border and 4 px hard shadow. On press, translate 2 px down/right and remove the shadow so the control feels physically pressed.

## 7. Landing page

### Goal

Explain in seconds that YatraGrid connects student travel demand with feasible bus operations.

### Hero

Suggested headline: **“Every Student. Every Route. Connected.”**

Supporting copy: “See where students need transport, plan bus schedules around real demand, and make journeys more reliable across local communities.”

Primary CTA: **Explore as Bus Owner**.
Secondary CTA: **Find My Bus**.

Visual direction:

- Asymmetric 60/40 hero layout.
- Left side: large Space Grotesk headline, short copy and two clear actions.
- Right side: original map/network illustration showing Mangaluru, Gurupura and Polali connected by blue route lines, bus/stop symbols and a yellow coverage badge.
- Use a small tilted sticker badge only in the hero, e.g. “DEMAND-DRIVEN MOBILITY”.
- Avoid generic AI robot artwork and irrelevant stock photography.

### Landing page sections

1. Hero with map/network visual.
2. Problem: overloaded buses, empty runs, uncertain student journeys.
3. Two portals: Bus Owner and Student.
4. How it works: Register demand → Understand demand → Simulate → Optimize → Publish schedule.
5. Product preview: owner map and student journey card.
6. Local coverage: Mangaluru–Gurupura–Polali and proposed buffer.
7. Final CTA with owner/student entry points.

Use bold color blocks and hard shadows selectively. Keep paragraphs short and scannable.

## 8. Owner portal design

### Experience goal

The owner portal is an **operations command centre**. It must make demand, capacity, route performance and cost trade-offs easy to understand. Use neo-brutalist structure with disciplined information density.

### Desktop shell

- Left sidebar: 232–256 px, white or navy surface with 2 px ink border.
- Top bar: 60–68 px with page title, operating-area selector, date/time, notifications and profile.
- Main content: flexible grid with consistent 16–24 px gaps.
- Map and simulation should receive the largest visual area when those pages are active.

### Owner navigation

- Overview
- Demand Intelligence
- Live Simulation
- Route Optimizer
- Routes & Stops
- Fleet & Constraints
- Financial Impact
- Scenarios
- Reports
- Settings

### Overview page

Show four to six KPI cards, not an excessive wall of metrics:

- Active buses.
- Registered travel needs.
- Students served (simulation value must be labelled).
- Unserved demand.
- Average wait.
- Fleet load factor.

Below KPIs show:

- Operating-area map preview.
- Demand by time chart.
- Route utilization chart.
- Capacity alerts.
- Recent student travel requests.

Use hard shadow only on the most important KPI or CTA cards. Keep charts on white surfaces with clear labels.

### Demand Intelligence

Filters: date, time slot, route, stop and institution.

Show demand versus offered seats by stop and time slot. Provide a time selector (morning, midday, evening or custom interval).

Status colours:

- Red: demand exceeds available capacity.
- Amber: high utilization/near capacity.
- Green: balanced/available capacity.
- Blue: informational/selected state.

Always include a visible legend and numeric values. A heatmap must be understandable without relying only on colour.

### Live Simulation

Show a real geographic Leaflet map of the validated Mangaluru–Gurupura–Polali operating area and its proposed 5 km outward buffer.

Simulation controls:

- Play, pause, reset.
- 1×, 2× and 4× speed.
- Timeline scrubber and simulated clock.
- Baseline/optimized selector.
- Scenario selector.

Show live simulation counters for waiting, boarded, stranded and arrived students. Make it explicit that vehicle positions are simulated, not live GPS telemetry.

### Route Optimizer

Present the current and proposed schedule side by side or with a before/after toggle.

Show:

- Students served and unserved.
- Average wait.
- Load factor.
- Daily operating cost.
- Revenue estimate.
- Viability gap.
- Schedule changes in plain language.

Primary action: **Optimize Schedule**.

The optimizer must respect bus count, seat capacity, driver hours, fuel cost and permitted/fixed routes. Never style an unvalidated recommendation as an approved schedule. Use a clear “Apply recommended schedule” confirmation step.

### Fleet & Constraints

Use compact tables and bordered edit panels for:

- Bus identifier and seating capacity.
- Availability.
- Driver-hour constraints.
- Fuel cost and operating cost.
- Fixed/permitted routes.
- Service time windows.

### Financial Impact

Show operating cost, revenue, cost per student, fuel estimate and viability gap. Define viability gap clearly as operating cost minus revenue. Use labels and positive/negative indicators; avoid ambiguous red/green-only signals.

### Scenario planning

Provide clear scenario buttons for Exam Day, Heavy Rain, Bus Breakdown and Route Closure. Selecting a scenario should visibly update simulation inputs and results. Make active scenario obvious.

## 9. Student portal design

### Experience goal

The student portal is **simple, mobile-first and low-bandwidth friendly**. Preserve the bold YatraGrid identity but reduce decoration and density. A student should understand the next journey immediately.

### Navigation

Mobile bottom navigation:

- Home
- My Bus
- Register Need
- Routes
- Profile

Use large touch targets and concise labels.

### Home

The first visible section should be a “Next Journey” card containing:

- Service status.
- Boarding stop.
- Scheduled departure.
- Destination/institution.
- Scheduled arrival estimate.
- Bus identifier, if assigned.
- Typical crowding label, if supported by data.

Use one strong blue action: **View My Route**.

### Register Travel Need

Use a short step-by-step form:

1. Home village and preferred boarding stop.
2. Destination institution/stop.
3. Required arrival deadline and preferred departure window.
4. Days of week.
5. Review and submit.

Use clear inline validation, large fields and a visible success confirmation. Allow editing/cancelling a request. Explain that registration records demand and does not guarantee a seat or service assignment.

### My Bus

Show assigned bus, stop, scheduled time, destination, service days and crowding estimate. Do not show a false live ETA if only schedule data exists.

### Unserved journey

If no feasible bus is assigned, show an honest notice and only valid fallback options: nearest served stop, another available departure or a confirmed pooled option. Never invent alternative services.

### Student map

Keep the map focused on home stop, boarding stop, route and destination. Pair the map with a simple stop list/timetable so map usage is not mandatory.

### Alerts and reports

Use plain-language notices for schedule changes, cancellations and disruptions. “Bus did not arrive” submissions must be labelled student-reported/unverified until checked by an operator.

## 10. Geographic map design — Leaflet

### Coverage

The intended focus is Mangaluru–Gurupura–Polali and a 5 km outward buffer around the combined operating-area polygon.

Do not approximate the buffer with three circles around the town centres. Build the final operating-area polygon from validated boundaries/route corridor geometry and buffer it by 5,000 metres using a suitable metric CRS (UTM Zone 43N / EPSG:32643), then transform the resulting geometry to WGS84 for Leaflet display.

The map must distinguish:

- Verified road/stop data.
- Candidate or manually entered stops.
- Simulated bus positions.
- Student demand locations (aggregate or privacy-safe).
- Proposed routes versus verified operating routes.

### Map layers

- OpenStreetMap base layer with required attribution.
- Operating-area boundary and 5 km buffer outline.
- Route polylines following road geometry (not straight town-to-town lines).
- Stop markers with selected/normal/high-demand/unserved states.
- Simulated bus markers driven by simulation events.
- Optional demand heatmap/cluster layer.

### Map controls

- Layer toggles: Routes, Stops, Demand, Buses, Buffer.
- Fit operating area.
- Zoom controls.
- Route filter.
- Time-slot filter.
- Baseline/optimized view.
- Legend.

### Stop interaction

Clicking a stop opens a compact detail panel with stop name, coordinates, demand count, available seats, waiting count, served routes and next scheduled service. Clearly label sample/demo data.

### Map visual treatment

Neo-brutalism should frame the map, not obscure it:

- Use a clean, light geographic basemap.
- Use 2 px ink outline for the map container.
- Use hard shadow only on the outer map panel or floating toolbar, not on every marker.
- Keep route colours distinct and consistent.
- Use blue for selected/proposed route, navy for baseline route, yellow for selected stop, red for capacity issue, green for served/available.
- Keep labels readable and avoid excessive sticker rotations or halftone textures on map tiles.
- Add a clear legend and keyboard-accessible alternative list of stops/routes.

### Simulation behavior

The simulation clock advances through timestamped events. Bus positions interpolate along validated route geometry between stops. Boarding, waiting, arrival and stranded counts must correspond to the same event timeline as the metric panels. Pause/reset/speed controls must update the map and counters together.

Do not use random movement that disagrees with the simulation engine. Use deterministic seeded fixtures for repeatable demos.

## 11. Data visualization

Recommended visuals:

- Demand by stop/time: heatmap or matrix.
- Capacity versus demand: grouped bars.
- Route utilization: horizontal bar chart.
- Daily demand: line chart.
- Baseline versus optimized impact: paired KPI cards and delta labels.
- Financial impact: cost/revenue comparison.

Neo-brutalist treatment for charts:

- White or cream panels with 2 px ink border.
- Strong axis labels and high-contrast annotations.
- Limited chart palette: blue, navy, yellow, green, red.
- No 3D charts, excessive gradients or decorative chart backgrounds.
- Tooltips must include exact values and units.

## 12. Components and interaction rules

### Buttons

- Primary: blue fill, white text, 2 px black border, 4 px hard shadow.
- Secondary: yellow fill, black text, 2 px black border.
- Outline: white fill, black text, 2 px black border.
- Danger: red fill with sufficient contrast and clear destructive label.
- Press: translate 2 px down/right and reduce shadow.
- Hover: slight darkening or 1–2 px lift; keep transition 100–150 ms.

### Cards

- White or cream surface.
- 2 px ink border.
- 4 px radius.
- 4 px hard shadow for featured/interactive cards only.
- No rotation in dashboard cards.

### Inputs

- White background, 2 px ink border, 4 px radius.
- Minimum height 44 px (48 px preferred for student forms).
- Focus state: 2 px blue focus ring with black outline retained; do not rely on yellow background alone.
- Error messages are plain-language and placed next to the field.

### Badges

Use square or pill badges with concise labels. Examples: ACTIVE, DELAYED, UNVERIFIED, OVER CAPACITY, SIMULATED. Do not use badge colours without accompanying text.

### Tables

Use strong header contrast, simple row dividers and visible status text. On small screens, convert rows to stacked cards or allow deliberate horizontal scrolling within the table only.

## 13. Motion and texture

- Button press: 100–150 ms.
- Card hover: 150–200 ms.
- Map marker movement: synchronized with simulation clock; use smooth interpolation only when it matches actual event timing.
- Use halftone/grid patterns sparingly in hero/marketing backgrounds.
- Never place noisy patterns behind body text, data tables, charts or maps.
- Avoid continuous animation that distracts from transport information.
- Respect `prefers-reduced-motion`.

## 14. Responsive rules

### Desktop (≥ 1024 px)

- Full owner sidebar.
- Multi-column KPIs.
- Large map and right-side detail panel.
- Side-by-side baseline/optimized comparisons.

### Tablet (768–1023 px)

- Collapsible sidebar.
- Two-column KPI layout.
- Map and details stacked or presented as tabs.

### Mobile (< 768 px)

- Student portal prioritized for mobile.
- Bottom navigation.
- Single-column cards and forms.
- Full-width primary actions.
- Map controls kept compact and reachable.
- Provide a stop list/timetable alternative to map-only interaction.
- Owner portal remains usable with collapsible navigation and simplified map/data panels.

## 15. Accessibility and trust

- Meet WCAG AA contrast targets for text and controls.
- Use semantic buttons, labels and navigation.
- Provide keyboard focus states and accessible icon labels.
- Minimum touch target 44×44 px.
- Do not encode operational status only by colour.
- Clearly distinguish verified data, sample data, estimates and simulation outputs.
- Do not expose individual student home locations publicly. Aggregate demand for owner heatmaps and restrict personal travel details to authorized accounts.
- Never claim live GPS, live arrival or confirmed service unless the data source supports it.

## 16. Anti-patterns for YatraGrid

Do not:

- Apply 4 px borders and 12–16 px shadows to every element.
- Rotate map panels, charts, forms or data tables.
- Put halftone textures behind maps or analytics.
- Use random high-saturation colours for data series.
- Make every label uppercase.
- Use 900-weight text for paragraphs.
- Sacrifice map readability for visual effects.
- Present simulated bus positions as live tracking.
- Present sample statistics as real operating metrics.
- Make student registration unnecessarily complex.
- Hide unserved demand or manufacture alternative routes.
- Add decorative controls that do not work.

## 17. Implementation guidance

Use the project's existing stack and architecture. If not yet selected, the preferred frontend baseline is React + TypeScript + Tailwind CSS, with Lucide icons, Recharts for charts and React Leaflet for maps.

Build reusable components for navigation, KPI cards, filters, data tables, map layers, stop detail panels, simulation controls and student journey cards.

Keep owner and student layouts separate, but share design tokens, typography, buttons, form controls and status components.

Do not rewrite working simulation/API logic solely to match the design. Keep the UI connected to the actual shared demand, schedule and simulation data.

## 18. Definition of done

- [ ] YatraGrid blue brand identity is consistent.
- [ ] Landing page communicates the two-sided mobility product.
- [ ] Owner dashboard is information-rich and map-focused.
- [ ] Student dashboard is simple and mobile-first.
- [ ] Map covers the validated Mangaluru–Gurupura–Polali study area and 5 km buffer.
- [ ] Routes follow verified/labelled road geometry.
- [ ] Stops distinguish verified from candidate/demo data.
- [ ] Simulated buses follow the deterministic event timeline.
- [ ] Simulation controls and metrics stay synchronized.
- [ ] Demand/capacity statuses have text labels and a legend.
- [ ] Student travel registration updates shared demand data.
- [ ] Optimizer respects available fleet and operating constraints.
- [ ] Before/after comparison explains schedule changes.
- [ ] Unserved student journeys are communicated honestly.
- [ ] Mobile layouts work without horizontal page overflow.
- [ ] Keyboard navigation and contrast are checked.
- [ ] No fake live GPS or fabricated operational data is presented.

## Final instruction to AI coding agents

Read this entire `DESIGN.md` before creating or modifying YatraGrid UI.

Use **functional neo-brutalism**: bold blue brand actions, cream canvas, black structure, restrained hard shadows and confident typography—balanced with the clarity required by maps, charts, scheduling and student travel forms.

The Owner Portal must feel like a bold transportation operations console. The Student Portal must feel friendly, direct and effortless.

Preserve existing business logic, API contracts and working features. Build real interactions rather than decorative mock controls. Label all demo/simulated data honestly.

**YatraGrid — Every Route. Every Student. Connected.**
