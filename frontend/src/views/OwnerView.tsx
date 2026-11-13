import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SimMap } from '../components/SimMap';
import { ImpactPanel } from '../components/ImpactPanel';
import { DemandHeatmap } from '../components/DemandHeatmap';
import { ScenarioBar } from '../components/ScenarioBar';
import { Play, RotateCcw, Zap, Send, ArrowRight } from 'lucide-react';

export const OwnerView: React.FC = () => {
  const {
    runOptimization,
    isLoading,
    scheduleDiff,
    viewingOptimized,
    setViewingOptimized,
    weights,
    setWeights,
    executeWhatIf
  } = useStore();

  const [whatIfText, setWhatIfText] = useState('');
  const [whatIfResponse, setWhatIfResponse] = useState<string | null>(null);

  const handleWhatIf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatIfText.trim()) return;
    try {
      const explanation = await executeWhatIf(whatIfText);
      setWhatIfResponse(explanation);
    } catch {
      // Handled in store
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Scenarios & Optimization */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <ScenarioBar />
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewingOptimized(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                !viewingOptimized ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Baseline
            </button>
            <button
              onClick={() => setViewingOptimized(true)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                viewingOptimized ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Optimized
            </button>
          </div>

          <button
            onClick={() => runOptimization()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
          >
            <Zap className="w-4 h-4 fill-white" />
            {isLoading ? 'Optimizing...' : 'Optimize Schedule'}
          </button>
        </div>
      </div>

      {/* Metrics Panel */}
      <ImpactPanel />

      {/* Schedule Diff Panel if optimized */}
      {scheduleDiff && scheduleDiff.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4">
          <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
            Schedule Reallocations (Optimizer Diff)
          </h3>
          <div className="space-y-2">
            {scheduleDiff.map((d) => (
              <div key={d.busId} className="flex items-center gap-3 text-xs bg-white/80 p-2.5 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-700 px-2 py-0.5 bg-indigo-100 rounded">{d.busId}</span>
                <span className="text-slate-500 line-through">{d.oldDepartures.join(', ')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-semibold text-emerald-700">{d.newDepartures.join(', ')}</span>
                <span className="text-slate-600 ml-auto">{d.changeDescription}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map & Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SimMap />
          {/* Replay Scrubbing Controls */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-700">
                <Play className="w-4 h-4 fill-current" />
              </button>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-700">
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 ml-2">Replay 07:00 - 08:30</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              defaultValue="5"
              className="w-1/2 accent-indigo-600"
            />
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600">
              <button className="px-2 py-1 rounded bg-slate-100">1x</button>
              <button className="px-2 py-1 rounded hover:bg-slate-100">2x</button>
              <button className="px-2 py-1 rounded hover:bg-slate-100">4x</button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <DemandHeatmap />

          {/* Access vs Cost Slider */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-3">Policy: Access vs Cost</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-indigo-600">Max Student Access</span>
                <span className="text-emerald-600">Cost Viability</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={weights.served}
                onChange={(e) => {
                  const accessWeight = Number(e.target.value);
                  const viabilityWeight = Math.max(0.1, Number((2 - ((accessWeight - 1) / 19) * 1.9).toFixed(1)));
                  setWeights({ served: accessWeight, viability: viabilityWeight });
                }}
                className="w-full accent-indigo-600"
              />
              <p className="text-xs text-slate-500">
                Access weight: {weights.served.toFixed(0)} · Viability weight: {weights.viability.toFixed(1)}. Higher access shifts more weight toward students served on time.
              </p>
            </div>
          </div>

          {/* What-if text box */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-2">Natural Language What-If</h3>
            <p className="text-xs text-slate-500 mb-3">
              Ask policy questions or test hypothetical shifts in plain English.
            </p>
            <form onSubmit={handleWhatIf} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Move BUS001 to 7:30 AM, or close R02..."
                  value={whatIfText}
                  onChange={(e) => setWhatIfText(e.target.value)}
                  className="w-full text-xs px-3 py-2 pr-9 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-1.5 top-1.5 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Quick What-If Presets */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick What-If Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Shift Bus 3 to 07:45 AM',
                  'Increase Bus 1 capacity to 50',
                  'Cancel Bus 3 12:00 run',
                  'What if Bus B1 breaks down?'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setWhatIfText(preset);
                      executeWhatIf(preset).then(exp => setWhatIfResponse(exp)).catch(() => {});
                    }}
                    className="text-[11px] px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
            {whatIfResponse && (
              <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {whatIfResponse}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
