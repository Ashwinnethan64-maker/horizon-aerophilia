import React, { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import { OwnerView } from './views/OwnerView';
import { StudentView } from './views/StudentView';
import {
  GraduationCap,
  LayoutDashboard,
  Info,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

export const App: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    initialize,
    error,
    activeScenarioId,
    isMockMode,
    toggleMockMode,
    isLoading
  } = useStore();
  const [showTransparencyNotice, setShowTransparencyNotice] = useState(true);
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-[#F6F8F7] flex flex-col font-sans text-[#172B25] antialiased">
      {/* Top Notice Banner: Operational Honesty & Transparency */}
      {showTransparencyNotice && (
        <aside
          aria-label="Operational Transparency Notice"
          className="bg-yg-secondary text-white text-[11px] py-1.5 px-4 border-b border-[#2C4863] flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-yg-accent shrink-0" />
            <span className="truncate">
              <strong>Data Transparency Notice:</strong> All vehicle replays and capacity metrics reflect deterministic timetable simulations. No real-time GPS telemetry is implied.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowTransparencyNotice(false)}
            aria-label="Dismiss notice"
            className="text-slate-300 hover:text-white p-0.5 rounded transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-yg-border sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-16 py-2 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yg-primary flex items-center justify-center text-white shadow-xs shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5" cy="18" r="3" />
                <circle cx="19" cy="6" r="3" />
                <path d="M7.5 16.5L16.5 7.5" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-yg-secondary text-lg sm:text-xl tracking-tight leading-none">
                  YatraGrid
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yg-primarySoft text-yg-primary border border-yg-primary/20 hidden sm:inline-block">
                  Student Mobility
                </span>

                {/* Interactive Mock Mode / Live API Toggle Pill */}
                <button
                  type="button"
                  onClick={() => toggleMockMode()}
                  title={
                    isMockMode
                      ? 'Using local fixture mock data. Click to connect to live Express API.'
                      : 'Connected to live Express API. Click to switch to local mock fixtures.'
                  }
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider transition-colors border cursor-pointer ${
                    isMockMode
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {isMockMode ? (
                    <>
                      <WifiOff className="w-3 h-3 text-amber-600" />
                      Mock Mode
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3 h-3 text-emerald-600" />
                      Live API
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-yg-textSecondary hidden md:block">
                Connecting student demand with practical bus operations and schedule optimization
              </p>
            </div>
          </div>

          {/* Right Header Controls: Sync state + Language + About + Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoading && (
              <span className="text-[11px] font-medium text-yg-textSecondary animate-pulse hidden lg:inline">
                Synchronizing...
              </span>
            )}

            {/* Language Selector */}
            <div className="flex items-center bg-yg-surfaceSubtle rounded-lg p-0.5 border border-yg-border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'en'
                    ? 'bg-white text-yg-secondary shadow-xs'
                    : 'text-yg-textSecondary hover:text-yg-secondary'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 rounded transition-colors ${
                  language === 'kn'
                    ? 'bg-white text-yg-secondary shadow-xs'
                    : 'text-yg-textSecondary hover:text-yg-secondary'
                }`}
              >
                ಕನ್ನಡ
              </button>
            </div>

            {/* About / Guide Button */}
            <button
              type="button"
              onClick={() => setShowAboutModal(true)}
              className="p-1.5 rounded-lg border border-yg-border text-yg-textSecondary hover:text-yg-secondary hover:bg-yg-surfaceSubtle hidden sm:flex items-center justify-center"
              title="About YatraGrid & Architecture"
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Role Switcher */}
            <div className="flex items-center bg-yg-surfaceSubtle p-1 rounded-yg-btn border border-yg-border">
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'owner'
                    ? 'bg-yg-secondary text-white shadow-xs'
                    : 'text-yg-textSecondary hover:text-yg-secondary'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Operator</span> Portal
              </button>
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  role === 'student'
                    ? 'bg-yg-primary text-white shadow-xs'
                    : 'text-yg-textSecondary hover:text-yg-secondary'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Student</span> Companion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-yg-danger text-xs sm:text-sm rounded-yg-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold">Notice:</span>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => initialize()}
              className="text-xs font-bold underline text-yg-danger hover:text-red-900 shrink-0 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {role === 'owner' ? <OwnerView /> : <StudentView />}
      </main>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-[#0E1D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-yg-card shadow-yg-popover max-w-lg w-full p-6 border border-yg-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-yg-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-yg-primary text-white flex items-center justify-center font-bold text-xs">
                  YG
                </div>
                <h3 className="font-bold text-yg-secondary text-base">
                  About YatraGrid Platform
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="text-yg-textSecondary hover:text-yg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-yg-textSecondary space-y-3 leading-relaxed">
              <p>
                <strong>YatraGrid</strong> connects rural student commuting demand with practical bus operations and schedule optimization.
              </p>
              <div className="p-3 bg-yg-surfaceSubtle rounded-xl border border-yg-border space-y-2">
                <div className="font-semibold text-yg-secondary">Core Principles:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Deterministic Simulation:</strong> Seeded engine runs reproducible timetable evaluations.</li>
                  <li><strong>Transparent Viability:</strong> Displays operating costs, revenue, and viability gap clearly.</li>
                  <li><strong>Shared System:</strong> Student registrations directly feed the optimizer without artificial data splits.</li>
                </ul>
              </div>
              <p className="text-[11px]">
                Built according to the <strong>YatraGrid Design System</strong> specification with responsive components, accessible contrast, and multi-device usability.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="px-4 py-2 bg-yg-secondary text-white rounded-yg-btn text-xs font-semibold hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-yg-border py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-yg-textSecondary">
          <div className="flex items-center gap-2">
            <strong className="text-yg-secondary">YatraGrid</strong> &bull; Intelligent Student Mobility Platform
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>
              Active Scenario: <strong className="text-yg-secondary capitalize">{activeScenarioId.replace(/_/g, ' ')}</strong>
            </span>
            <span>&bull;</span>
            <span>Deterministic TS Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
