import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, City, Target } from 'lucide-react';
import { useRealSightStore } from './store/useRealSightStore';
import { PortfolioPropertySelector } from './components/PortfolioPropertySelector';
import { TenantFinancialsTable } from './components/TenantFinancialsTable';
import { OverviewTab } from './components/tabs/OverviewTab';
import { PortfolioPerformanceTab } from './components/tabs/PortfolioPerformanceTab';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenant-financials' | 'portfolio-performance' | 'acquisition'>('overview');
  const fetchPortfolios = useRealSightStore((state) => state.fetchPortfolios);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-emerald-400">RealSight</h1>
              <PortfolioPropertySelector />
            </div>
            <div className="text-xs text-slate-500">
              Data current as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'overview' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('tenant-financials')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tenant-financials' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" /> Tenant Financials
            </button>
            <button
              onClick={() => setActiveTab('portfolio-performance')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'portfolio-performance' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <City className="w-4 h-4" /> Portfolio Performance
            </button>
            <button
              onClick={() => setActiveTab('acquisition')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'acquisition' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" /> Acquisition Targets
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && (
          <OverviewTab />
        )}
        
        {activeTab === 'tenant-financials' && (
          <TenantFinancialsTable />
        )}
        
        {activeTab === 'portfolio-performance' && <PortfolioPerformanceTab />}
        
        {activeTab === 'acquisition' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Acquisition Targets</h2>
            <div className="bg-slate-900/50 rounded-lg p-8 border border-slate-800 text-center">
              <p className="text-slate-400">Acquisition target identification coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
