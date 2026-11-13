import React, { useEffect, useMemo, useState } from 'react';
import { useStore, OwnerTab } from '../store/useStore';
import { SimMap } from '../components/SimMap';
import { ImpactPanel } from '../components/ImpactPanel';
import { DemandHeatmap } from '../components/DemandHeatmap';
import { ScenarioBar } from '../components/ScenarioBar';
import { formatMinuteHHMM, getReplayBounds } from '../components/simReplay';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Send,
  ArrowRight,
  Loader2,
  CheckCircle,
  Sliders,
  DollarSign,
  Bus as BusIcon,
  Navigation,
  Activity,
  AlertCircle,
  Check,
  Sparkles
} from 'lucide-react';

const WHAT_IF_PRESETS = [
  'Move Bus 3 departure to 07:45 AM',
  'Increase capacity of Bus 1 to 50 seats',
  'Simulate severe monsoon rain'
];

export const OwnerView: React.FC = () => {
  const {
    network,
    students,
    activeOwnerTab,
    setActiveOwnerTab,
    runOptimization,
    applyOptimizedSchedule,
    optimizedSchedule,
    scheduleApplied,
    isLoading,
    scheduleDiff,
    baselineResult,
    optimizedResult,
    viewingOptimized,
    setViewingOptimized,
    weights,
    setWeights,
    executeWhatIf,
    replayTimeIndex,
    setReplayTimeIndex,
    replayPlaying,
    setReplayPlaying,
    replaySpeed,
    setReplaySpeed,
    reportedIssues,
    selectedStopId,
    setSelectedStopId
  } = useStore();

  const [whatIfText, setWhatIfText] = useState('');
  const [whatIfResponse, setWhatIfResponse] = useState<string | null>(null);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);
  const [stopSearch, setStopSearch] = useState('');

  const activeResult = viewingOptimized && optimizedResult ? optimizedResult : baselineResult;
  const bounds = useMemo(
    () => getReplayBounds(activeResult?.events ?? []),
    [activeResult?.events]
  );

  // Simulated clock loop
  useEffect(() => {
    if (!replayPlaying) return;
    const intervalMs = Math.max(35, Math.round(220 / replaySpeed));
    const timer = window.setInterval(() => {
      const current = useStore.getState().replayTimeIndex;
      if (current >= bounds.totalMinutes) {
        setReplayPlaying(false);
      } else {
        setReplayTimeIndex(current + 1);
      }
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [replayPlaying, replaySpeed, bounds.totalMinutes, setReplayPlaying, setReplayTimeIndex]);

  const handleTogglePlay = () => {
    if (replayPlaying) {
      setReplayPlaying(false);
      return;
    }
    if (replayTimeIndex >= bounds.totalMinutes) {
      setReplayTimeIndex(0);
    }
    setReplayPlaying(true);
  };

  const handleResetReplay = () => {
    setReplayPlaying(false);
    setReplayTimeIndex(0);
  };

  const handleSwitchPlan = (optimized: boolean) => {
    if (optimized && !optimizedResult) return;
    setReplayPlaying(false);
    setReplayTimeIndex(0);
    setViewingOptimized(optimized);
  };

  const handlePolicySlider = (val: number) => {
    const viability = Number((5.2 - (val / 20) * 4.5).toFixed(1));
    setWeights({ served: val, viability });
  };

  const submitWhatIf = async (prompt: string) => {
    if (!prompt.trim()) return;
    setWhatIfError(null);
    try {
      const explanation = await executeWhatIf(prompt);
      setWhatIfResponse(explanation);
      setReplayPlaying(false);
      setReplayTimeIndex(0);
    } catch (err: any) {
      setWhatIfError(err?.message || 'Failed to process what-if scenario');
    }
  };

  const handleWhatIfForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitWhatIf(whatIfText);
  };

  const currentMinute = bounds.minMinute + Math.min(replayTimeIndex, bounds.totalMinutes);

  const navTabs: { id: OwnerTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Live Simulation & Map', icon: Activity },
    { id: 'optimizer', label: 'Route Optimizer & What-If', icon: Sliders },
    { id: 'demand', label: 'Demand Intelligence', icon: Activity },
    { id: 'routes', label: 'Routes & Stops', icon: Navigation },
    { id: 'fleet', label: 'Fleet & Constraints', icon: BusIcon },
    { id: 'financial', label: 'Financial Insights', icon: DollarSign }
  ];

  const filteredStops = (network?.stops || []).filter(
    (s) =>
      s.name.toLowerCase().includes(stopSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(stopSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar: Scenarios & Primary Actions */}
      <div className="bg-white p-4 rounded-yg-card shadow-yg-card border border-yg-border flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <ScenarioBar />

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Baseline vs Optimized Toggle */}
          <div className="flex items-center bg-yg-surfaceSubtle p-1 rounded-yg-btn border border-yg-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleSwitchPlan(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                !viewingOptimized
                  ? 'bg-white text-yg-secondary shadow-xs'
                  : 'text-yg-textSecondary hover:text-yg-secondary'
              }`}
            >
              Baseline
            </button>
            <button
              type="button"
              disabled={!optimizedResult}
              title={!optimizedResult ? 'Run optimization first' : 'View optimized schedule'}
              onClick={() => handleSwitchPlan(true)}
              className={`px-3 py-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                viewingOptimized && optimizedResult
                  ? 'bg-yg-primary text-white shadow-xs'
                  : 'text-yg-textSecondary hover:text-yg-secondary'
              }`}
            >
              Optimized Plan
            </button>
          </div>

          {/* Optimize Schedule Button */}
          <button
            type="button"
            onClick={() => runOptimization()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-yg-primary hover:bg-yg-primaryHover text-white px-4 py-2 rounded-yg-btn text-sm font-semibold transition-colors disabled:opacity-50 shadow-xs"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-white" />
            )}
            {isLoading ? 'Running Engine...' : 'Optimize Schedule'}
          </button>
        </div>
      </div>

      {/* Owner Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-yg-border scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeOwnerTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveOwnerTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-yg-btn text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-yg-primarySoft text-yg-primary border border-yg-primary/30'
                  : 'text-yg-textSecondary hover:text-yg-secondary hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & LIVE SIMULATION */}
      {(activeOwnerTab === 'overview' || activeOwnerTab === 'demand') && (
        <div className="space-y-6">
          {/* Metrics Panel */}
          <ImpactPanel />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <SimMap />

              {/* Replay Scrubbing Controls */}
              <div className="bg-white p-3.5 rounded-yg-card border border-yg-border shadow-yg-card flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    aria-label={replayPlaying ? 'Pause replay' : 'Play replay'}
                    className="p-2 rounded-yg-btn bg-yg-primary text-white hover:bg-yg-primaryHover transition-colors shadow-xs"
                  >
                    {replayPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetReplay}
                    aria-label="Reset replay"
                    className="p-2 rounded-yg-btn border border-yg-border text-yg-secondary hover:bg-yg-surfaceSubtle transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-yg-secondary ml-1 tabular-nums">
                    {formatMinuteHHMM(currentMinute)}
                  </span>
                  <span className="text-xs text-yg-textSecondary hidden sm:inline tabular-nums">
                    ({formatMinuteHHMM(bounds.minMinute)}–{formatMinuteHHMM(bounds.maxMinute)})
                  </span>
                </div>

                <input
                  type="range"
                  aria-label="Replay timeline scrubber"
                  min={0}
                  max={bounds.totalMinutes}
                  value={Math.min(replayTimeIndex, bounds.totalMinutes)}
                  onChange={(e) => {
                    setReplayPlaying(false);
                    setReplayTimeIndex(Number(e.target.value));
                  }}
                  className="flex-1 min-w-[140px] accent-yg-primary cursor-pointer"
                />

                <div className="flex items-center gap-1 text-xs font-semibold">
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setReplaySpeed(spd)}
                      className={`px-2.5 py-1 rounded-yg-btn transition-colors border ${
                        replaySpeed === spd
                          ? 'bg-yg-secondary text-white border-yg-secondary'
                          : 'bg-white text-yg-textSecondary border-yg-border hover:bg-yg-surfaceSubtle'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <DemandHeatmap />

              {/* Policy Trade-off Slider */}
              <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-yg-secondary text-sm">Policy: Access vs Cost</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-yg-primarySoft text-yg-primary">
                    {weights.served >= 14
                      ? 'Student-Access Priority'
                      : weights.served <= 7
                      ? 'Fuel/Cost Priority'
                      : 'Balanced Regional Model'}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-yg-secondary">Cost Viability</span>
                    <span className="text-yg-primary font-bold">Max Student Access</span>
                  </div>
                  <input
                    type="range"
                    aria-label="Access vs Cost policy slider"
                    min={1}
                    max={20}
                    value={weights.served}
                    onChange={(e) => handlePolicySlider(Number(e.target.value))}
                    className="w-full accent-yg-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-yg-textSecondary tabular-nums">
                    <span>Access weight: {weights.served}</span>
                    <span>Cost viability weight: {weights.viability}</span>
                  </div>
                  <p className="text-xs text-yg-textSecondary leading-relaxed">
                    Prioritizes serving remote villages at high-cost stops vs clustering runs for fuel efficiency.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTE OPTIMIZER & WHAT-IF */}
      {activeOwnerTab === 'optimizer' && (
        <div className="space-y-6">
          <ImpactPanel />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Optimizer Schedule Diff & Application */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-yg-border">
                  <div>
                    <h3 className="font-semibold text-yg-secondary text-base">
                      Schedule Reallocations (Optimizer Diff)
                    </h3>
                    <p className="text-xs text-yg-textSecondary mt-0.5">
                      Algorithmic shifts in bus departure times to reduce overcrowding and stranded students.
                    </p>
                  </div>

                  {optimizedSchedule && (
                    <button
                      type="button"
                      onClick={() => applyOptimizedSchedule()}
                      disabled={scheduleApplied}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-yg-btn text-xs font-bold transition-all ${
                        scheduleApplied
                          ? 'bg-yg-primarySoft text-yg-primary border border-yg-primary/30 cursor-default'
                          : 'bg-yg-primary hover:bg-yg-primaryHover text-white shadow-xs'
                      }`}
                    >
                      {scheduleApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Plan Applied to Baseline
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Apply Recommended Schedule
                        </>
                      )}
                    </button>
                  )}
                </div>

                {scheduleDiff && scheduleDiff.length > 0 ? (
                  <div className="space-y-3">
                    {scheduleDiff.map((d) => (
                      <div
                        key={d.busId}
                        className="p-3.5 bg-yg-surfaceSubtle rounded-xl border border-yg-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-yg-secondary px-2.5 py-1 bg-white border border-yg-border rounded-md text-xs shadow-xs">
                            {d.busId}
                          </span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-yg-textSecondary line-through font-mono">
                              {d.oldDepartures.join(', ')}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-yg-primary shrink-0" />
                            <span className="font-bold text-yg-primary font-mono bg-white px-2 py-0.5 rounded border border-yg-border">
                              {d.newDepartures.join(', ')}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-yg-textSecondary sm:text-right max-w-sm">
                          {d.changeDescription}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-yg-textSecondary text-xs">
                    No active schedule diff. Click <strong>Optimize Schedule</strong> to generate proposed shifts.
                  </div>
                )}
              </div>

              {/* Map replay for optimizer */}
              <SimMap />
            </div>

            {/* What-If Panel */}
            <div className="space-y-6">
              <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yg-accent" />
                  <h3 className="font-semibold text-yg-secondary text-sm">
                    Natural Language What-If
                  </h3>
                </div>
                <p className="text-xs text-yg-textSecondary mb-3 leading-relaxed">
                  Test hypothetical schedule shifts or capacity adjustments in plain English.
                </p>

                {/* Quick Presets */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-yg-textSecondary">
                    Suggested Scenarios:
                  </div>
                  {WHAT_IF_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setWhatIfText(preset);
                        submitWhatIf(preset);
                      }}
                      className="w-full text-left text-xs p-2 rounded-lg bg-yg-surfaceSubtle hover:bg-yg-primarySoft text-yg-secondary transition-colors border border-yg-border disabled:opacity-50"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleWhatIfForm} className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Move Bus B3 to 07:45 AM..."
                      value={whatIfText}
                      onChange={(e) => setWhatIfText(e.target.value)}
                      className="w-full text-xs px-3 py-2 pr-9 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary bg-white text-yg-secondary"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !whatIfText.trim()}
                      className="absolute right-1.5 top-1.5 p-1 bg-yg-primary hover:bg-yg-primaryHover text-white rounded-md disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>

                {whatIfError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 text-yg-danger rounded-lg text-xs">
                    {whatIfError}
                  </div>
                )}

                {whatIfResponse && (
                  <div className="mt-3 p-3 bg-yg-primarySoft/60 border border-yg-primary/30 rounded-lg text-xs text-yg-secondary leading-relaxed space-y-1">
                    <div className="font-bold text-yg-primary flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Outcome Evaluated
                    </div>
                    <p>{whatIfResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROUTES & STOPS DIRECTORY */}
      {activeOwnerTab === 'routes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SimMap />
          </div>

          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-yg-secondary text-base">Regional Stops Directory</h3>
              <span className="text-xs text-yg-textSecondary">
                {network?.stops.length || 0} designated stops
              </span>
            </div>

            <input
              type="text"
              placeholder="Search stop by name or ID (e.g. Gurupura, S3, Kadri)..."
              value={stopSearch}
              onChange={(e) => setStopSearch(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-yg-border rounded-yg-btn focus:outline-none focus:ring-2 focus:ring-yg-primary"
            />

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredStops.map((stop) => {
                const isSelected = selectedStopId === stop.id;
                const homeCount = (students || []).filter((s) => s.homeStopId === stop.id).length;
                return (
                  <div
                    key={stop.id}
                    onClick={() => setSelectedStopId(stop.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-yg-primarySoft border-yg-primary/40 shadow-xs'
                        : 'bg-yg-surfaceSubtle border-yg-border hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-yg-secondary text-sm">{stop.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-yg-border text-yg-textSecondary">
                          {stop.id}
                        </span>
                      </div>
                      <div className="text-yg-textSecondary text-[11px] mt-0.5">
                        {stop.id === 'S6' ? 'Polali High School Terminal' : `${homeCount} registered student homes`}
                      </div>
                    </div>
                    <span className="text-yg-primary font-bold text-xs">
                      {isSelected ? 'Viewing' : 'Select'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLEET & CONSTRAINTS */}
      {activeOwnerTab === 'fleet' && (
        <div className="space-y-6">
          <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
            <h3 className="font-semibold text-yg-secondary text-base mb-1">
              Active Bus Fleet &amp; Operating Constraints
            </h3>
            <p className="text-xs text-yg-textSecondary mb-4">
              Physical fleet limitations, driver working-hour caps, and route permissions.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-yg-surfaceSubtle border-b border-yg-border text-yg-textSecondary font-semibold">
                    <th className="p-3">Bus ID</th>
                    <th className="p-3">Assigned Route</th>
                    <th className="p-3">Seating Capacity</th>
                    <th className="p-3">Scheduled Departures</th>
                    <th className="p-3">Operating Cost / km</th>
                    <th className="p-3">Max Driver Hours</th>
                    <th className="p-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yg-border">
                  {(network?.buses || []).map((bus) => (
                    <tr key={bus.id} className="hover:bg-yg-surfaceSubtle/50 transition-colors">
                      <td className="p-3 font-bold text-yg-secondary">{bus.id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-yg-secondarySoft text-yg-secondary font-semibold">
                          {bus.routeId}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-yg-secondary">{bus.capacity} seats</td>
                      <td className="p-3 font-mono font-medium text-yg-primary">
                        {bus.departureTimes.join(', ')}
                      </td>
                      <td className="p-3 font-medium text-yg-secondary">₹{bus.costPerKm} / km</td>
                      <td className="p-3 text-yg-textSecondary">{bus.maxDriverHours} hours</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yg-success bg-yg-primarySoft px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Within Hours
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FINANCIAL INSIGHTS */}
      {activeOwnerTab === 'financial' && (
        <div className="space-y-6">
          <ImpactPanel />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5 space-y-2">
              <div className="text-xs text-yg-textSecondary font-semibold">Cost Per Student Served</div>
              <div className="text-2xl font-bold text-yg-secondary tabular-nums">
                ₹{((activeResult?.metrics.cost ?? 0) / Math.max(1, activeResult?.metrics.servedOnTime ?? 1)).toFixed(1)}
              </div>
              <p className="text-[11px] text-yg-textSecondary">
                Normalized trip expenditure per reached student at terminal schools.
              </p>
            </div>

            <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5 space-y-2">
              <div className="text-xs text-yg-textSecondary font-semibold">Estimated Daily Revenue</div>
              <div className="text-2xl font-bold text-yg-primary tabular-nums">
                ₹{activeResult?.metrics.revenue ?? 0}
              </div>
              <p className="text-[11px] text-yg-textSecondary">
                Calculated at nominal fare of ₹{network?.economics?.averageFare ?? 25} per completed student journey.
              </p>
            </div>

            <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5 space-y-2">
              <div className="text-xs text-yg-textSecondary font-semibold">Viability Gap Assessment</div>
              <div className="text-2xl font-bold text-yg-warning tabular-nums">
                ₹{activeResult?.metrics.viabilityGap ?? 0}
              </div>
              <p className="text-[11px] text-yg-textSecondary">
                Deficit requiring educational voucher subsidy or peak-rush schedule consolidation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RECENT STUDENT REPORTS & ALERTS SECTION */}
      <div className="bg-white rounded-yg-card shadow-yg-card border border-yg-border p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-yg-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yg-warning" />
            <h3 className="font-semibold text-yg-secondary text-sm">
              Live Student Commute Reports &amp; Feedback
            </h3>
          </div>
          <span className="text-[11px] text-yg-textSecondary font-medium">
            {reportedIssues.length} student-reported notices
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reportedIssues.map((rep) => (
            <div
              key={rep.id}
              className="p-3 rounded-xl bg-yg-surfaceSubtle border border-yg-border flex items-start justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-yg-secondary">{rep.studentName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-yg-border font-mono text-yg-textSecondary">
                    Stop {rep.stopId}
                  </span>
                  <span className="text-yg-textSecondary text-[10px]">{rep.timestamp}</span>
                </div>
                <p className="text-yg-textSecondary mt-1">{rep.note}</p>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  rep.status === 'acknowledged'
                    ? 'bg-yg-primarySoft text-yg-primary border border-yg-primary/30'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {rep.status === 'acknowledged' ? 'Acknowledged' : 'Unverified'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
