import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { OwnerView } from './views/OwnerView';
import { StudentView } from './views/StudentView';
import { Bus, GraduationCap, LayoutDashboard, Wifi, WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const {
    role,
    setRole,
    initialize,
    error,
    isMockMode,
    toggleMockMode,
    isLoading
  } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base leading-tight">
                  Routeless
                </h1>
                <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded border border-slate-200">
                  The Last Mile
                </span>

                {/* Interactive Mock Mode / Live Toggle Pill */}
                <button
                  onClick={() => toggleMockMode()}
                  title={isMockMode ? 'Using fixture mock data. Click to connect to live API.' : 'Connected to live Express API. Click to switch to mock data.'}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors border ${
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
              <p className="text-xs text-slate-500 hidden sm:block">
                Rural Student Bus Network Simulation &amp; Schedule Optimizer
              </p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="text-xs text-slate-400 animate-pulse hidden md:inline">
                Synchronizing...
              </span>
            )}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setRole('owner')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === 'owner'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Operator View
              </button>
              <button
                onClick={() => setRole('student')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  role === 'student'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Student View
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Notice:</span>
              <span>{error}</span>
            </div>
            <button
              onClick={() => initialize()}
              className="text-xs underline font-semibold text-rose-700 hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {role === 'owner' ? <OwnerView /> : <StudentView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Routeless: The Last Mile &bull; Deterministic engine with seeded RNG &amp; typed contracts
      </footer>
    </div>
  );
};

export default App;
