import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useRealSightStore } from './store/useRealSightStore';
import { PortfolioPropertySelector } from './components/PortfolioPropertySelector';
import { TenantFinancialsTable } from './components/TenantFinancialsTable';

function App() {
  const fetchPortfolios = useRealSightStore((state) => state.fetchPortfolios);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-300">
        <header className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">RealSight</h1>
            <PortfolioPropertySelector />
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/" className="text-sm font-medium hover:text-white">Overview</Link>
            <Link to="/tenant-financials" className="text-sm font-medium hover:text-white">Tenant Financials</Link>
          </nav>
        </header>
        
        <main className="p-8">
          <Routes>
            <Route path="/" element={
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                <p>Select a portfolio and property to see the data.</p>
              </div>
            } />
            <Route path="/tenant-financials" element={<TenantFinancialsTable />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
