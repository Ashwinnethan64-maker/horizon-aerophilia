---
name: "YatraGrid — Intelligent Student Mobility"
description: "An approachable, map-first transportation intelligence platform connecting student travel demand with practical bus operations, route planning and schedule optimization."
colors:
  brand:
    primary: "#176B52"
    primaryHover: "#125640"
    primarySoft: "#E8F3EE"
    secondary: "#16324F"
    secondarySoft: "#EAF0F6"
    accent: "#E5A43B"
  semantic:
    success: "#21865B"
    warning: "#C98320"
    danger: "#C84C4C"
    info: "#3478B8"
  surfaces:
    background: "#F6F8F7"
    surface: "#FFFFFF"
    surfaceSubtle: "#EEF2F0"
    border: "#DCE5E0"
    text: "#172B25"
    textSecondary: "#60736B"
    textInverse: "#FFFFFF"
  map:
    routePrimary: "#176B52"
    routeSecondary: "#3478B8"
    stop: "#16324F"
    demandLow: "#72B99A"
    demandMedium: "#E5A43B"
    demandHigh: "#C84C4C"
    unserved: "#8B5CF6"
typography:
  fontFamily: "Inter"
  fontFamilyStack: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  display:
    fontSize: "48px"
    lineHeight: 1.08
    fontWeight: 750
    letterSpacing: "-0.035em"
  heading1:
    fontSize: "36px"
    lineHeight: 1.15
    fontWeight: 700
    letterSpacing: "-0.025em"
  heading2:
    fontSize: "28px"
    lineHeight: 1.25
    fontWeight: 650
  heading3:
    fontSize: "20px"
    lineHeight: 1.35
    fontWeight: 650
  body:
    fontSize: "14px"
    lineHeight: 1.55
    fontWeight: 400
  bodyLarge:
    fontSize: "16px"
    lineHeight: 1.6
    fontWeight: 400
  label:
    fontSize: "12px"
    lineHeight: 1.4
    fontWeight: 600
  metric:
    fontSize: "30px"
    lineHeight: 1.1
    fontWeight: 700
    letterSpacing: "-0.025em"
radii:
  xs: "6px"
  sm: "9px"
  md: "12px"
  lg: "16px"
  xl: "22px"
  pill: "999px"
shadows:
  card: "0 1px 3px rgba(22, 50, 39, 0.06), 0 5px 16px rgba(22, 50, 39, 0.04)"
  popover: "0 12px 32px rgba(22, 50, 39, 0.14)"
spacing:
  scale: ["4px", "8px", "12px", "16px", "20px", "24px", "32px", "40px", "48px", "64px"]
layout:
  ownerSidebarWidth: "248px"
  ownerSidebarCollapsedWidth: "72px"
  topbarHeight: "68px"
  contentMaxWidth: "1440px"
  pageGutterDesktop: "28px"
  pageGutterMobile: "16px"
components:
  button:
    primary:
      background: "#176B52"
      hover: "#125640"
      color: "#FFFFFF"
      radius: "10px"
      padding: "11px 16px"
      fontSize: "14px"
      fontWeight: 600
    secondary:
      background: "#FFFFFF"
      color: "#16324F"
      border: "1px solid #DCE5E0"
      radius: "10px"
      padding: "10px 15px"
    danger:
      background: "#C84C4C"
      color: "#FFFFFF"
      radius: "10px"
  card:
    background: "#FFFFFF"
    color: "#172B25"
    border: "1px solid #E2E9E5"
    radius: "16px"
    padding: "20px"
    shadow: "card"
  input:
    background: "#FFFFFF"
    color: "#172B25"
    border: "1px solid #CBD8D1"
    focusBorder: "#176B52"
    radius: "10px"
    padding: "11px 13px"
  badge:
    radius: "999px"
    padding: "4px 9px"
    fontSize: "11px"
    fontWeight: 600
  table:
    headerBackground: "#F3F6F4"
    rowHover: "#F7FAF8"
    divider: "#E7EDE9"
  link:
    color: "#176B52"
    hover: "#125640"
    textDecoration: "none"
  navigation:
    activeBackground: "#E8F3EE"
    activeColor: "#176B52"
    defaultColor: "#60736B"
  map:
    controlBackground: "#FFFFFF"
    controlBorder: "#DCE5E0"
    selectedStop: "#E5A43B"
    routeWidth: "4px"
    routeWidthSelected: "6px"
---

# YatraGrid Design System

## 1. Product and design direction

YatraGrid is an intelligent student-mobility platform for two connected audiences:

- **Bus owners and operators:** understand travel demand, inspect route capacity, simulate current schedules, optimize bus assignments and compare service impact with operating cost.
- **Students:** register a travel need, understand their available journey, find their boarding point and receive clear information when a trip is unavailable or disrupted.

The interface should feel like a trustworthy, modern transportation product—not a generic admin template and not a playful consumer ticket-booking app.

### Design principles

1. **Clarity before decoration.** Every screen should make the next action obvious.
2. **Map as a working surface.** Maps communicate routes, stops and demand; they are not decorative hero backgrounds.
3. **Honest operational information.** Clearly distinguish scheduled, estimated, simulated, reported and live information. Never imply GPS tracking when only schedule data exists.
4. **One shared system, two experiences.** Owner and student portals share the same route, stop, demand and schedule language, but have different information density.
5. **Accessible by default.** Use readable type, high contrast, plain language, keyboard support and large mobile touch targets.
6. **Rural-ready.** Keep the student experience lightweight, responsive and understandable on small screens and weaker connections.
7. **Show trade-offs.** Optimization must present student access, waiting time, capacity and financial impact together; do not present a recommendation as universally better without showing its costs.

## 2. Visual identity

### Brand character

- Practical, intelligent, dependable, inclusive and community-oriented.
- Confident but not futuristic to the point of feeling unfamiliar to bus operators.
- Friendly enough for students and coordinators, precise enough for transport operations.

### Logo treatment

Use a simple wordmark: **YatraGrid**. A small route-node or connected-stop symbol may accompany it. Avoid detailed bus illustrations, gradients inside the logo, or overly complex map-pin marks. Keep the wordmark legible at compact sidebar and mobile sizes.

### Colour usage

- **Primary forest green (`#176B52`):** main actions, selected navigation, active route and positive progress.
- **Deep navy (`#16324F`):** structural emphasis, headings, map labels and owner-portal navigation.
- **Soft green (`#E8F3EE`):** selected states, subtle callouts and low-intensity emphasis.
- **Amber (`#E5A43B`):** caution, capacity pressure and attention states.
- **Red (`#C84C4C`):** overcrowding, cancellations, critical service issues and negative financial outcomes.
- **Neutral surfaces:** use white cards over a very light green-grey background. Avoid large areas of saturated colour.

Do not use colour as the only way to communicate status. Pair every colour with a label, icon, number or pattern.

## 3. Typography and hierarchy

Use **Inter** or the system sans-serif stack. Do not depend on the reference product's proprietary “Puffin Transit ExtraBold” font.

- Use display typography for the landing-page hero only.
- Use compact, strong headings in the owner portal.
- Use comfortable body text and concise labels in the student portal.
- Use tabular numerals for KPI values, time, fare and financial figures.
- Do not use oversized 60–72px headings inside operational dashboards.
- Avoid all-caps labels for long text; reserve uppercase for short eyebrow labels and metric captions.

## 4. Layout and navigation

### Public website

The public landing page uses a centered content container, simple top navigation, a strong hero statement, two audience entry points and concise product explanation. Keep the visual hierarchy focused on the shared student-demand-to-operator-planning story.

### Owner portal

Desktop-first, with a collapsible left sidebar and a top bar.

Suggested navigation:

- Overview
- Demand Intelligence
- Live Simulation
- Route Optimizer
- Routes & Stops
- Fleet & Constraints
- Financial Insights
- Scenario Planning
- Reports
- Settings

Use a maximum content width of 1440px. Dashboard pages should use a 12-column responsive grid. Place the primary page action in the page header, not hidden at the bottom of a long page.

### Student portal

Mobile-first. Use a compact header and bottom navigation on mobile:

- Home
- My Bus
- Register Need
- Routes
- Alerts

On wider screens, a narrow sidebar or top navigation is acceptable. Keep primary actions prominent and minimize the number of fields shown at once.

## 5. Landing page

### Hero section

Suggested headline:

**Every journey connected. Every route more informed.**

Supporting copy:

“YatraGrid connects student travel needs with smarter bus operations—helping operators plan practical services and helping students understand their journey.”

Primary CTA: **Explore Bus Owner Portal**  
Secondary CTA: **Find Student Transport**

Use an original route-map illustration or a real interactive preview with a small number of clearly labelled stops. The hero should not claim live bus locations unless real vehicle telemetry exists.

### Page sections

1. Hero with owner and student entry points.
2. Problem statement: uneven demand, uncertain journeys and underused capacity.
3. Two audience cards: For Bus Owners / For Students.
4. How it works: Register demand → Analyze → Simulate and optimize → Share schedule.
5. Product preview showing an owner map and student journey card.
6. Trust and transparency section explaining scheduled versus live information.
7. Final CTA and compact footer.

Keep marketing language factual. Do not invent supported cities, fleet counts, accuracy rates, customer logos or performance claims.

## 6. Authentication and account entry

Provide one consistent sign-in experience with an explicit account type:

- Bus Owner
- Student

The selected role must be visible and clear. Registration forms should ask only for information required by that role. Provide password visibility, inline validation, loading, error and success states. Include a demo-account entry only when deliberately configured for the competition demonstration.

Role selection in the UI is not authorization. Enforce owner/student permissions in the backend. Never place real credentials or privileged API keys in frontend code.

## 7. Owner dashboard design

The owner portal is information-dense but must remain scannable. Lead with today's operating picture, followed by the map and actionable exceptions.

### Overview page

Recommended order:

1. Page title, operating area/date selector and **Run Simulation** action.
2. KPI row: active buses, registered travel needs, students served (label as simulated when applicable), unserved demand.
3. Main operational map with route lines, stops and demand indicators.
4. Demand by time chart and route utilization chart.
5. Alerts: overcrowded stops, unserved demand, route disruptions.
6. Recent travel registrations or schedule changes.

KPI cards should include a concise label, primary value, optional comparison period and a clear data status. Avoid adding decorative sparkline charts unless they communicate a meaningful trend.

### Demand Intelligence

Provide filters for date, time slot, route, stop and institution. Show demand by stop and time against available seats. The heatmap must include a legend and numeric values on selection. Use accessible labels such as “Over capacity by 8 students,” not colour alone.

### Live Simulation

Show a clear current-simulation state with:

- Simulated clock and timeline scrubber.
- Play, pause, reset and speed controls.
- Boarded, waiting, stranded and overcrowded counts.
- Bus position along its route, based on simulation events.
- A clear “Simulation” label so the user does not mistake the replay for live GPS.

Use restrained motion. Keep playback controls accessible and ensure the simulation can be understood without animation.

### Route Optimizer

Show the baseline and optimized plans side by side. Include a before/after map or replay, schedule-difference list and concise explanation of each change.

Show impact metrics together:

- Students served.
- Unserved/stranded students.
- Average wait.
- Load factor.
- Daily operating cost.
- Estimated revenue.
- Viability gap.

Explain the viability gap consistently: **operating cost minus revenue**. Mark positive values as a deficit and negative values as a surplus. Show which constraints were respected and any students or areas still unserved. Provide an explicit **Apply recommended schedule** action only if the application actually persists the change; otherwise label it as a proposed plan.

### Routes and stops

Use a split layout: map on one side and searchable route/stop list on the other. Selecting a list item highlights it on the map; selecting a map marker opens the matching detail panel. Keep route colours consistent across all pages and provide a legend.

### Fleet and constraints

Use a structured form for bus count, seats per bus, permitted routes, driver-hour limits, fuel price and operating cost assumptions. Group related fields, show units and validate ranges. Display which constraints are fixed and which may be changed for a scenario.

### Financial insights

Present cost, revenue, cost per student served and viability gap with explicit units and periods (per day, per trip or per month). Use neutral comparisons and avoid implying financial certainty from simulated or estimated data.

### Scenario planning

Use compact scenario cards or segmented controls for Exam Day, Heavy Rain, Bus Breakdown and Route Closure. Show the parameter changes the scenario introduces before running it. Preserve the baseline so users can compare results and reset safely.

## 8. Student dashboard design

The student experience is mobile-first, task-focused and low-friction. A student should understand the next journey within seconds.

### Home

Show:

1. Greeting and selected language.
2. Next journey card (or honest “No bus assigned” state).
3. Boarding stop, scheduled departure, destination and scheduled arrival.
4. Bus identifier and typical crowding only when supported by data.
5. A prominent **View My Route** action.
6. Service notice or disruption alert.
7. Quick action to register or update a travel need.

Avoid presenting estimated arrival as live arrival unless a live data source is connected. Label schedule-based times clearly.

### Register Travel Need

Use a short step-by-step form with clear progress:

1. Home village and preferred boarding stop.
2. Institution/destination.
3. Arrival deadline and preferred departure window.
4. Days of travel.
5. Review and submit.

Allow the student to edit or cancel a submitted need. Explain that registration expresses demand and does not guarantee a seat or assigned bus.

### My Bus

Show assigned bus, boarding stop, scheduled time, destination, service days and the source/status of the information. If no bus is assigned, offer only valid alternatives available in the dataset: nearest served stop, another departure window or a pooled option. Do not invent availability.

### Routes and map

Keep the student map focused on the home stop, boarding stop, destination, selected route and nearby served stops. Provide a linked list view for users who cannot comfortably use the map. Map interactions must not be the only way to access journey information.

### Alerts and disruption reports

Use plain-language notices with a timestamp and clear action. Allow “Bus did not arrive” reports, but mark them as student-reported until verified. Distinguish confirmed operator updates from unverified reports.

## 9. Map design system

Maps are a core product feature for both roles.

### Owner map layers

- Route lines, with the selected route visually emphasized.
- Stop markers with selected, normal and issue states.
- Demand intensity by stop/time.
- Bus positions from simulation events or explicitly available telemetry.
- Unserved-demand markers.
- Optional service-area or route-closure overlays.

### Student map layers

- Home/boarding stop.
- Destination institution.
- Assigned route.
- Nearby served stops and alternatives.

### Interaction rules

- Marker selection opens a compact detail panel.
- Selected route remains visually distinct from other routes.
- Provide zoom, fit-route and reset controls.
- Do not obscure map content with multiple floating panels.
- Provide an equivalent stop/route list for accessibility and small screens.
- Use a visible legend and clear units.
- Show map attribution and comply with the selected tile provider's usage terms.

For a fast prototype, React Leaflet with an appropriate OpenStreetMap-compatible tile provider is suitable. Do not assume that public tile servers permit unrestricted production traffic.

## 10. Data visualization rules

- Use green for positive service improvement, not automatically for every optimized value.
- Use red for overcrowding, unserved demand, disruption and negative financial outcomes.
- Use amber for warning/near-capacity states.
- Keep chart legends, units, axes and date/time ranges visible.
- Use tooltips for detail, but show essential values directly on the page.
- Avoid 3D charts, decorative gauges and excessive gradients.
- For before/after comparisons, use the same scale and show absolute values alongside percentage changes.
- Always explain whether data is actual, estimated, simulated or illustrative.

## 11. Component standards

### Buttons

Use sentence case and clear action verbs: “Run simulation”, “Optimize schedule”, “Register travel need”, “View route”. Primary buttons are forest green with white text. Secondary actions are neutral outlined buttons. Destructive actions require confirmation.

### Cards

Use white surfaces, subtle borders and consistent 16px radii. Cards should group related content rather than simply decorate every metric. Use 20px padding on desktop and 16px on compact screens.

### Forms

Use persistent labels, not placeholder-only labels. Show validation next to the relevant field. Use native input semantics and accessible error messages. Provide units and examples where ambiguity is likely.

### Tables and lists

Use compact but readable rows, clear column headings, row hover and a responsive alternative for narrow screens. Important states must remain visible without relying on hover.

### Status badges

Use concise text with a semantic colour and, where useful, an icon: Scheduled, Simulated, Delayed, Cancelled, Over capacity, Unserved, Reported, Verified.

### Empty, loading and error states

Every data-heavy page must have designed states for loading, no data, failed request and partial data. Provide a next action and retry option where appropriate. Never display fake live data to fill an empty state.

## 12. Responsive behaviour

### Desktop: 1200px and above

- Full owner sidebar and multi-column analytics.
- Map and details can be displayed side by side.
- Keep primary controls visible without excessive scrolling.

### Tablet: 768px–1199px

- Collapsible owner sidebar.
- Reduce chart columns and stack secondary panels.
- Keep map controls touch-friendly.

### Mobile: below 768px

- Student portal is the primary optimized experience.
- Use bottom navigation and full-width primary actions.
- Stack journey details vertically.
- Convert owner tables to compact cards or horizontally scrollable tables with clear affordances.
- Map controls must not cover route details.
- Maintain at least 44px touch targets where practical.
- Avoid horizontal page overflow.

## 13. Accessibility and localization

- Target WCAG 2.2 AA contrast for text and interactive controls.
- Support keyboard navigation and visible focus states.
- Use semantic headings, buttons, labels and landmarks.
- Provide text alternatives for map-only information.
- Do not rely on red/green distinctions alone.
- Support long translated labels without clipping or fixed-width assumptions.
- Keep dates, times, numbers and currency formatted consistently for the selected locale.
- Provide a visible language selector. Initial language options may include English and Kannada, with additional languages added when translations are ready.

## 14. Motion and interaction

Use subtle transitions for navigation, accordions, drawers, chart changes and route selection. Prefer short transitions around 150–220ms. Avoid parallax, excessive scroll animation and continuous decorative movement. Respect reduced-motion preferences. Simulation playback is functional motion and must include pause and reset controls.

## 15. Technical implementation guidance

Recommended frontend foundation when the project stack is selected:

- React + TypeScript.
- Tailwind CSS.
- shadcn/ui components where appropriate.
- Lucide icons.
- Recharts for analytics.
- React Leaflet for maps.
- Motion for React only where animation adds clarity.

Keep design tokens in one place using CSS variables. Build reusable components for KPI cards, status badges, filters, map legends, route markers, journey cards, empty states and comparison panels. Avoid duplicating styles between the owner and student portals.

Do not install all recommended libraries automatically. Add only what the actual implementation needs.

## 16. Demo-data and trust rules

For competition demonstrations, illustrative datasets are acceptable when clearly identified as demo data. Use realistic but internally consistent stops, routes, buses, capacities, schedules and student requests. The same data model must feed both the owner and student experiences.

When a student submits a travel need, update the shared demand source used by the owner view. When an owner produces a proposed optimized schedule, the student view should reflect it only after that proposal is applied or explicitly marked as a proposed schedule.

Never claim real-time GPS, verified passenger counts, guaranteed seats, actual revenue or confirmed bus arrival unless the system has the corresponding real data source.

## 17. Design acceptance checklist

Before considering a screen complete, verify:

- It follows the YatraGrid colour and typography tokens.
- The primary user action is obvious.
- Owner and student experiences use consistent route and stop terminology.
- Map information has a list/text equivalent.
- All data shows units and a meaningful time period.
- Simulated, scheduled, estimated and live states are clearly distinguished.
- Forms have labels, validation and success/error feedback.
- Empty, loading and error states are implemented.
- Mobile screens do not overflow or become cluttered.
- Keyboard focus and contrast are usable.
- No unsupported claims or fabricated live data are shown.

## 18. Reference direction

Use the supplied Transit design reference only as inspiration for a friendly, accessible rider experience, clear journey information and approachable rounded components. Do not copy its proprietary font, brand identity, exact screens or blue/pink colour palette.

For YatraGrid:

- Rider experience: simple journey cards, obvious route information and clear service alerts.
- Operator experience: operational clarity, map-led planning, restrained analytics and transparent before/after trade-offs.
- Shared visual language: forest green, deep navy, clean neutral surfaces, consistent route colours and accessible status labels.

**The final product should feel like one trustworthy mobility platform with two purpose-built experiences: an operational workspace for bus owners and a simple journey companion for students.**
