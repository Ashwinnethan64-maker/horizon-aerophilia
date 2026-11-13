import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Bus as BusIcon,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Info,
  X,
  Compass,
  Eye,
  EyeOff
} from 'lucide-react';
import { computeReplaySnapshot, getReplayBounds } from './simReplay';
import { TransportMap, MapLayerToggles } from './TransportMap';

export const SimMap: React.FC = () => {
  const {
    network,
    students,
    baselineResult,
    optimizedResult,
    viewingOptimized,
    currentSchedule,
    optimizedSchedule,
    replayTimeIndex,
    isLoading,
    selectedStopId,
    setSelectedStopId,
    selectedRouteId,
    setSelectedRouteId,
    language
  } = useStore();
  const isKn = language === 'kn';

  const [showLegend, setShowLegend] = useState(true);
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Independent Map Layer Toggles as per Plan Section 5
  const [layers, setLayers] = useState<MapLayerToggles>({
    baseMap: true,
    coreArea: true,
    studyBuffer: true,
    routes: true,
    stops: true,
    buses: true,
    demandIntensity: true,
    anchors: true
  });

  const toggleLayer = (key: keyof MapLayerToggles) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeResult = viewingOptimized && optimizedResult ? optimizedResult : baselineResult;
  const activeSchedule =
    viewingOptimized && optimizedSchedule ? optimizedSchedule : currentSchedule;
  const events = activeResult?.events ?? [];

  const bounds = useMemo(() => getReplayBounds(events), [events]);
  const currentMinute = bounds.minMinute + Math.min(replayTimeIndex, bounds.totalMinutes);

  const snapshot = useMemo(
    () => computeReplaySnapshot(network, students, events, activeSchedule, currentMinute),
    [network, students, events, activeSchedule, currentMinute]
  );

  const stops = network?.stops ?? [];
  const routes = network?.routes ?? [];

  const selectedStop = stops.find((s) => s.id === selectedStopId);
  const selectedStopState = snapshot.stops.find((s) => s.stop.id === selectedStopId);
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  if (!network && isLoading) {
    return (
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-8 text-center text-yg-textSecondary">
        Loading regional geographic map...
      </div>
    );
  }

  if (!network || stops.length === 0) {
    return (
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-8 text-center text-yg-textSecondary">
        No regional network data available. Please verify backend or mock mode.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border overflow-hidden">
      {/* Map Header with Corridor Title & Layer Controls */}
      <div className="p-4 border-b border-yg-border flex flex-wrap items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-yg-primarySoft flex items-center justify-center text-yg-primary">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-[#111111] text-sm sm:text-base leading-none">
                {isKn ? 'ಮಂಗಳೂರು–ಗುರುಪುರ–ಪೊಳಲಿ ಕಾರಿಡಾರ್' : 'Mangaluru–Gurupura–Polali Corridor'}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFD93D] text-[#111111] border border-[#111111]">
                {isKn ? '5 ಕಿ.ಮೀ ಅಧ್ಯಯನ ವ್ಯಾಪ್ತಿ' : '5 km Study Buffer'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#0866F5] border border-[#111111] hidden sm:inline-block">
                OpenStreetMap Leaflet
              </span>
            </div>
            <p className="text-xs text-[#454545] mt-0.5">
              {isKn
                ? 'ನೈಜ ರಸ್ತೆ ಭೂಗೋಳ, ಬಸ್ ನಿಲ್ದಾಣಗಳು, ಮಾರ್ಗಗಳು ಮತ್ತು ಸಿಮ್ಯುಲೇಟೆಡ್ ಬಸ್‌ಗಳನ್ನು ತೋರಿಸುವ ನಕ್ಷೆ.'
                : 'Operations simulation map displaying real road geography, bus stops, route lines, and simulated buses.'}
            </p>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-yg-btn font-semibold border transition-colors ${
              showLayerPanel
                ? 'bg-yg-secondary text-white border-yg-secondary shadow-xs'
                : 'bg-white text-yg-secondary border-yg-border hover:bg-yg-surfaceSubtle'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isKn ? 'ಪದರಗಳು' : 'Layers'} ({Object.values(layers).filter(Boolean).length}/8)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowLegend(!showLegend)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-[4px] font-bold border-2 border-[#111111] transition-colors cursor-pointer ${
              showLegend
                ? 'bg-[#EAF2FF] text-[#0866F5]'
                : 'bg-white text-[#454545] hover:bg-[#F6F4EA]'
            }`}
          >
            <span>{isKn ? 'ಸೂಚಿ' : 'Legend'}</span>
          </button>
        </div>
      </div>

      {/* Layer Visibility Drawer (when toggled) */}
      {showLayerPanel && (
        <div className="bg-yg-surfaceSubtle border-b border-yg-border p-3.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-yg-secondary mr-1 uppercase text-[10px] tracking-wider">
            Layer Visibility:
          </span>
          {[
            { key: 'baseMap', label: 'Base Map (OSM)' },
            { key: 'studyBuffer', label: '5 km Study Buffer' },
            { key: 'coreArea', label: 'Core Operating Area' },
            { key: 'routes', label: 'Bus Routes' },
            { key: 'stops', label: 'Bus Stops' },
            { key: 'buses', label: 'Simulated Buses' },
            { key: 'demandIntensity', label: 'Demand Halos' },
            { key: 'anchors', label: 'Geographic Anchors' }
          ].map((item) => {
            const isEnabled = (layers as any)[item.key];
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggleLayer(item.key as any)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-medium text-xs border transition-colors ${
                  isEnabled
                    ? 'bg-white text-yg-secondary border-yg-secondary/30 shadow-xs'
                    : 'bg-transparent text-yg-textSecondary border-transparent line-through opacity-60'
                }`}
              >
                {isEnabled ? <Eye className="w-3 h-3 text-yg-primary" /> : <EyeOff className="w-3 h-3" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Live Replay Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-yg-surfaceSubtle border-b border-yg-border">
        <div className="bg-white border border-yg-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
          <Clock className="w-4 h-4 text-yg-primary shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-yg-textSecondary">Sim Clock</div>
            <div className="text-sm font-bold text-yg-secondary tabular-nums">
              {snapshot.currentTimeLabel}
            </div>
          </div>
        </div>

        <div className="bg-white border border-yg-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
          <Users className="w-4 h-4 text-[#72B99A] shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-yg-textSecondary">Waiting</div>
            <div className="text-sm font-bold text-yg-secondary tabular-nums">
              {snapshot.totals.waiting}
            </div>
          </div>
        </div>

        <div className="bg-white border border-yg-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
          <BusIcon className="w-4 h-4 text-yg-info shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-yg-textSecondary">Boarded</div>
            <div className="text-sm font-bold text-yg-secondary tabular-nums">
              {snapshot.totals.boarded}
            </div>
          </div>
        </div>

        <div className="bg-white border border-yg-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-yg-danger shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-yg-danger">Stranded</div>
            <div className="text-sm font-bold text-yg-danger tabular-nums">
              {snapshot.totals.stranded}
            </div>
          </div>
        </div>

        <div className="bg-white border border-yg-border rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs col-span-2 sm:col-span-1">
          <CheckCircle2 className="w-4 h-4 text-yg-success shrink-0" />
          <div>
            <div className="text-[10px] uppercase font-bold text-yg-success">Arrived</div>
            <div className="text-sm font-bold text-yg-secondary tabular-nums">
              {snapshot.totals.arrived}
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Canvas: Leaflet + OpenStreetMap */}
      <div className="relative w-full aspect-[16/9] min-h-[460px] max-h-[620px] bg-slate-100">
        <TransportMap snapshot={snapshot} layers={layers} />

        {/* Floating Legend Overlay (when enabled) */}
        {showLegend && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-md border border-yg-border text-yg-secondary p-3 rounded-yg-btn text-xs shadow-yg-popover space-y-2 max-w-[230px]">
            <div className="font-bold text-yg-secondary border-b border-yg-border pb-1.5 flex items-center justify-between">
              <span>Corridor Map Legend</span>
              <button
                type="button"
                onClick={() => setShowLegend(false)}
                className="text-yg-textSecondary hover:text-yg-secondary"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-2 rounded-xs bg-[#E42B0C] inline-block" />
                <span>R1 Mangaluru–Polali Trunk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-2 rounded-xs bg-[#3478B8] inline-block" />
                <span>R2 Bondantila–Polali Feeder</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#21865B] border border-white inline-block" />
                <span>Terminal High School (S6)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#16324F] border border-white inline-block" />
                <span>Intermediate Stop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-2 border border-dashed border-[#C98320] bg-amber-100/40 inline-block" />
                <span>Proposed 5 km Study Buffer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-100 border border-red-500 inline-block" />
                <span>Over-Capacity / Stranded Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#16324F] text-[9px] text-white flex items-center justify-center font-bold">
                  📍
                </span>
                <span>Geographic Locality Anchor</span>
              </div>
            </div>
          </div>
        )}

        {/* Live Timeline Ticker Bottom Bar */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-[1000] bg-yg-secondary/95 backdrop-blur-md border border-[#334E68] text-xs text-white px-3.5 py-1.5 rounded-lg flex items-center gap-2 shadow-yg-popover">
          <span className="w-2 h-2 rounded-full bg-yg-success shrink-0" />
          <span className="truncate">
            {snapshot.latestEvent
              ? `${snapshot.latestEvent.time} — ${snapshot.latestEvent.details || snapshot.latestEvent.type}`
              : `Ready at ${snapshot.currentTimeLabel} — Press Play to start simulation replay`}
          </span>
        </div>
      </div>

      {/* Selected Stop / Route Inspection Bar */}
      {(selectedStop || selectedRoute) && (
        <div className="p-3.5 bg-yg-surfaceSubtle border-t border-yg-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-yg-primarySoft text-yg-primary">
              <Info className="w-4 h-4" />
            </div>
            <div>
              {selectedStop ? (
                <>
                  <span className="text-yg-textSecondary">Selected Stop:</span>{' '}
                  <strong className="text-yg-secondary text-sm">
                    {selectedStop.name} ({selectedStop.id})
                  </strong>
                  {selectedStop.kannadaName && (
                    <span className="text-yg-textSecondary ml-1">({selectedStop.kannadaName})</span>
                  )}
                  {selectedStop.id === 'S6' && (
                    <span className="ml-2 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Terminal Institution
                    </span>
                  )}
                </>
              ) : selectedRoute ? (
                <>
                  <span className="text-yg-textSecondary">Selected Route:</span>{' '}
                  <strong className="text-yg-secondary text-sm">
                    {selectedRoute.name || selectedRoute.id}
                  </strong>
                  <span className="ml-2 text-[10px] font-semibold bg-yg-secondarySoft text-yg-secondary px-2 py-0.5 rounded-full">
                    {selectedRoute.stopIds.length} stops &bull; Terminal {selectedRoute.destinationStopId}
                  </span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-yg-secondary font-medium">
            {selectedStop && (
              <>
                <span>
                  Registered Demand:{' '}
                  <strong className="text-yg-primary">{selectedStopState?.totalHomeStudents ?? 0} students</strong>
                </span>
                <span>
                  Waiting:{' '}
                  <strong className="text-[#3478B8]">{selectedStopState?.waiting ?? 0}</strong>
                </span>
                <span>
                  Stranded:{' '}
                  <strong className="text-yg-danger">{selectedStopState?.stranded ?? 0}</strong>
                </span>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setSelectedStopId(null);
                setSelectedRouteId(null);
              }}
              className="text-yg-textSecondary hover:text-yg-secondary underline text-xs font-semibold"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
