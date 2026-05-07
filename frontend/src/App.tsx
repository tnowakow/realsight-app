import { useState, useEffect } from 'react';
import { useRealSightStore } from './store/useRealSightStore';
import { PortfolioPropertySelector } from './components/PortfolioPropertySelector';
import { TenantFinancialsTable } from './components/TenantFinancialsTable';
import { RealEstateKPICards } from './components/RealEstateKPICards';
import { OverviewTab } from './components/tabs/OverviewTab';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'tenant-financials'>('overview');
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
          </div>
          
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tenant-financials')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'tenant-financials' 
                  ? 'text-emerald-400 border-b-2 border-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Tenant Financials
            </button>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' ? (
          <>
            <RealEstateKPICards />
            <OverviewTab />
          </>
        ) : (
          <TenantFinancialsTable />
        )}
      </main>
    </div>
  );
}

export default App;
