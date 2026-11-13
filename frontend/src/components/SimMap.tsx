import React from 'react';
import { useStore } from '../store/useStore';
import { MapPin } from 'lucide-react';

export const SimMap: React.FC = () => {
  const { network } = useStore();

  const stops = network?.stops || [];
  const routes = network?.routes || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Regional Route & Demand Map</h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Boarded
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Stranded
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Bus
          </span>
        </div>
      </div>

      <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-lg overflow-hidden mt-3">
        <svg className="w-full h-full" viewBox="0 0 700 450">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Route connections */}
          {routes.map((route) => {
            const pathPoints = route.stopIds
              .map(id => stops.find(s => s.id === id))
              .filter(Boolean)
              .map(s => `${s!.x},${s!.y}`)
              .join(' L ');

            return (
              <g key={route.id}>
                <path
                  d={`M ${pathPoints}`}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${pathPoints}`}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                />
              </g>
            );
          })}

          {/* Stops */}
          {stops.map((stop) => {
            const isTerminal = stop.id === 'S6';
            return (
              <g key={stop.id} transform={`translate(${stop.x}, ${stop.y})`} className="cursor-pointer">
                <circle
                  r={isTerminal ? 14 : 9}
                  fill={isTerminal ? '#10b981' : '#1e293b'}
                  stroke={isTerminal ? '#34d399' : '#94a3b8'}
                  strokeWidth="2"
                />
                {isTerminal && (
                  <circle r="6" fill="#ecfdf5" />
                )}
                <text
                  y={isTerminal ? 26 : 20}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="500"
                  className="select-none"
                >
                  {stop.name}
                </text>
              </g>
            );
          })}

          {/* Simulated buses */}
          <g transform="translate(260, 170)">
            <circle r="12" fill="#6366f1" className="animate-pulse" opacity="0.4" />
            <circle r="8" fill="#4f46e5" />
            <text y="-12" textAnchor="middle" fill="#818cf8" fontSize="10" fontWeight="bold">
              Bus B1 (35/35)
            </text>
          </g>

          <g transform="translate(180, 320)">
            <circle r="8" fill="#ec4899" />
            <text y="-12" textAnchor="middle" fill="#f472b6" fontSize="10" fontWeight="bold">
              Bus B2 (12/30)
            </text>
          </g>
        </svg>

        {/* Live status badge */}
        <div className="absolute bottom-3 left-3 bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 flex items-center gap-3">
          <span>Clock: <strong className="text-white">07:30 AM</strong></span>
          <span className="text-slate-500">|</span>
          <span>Timeline Event: <strong className="text-emerald-400">Boarding at Kishanpur</strong></span>
        </div>
      </div>
    </div>
  );
};
