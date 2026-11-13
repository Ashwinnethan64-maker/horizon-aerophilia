import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Marker,
  Popup,
  GeoJSON,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../store/useStore';
import {
  MAP_CENTER,
  INITIAL_BOUNDS,
  GEOGRAPHIC_ANCHORS,
  CORE_OPERATING_AREA_GEOJSON,
  STUDY_BUFFER_5KM_GEOJSON,
  ROUTE_GEOMETRY
} from '../data/operatingArea';
import type { ReplaySnapshot } from './simReplay';

// Fix standard Leaflet default icon paths if needed
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

export interface MapLayerToggles {
  baseMap: boolean;
  coreArea: boolean;
  studyBuffer: boolean;
  routes: boolean;
  stops: boolean;
  buses: boolean;
  demandIntensity: boolean;
  anchors: boolean;
}

interface TransportMapProps {
  snapshot: ReplaySnapshot;
  layers: MapLayerToggles;
}

// Controller component to handle programmatically updating bounds or invalidating size
function MapController({ resetTrigger }: { resetTrigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    map.fitBounds(INITIAL_BOUNDS, { padding: [24, 24], maxZoom: 14 });
  }, [map, resetTrigger]);
  return null;
}

export const TransportMap: React.FC<TransportMapProps> = ({ snapshot, layers }) => {
  const {
    network,
    selectedStopId,
    setSelectedStopId,
    selectedRouteId,
    setSelectedRouteId,
    language
  } = useStore();

  const routes = network?.routes ?? [];
  const stops = network?.stops ?? [];
  const resetTriggerRef = useRef(0);

  // Custom bus HTML marker generator
  const createBusDivIcon = (busState: typeof snapshot.buses[0]) => {
    const isFull = busState.load >= busState.bus.capacity;
    const isEnRoute = busState.status === 'en_route';
    const busBg = busState.bus.routeId === 'R2' ? '#3478B8' : '#E42B0C';

    const html = `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        ${isEnRoute ? `<div style="position: absolute; top: -6px; width: 34px; height: 34px; border-radius: 999px; background: ${busBg}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="background: ${isFull ? '#C84C4C' : busBg}; color: #ffffff; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 8px; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>🚌 ${busState.bus.id}</span>
          <span style="background: rgba(0,0,0,0.25); padding: 1px 4px; border-radius: 4px; font-size: 9.5px; font-weight: 700;">
            ${busState.load}/${busState.bus.capacity}${isFull ? ' FULL' : ''}
          </span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${isFull ? '#C84C4C' : busBg};"></div>
      </div>
    `;

    return L.divIcon({
      className: 'yg-leaflet-bus-marker',
      html,
      iconSize: [68, 38],
      iconAnchor: [34, 38],
      popupAnchor: [0, -36]
    });
  };

  // Custom Landmark Anchor Icon
  const createAnchorIcon = (anchor: typeof GEOGRAPHIC_ANCHORS[0]) => {
    const html = `
      <div style="display: flex; align-items: center; gap: 4px; background: #16324F; color: #ffffff; padding: 3px 7px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1.5px solid #F59E0B; box-shadow: 0 2px 6px rgba(0,0,0,0.3); white-space: nowrap;">
        <span>📍</span>
        <span>${language === 'kn' ? anchor.kannadaName : anchor.name.replace(' Anchor', '')}</span>
      </div>
    `;
    return L.divIcon({
      className: 'yg-leaflet-anchor-marker',
      html,
      iconSize: [120, 24],
      iconAnchor: [60, 12]
    });
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-lg overflow-hidden border border-yg-border shadow-xs">
      <MapContainer
        center={MAP_CENTER}
        zoom={12}
        minZoom={10}
        maxZoom={16}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '460px', background: '#F5F5F5' }}
      >
        <MapController resetTrigger={resetTriggerRef.current} />

        {/* 1. Base Map Layer (OpenStreetMap with Mandatory Attribution) */}
        {layers.baseMap && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        {/* 2. Proposed 5 km Study Buffer Layer */}
        {layers.studyBuffer && (
          <GeoJSON
            key="study-buffer-layer"
            data={STUDY_BUFFER_5KM_GEOJSON}
            style={{
              color: '#C98320', // Warm amber outline
              weight: 2,
              dashArray: '6, 6',
              fillColor: '#E5A43B',
              fillOpacity: 0.08
            }}
          />
        )}

        {/* 3. Core Operating Area Catchment Layer */}
        {layers.coreArea && (
          <GeoJSON
            key="core-operating-layer"
            data={CORE_OPERATING_AREA_GEOJSON}
            style={{
              color: '#176B52', // Forest green boundary
              weight: 2.5,
              fillColor: '#176B52',
              fillOpacity: 0.06
            }}
          />
        )}

        {/* 4. Real Route Polylines */}
        {layers.routes &&
          routes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            const routeCoords =
              ROUTE_GEOMETRY[route.id] ||
              route.stopIds
                .map((id) => stops.find((s) => s.id === id))
                .filter(Boolean)
                .map((s) => [s!.lat ?? 12.8632, s!.lng ?? 74.8378] as [number, number]);

            const routeColor =
              route.id === 'R1' ? '#E42B0C' : '#3478B8'; // Vermillion for R1 Trunk, Blue for R2 Feeder

            return (
              <React.Fragment key={route.id}>
                {/* Thick road underlay for contrast */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{
                    color: '#FFFFFF',
                    weight: isSelected ? 8 : 6,
                    lineCap: 'round',
                    lineJoin: 'round',
                    opacity: 0.9
                  }}
                />
                {/* Active Colored Route Polyline */}
                <Polyline
                  positions={routeCoords}
                  eventHandlers={{
                    click: () => setSelectedRouteId(route.id)
                  }}
                  pathOptions={{
                    color: routeColor,
                    weight: isSelected ? 5.5 : 3.5,
                    opacity: isSelected ? 1 : 0.85,
                    dashArray: isSelected ? undefined : '7, 5'
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1">
                      <div className="font-bold text-slate-900">{route.name || route.id}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {route.stopIds.length} stops &bull; Terminal: {route.destinationStopId}
                      </div>
                    </div>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

        {/* 5. Geographic Anchors */}
        {layers.anchors &&
          GEOGRAPHIC_ANCHORS.map((anchor) => (
            <Marker
              key={anchor.name}
              position={[anchor.lat, anchor.lng]}
              icon={createAnchorIcon(anchor)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1">
                  <div className="font-bold text-slate-900">{anchor.name}</div>
                  <div className="text-slate-600 font-medium">{anchor.kannadaName}</div>
                  <p className="text-[11px] text-slate-500">{anchor.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* 6. Stop Markers & Demand Intensity Halos */}
        {layers.stops &&
          snapshot.stops.map(({ stop, isTerminal, waiting, stranded, arrived, totalHomeStudents }) => {
            const isSelected = selectedStopId === stop.id;
            const stopLat = stop.lat ?? 12.8632;
            const stopLng = stop.lng ?? 74.8378;

            return (
              <React.Fragment key={stop.id}>
                {/* Demand Intensity Halo */}
                {layers.demandIntensity && totalHomeStudents > 0 && (
                  <CircleMarker
                    center={[stopLat, stopLng]}
                    radius={Math.min(32, 10 + totalHomeStudents * 0.7)}
                    pathOptions={{
                      color: stranded > 0 ? '#C84C4C' : '#21865B',
                      fillColor: stranded > 0 ? '#C84C4C' : '#72B99A',
                      fillOpacity: 0.18,
                      weight: 1.2,
                      dashArray: stranded > 0 ? '3, 3' : undefined
                    }}
                  />
                )}

                {/* Selected Ring */}
                {isSelected && (
                  <CircleMarker
                    center={[stopLat, stopLng]}
                    radius={isTerminal ? 16 : 13}
                    pathOptions={{
                      color: '#E42B0C',
                      weight: 3.5,
                      fill: false
                    }}
                  />
                )}

                {/* Core Stop Marker */}
                <CircleMarker
                  center={[stopLat, stopLng]}
                  radius={isTerminal ? 10 : 7}
                  eventHandlers={{
                    click: () => setSelectedStopId(stop.id)
                  }}
                  pathOptions={{
                    color: '#FFFFFF',
                    weight: 2,
                    fillColor: isTerminal
                      ? '#21865B'
                      : stranded > 0
                      ? '#C84C4C'
                      : isSelected
                      ? '#E42B0C'
                      : '#16324F',
                    fillOpacity: 1
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1 space-y-2 min-w-[190px]">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 text-sm">{stop.name}</strong>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                            {stop.id}
                          </span>
                        </div>
                        {stop.kannadaName && (
                          <div className="text-slate-500 text-[11px]">{stop.kannadaName}</div>
                        )}
                        {isTerminal && (
                          <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Terminal High School
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-2 rounded-lg text-[11px] border border-slate-200">
                        <div>
                          <span className="text-slate-500 block">Demand:</span>
                          <strong className="text-slate-900">{totalHomeStudents} students</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Waiting:</span>
                          <strong className="text-blue-700">{waiting}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Stranded:</span>
                          <strong className="text-red-600">{stranded}</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Arrived:</span>
                          <strong className="text-emerald-700">{arrived}</strong>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400">
                        Coordinates: {stopLat.toFixed(4)}, {stopLng.toFixed(4)} &bull; Verified Corridor
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* 7. Moving Simulated Buses */}
        {layers.buses &&
          snapshot.buses.map((busState) => (
            <Marker
              key={busState.bus.id}
              position={[busState.lat, busState.lng]}
              icon={createBusDivIcon(busState)}
            >
              <Popup>
                <div className="text-xs p-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-slate-900 font-bold text-sm">
                      Bus {busState.bus.id}
                    </strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 font-semibold">
                      Route {busState.bus.routeId}
                    </span>
                  </div>
                  <div className="text-slate-600 text-xs">
                    Passenger Load:{' '}
                    <strong className={busState.load >= busState.bus.capacity ? 'text-red-600' : 'text-slate-900'}>
                      {busState.load} / {busState.bus.capacity} seats
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Status: <strong className="text-slate-800 capitalize">{busState.status.replace('_', ' ')}</strong>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                    Simulated movement based on timetable event progression.
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};
