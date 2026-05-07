import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useRealSightStore } from './store/useRealSightStore';
import { TenantFinancialsTable } from './components/TenantFinancialsTable';

function App() {
  const fetchPortfolios = useRealSightStore((state) => state.fetchPortfolios);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <header>
          <h1>RealSight</h1>
        </header>
        <main>
          <Routes>
            <Route path="/tenant-financials" element={<TenantFinancialsTable />} />
            <Route path="/" element={<div>Overview</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
