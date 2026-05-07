import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useRealSightStore, type DateFilter } from './store/useRealSightStore';
import { PortfolioPropertySelector } from './components/PortfolioPropertySelector';
import { TenantFinancialsTable } from './components/TenantFinancialsTable';
import { RealEstateKPICards } from './components/RealEstateKPICards';
import { 
  Home, Building2, DollarSign, TrendingUp, ChevronDown, Calendar, HelpCircle, 
  Menu, X, AlertTriangle, CheckCircle2, ArrowRight
} from 'lucide-react';

// Global Header Component
const GlobalHeader = () => {
  const { dateFilter, setDateFilter } = useRealSightStore();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  const dateOptions: { value: DateFilter; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'this-quarter', label: 'This Quarter' },
    { value: 'ytd', label: 'Year to Date' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const navItems = [
    { path: '/', label: 'Overview', icon: Home },
    { path: '/tenant-financials', label: 'Tenant Financials', icon: DollarSign },
    { path: '/portfolio-performance', label: 'Portfolio Performance', icon: Building2 },
    { path: '/acquisition', label: 'Acquisition Targets', icon: TrendingUp },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full max-w-[1920px] mx-auto px-4 flex items-center justify-between">
          {/* Left: Logo + Portfolio Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="w-6 h-6 text-blue-500" />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">RealSight</span>
            </Link>
            
            {/* Portfolio & Property Selector */}
            <PortfolioPropertySelector />
          </div>

          {/* Center: Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Date Filter + Data Current + Profile */}
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <div className="relative">
              <button
                onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <Calendar className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-slate-300">{dateOptions.find(d => d.value === dateFilter)?.label}</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
              {dateDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDateDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                    {dateOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setDateFilter(option.value);
                          setDateDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          dateFilter === option.value
                            ? 'bg-emerald-600/20 text-emerald-400'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Data Current Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">Data current as of {new Date().toLocaleTimeString()}</span>
            </div>

            {/* Profile + Help */}
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white" title="Help & Support">
                <HelpCircle className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
                TN
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">RealSight</span>
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 py-4">
            {/* Portfolio selector on mobile */}
            <div className="px-4 pb-3 border-b border-slate-800 mb-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Selected Portfolio</p>
              <PortfolioPropertySelector />
            </div>
            <nav className="flex flex-col gap-2 px-4">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

// ============================================================================
// OVERVIEW TAB - RealSight Dashboard
// ============================================================================

const OverviewTab = () => {
  const selectedPropertyId = useRealSightStore((state) => state.selectedPropertyId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Portfolio Overview</h1>
        <p className="text-slate-400">Real-time insights into your commercial property portfolio performance</p>
      </div>

      {/* KPI Cards - Real Estate Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Key Performance Indicators
        </h2>
        <RealEstateKPICards />
      </section>

      {/* Priority Alerts Section */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Priority Alerts
        </h2>
        <div className="space-y-3">
          {/* Critical Alert */}
          <Link to="/tenant-financials" className="block p-4 rounded-xl border-2 border-red-500/30 bg-red-500/10 hover:border-red-500/50 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-red-500/20 text-red-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
                  Critical: Tenant Default Detected
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  Fitness First Gym (Riverside Retail Plaza) is 92 days past due on rent payments. 
                  Total outstanding: $6,200. Immediate action required.
                </p>
                <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                  View Tenant Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Warning Alert */}
          <Link to="/tenant-financials" className="block p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-orange-500/20 text-orange-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">
                  Warning: Delinquent Account Identified
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  Fashion Forward Boutique is 45 days past due. Total outstanding: $3,800. 
                  Consider sending formal notice.
                </p>
                <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                  View Tenant Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>

          {/* Info Alert */}
          <Link to="/tenant-financials" className="block p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50 transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                  Notice: Partial Payment Received
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  Quick Stop Grocery paid 50% of monthly rent ($2,750 of $5,500). 
                  Follow up on remaining balance.
                </p>
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  View Payment Details
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Properties', value: '4', icon: Building2 },
          { label: 'Active Tenants', value: '8', icon: CheckCircle2 },
          { label: 'Monthly Revenue', value: '$65K', icon: DollarSign },
          { label: 'Avg Occupancy', value: '94%', icon: TrendingUp },
          { label: 'Alerts Active', value: '3', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col items-center text-center">
            <stat.icon className="w-5 h-5 text-emerald-500 mb-2" />
            <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">{stat.label}</p>
            <p className="text-sm font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Portfolio Health Score Preview */}
      <section className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-xl text-white space-y-4 shadow-xl shadow-emerald-900/20">
        <h3 className="text-emerald-100 font-medium uppercase text-xs tracking-widest">Portfolio Health Score</h3>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black">78</span>
          <span className="text-xl text-emerald-100">/ 100</span>
        </div>
        <p className="text-emerald-100 text-sm">Good — Address tenant payment issues to improve score</p>
        <Link to="/portfolio-performance" className="inline-block text-sm bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-semibold backdrop-blur-md">
          View Detailed Analysis →
        </Link>
      </section>
    </div>
  );
};

// ============================================================================
// TENANT FINANCIALS TAB
// ============================================================================

const TenantFinancialsTab = () => {
  const selectedPropertyId = useRealSightStore((state) => state.selectedPropertyId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Tenant Financials</h1>
        <p className="text-slate-400">Track rent collection, identify problem tenants, and manage delinquent accounts</p>
      </div>

      {/* Tenant Financials Table Component */}
      <TenantFinancialsTable selectedPropertyId={selectedPropertyId} />
    </div>
  );
};

// ============================================================================
// PORTFOLIO PERFORMANCE TAB (Placeholder)
// ============================================================================

const PortfolioPerformanceTab = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Portfolio Performance</h1>
        <p className="text-slate-400">Deep dive into property-level metrics and portfolio analytics</p>
      </div>

      {/* Placeholder content */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
        <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Portfolio Analytics Coming Soon</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Property-level performance metrics, NOI analysis, and cap rate calculations will be available here.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// ACQUISITION TARGETS TAB (Placeholder)
// ============================================================================

const AcquisitionTargetsTab = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Acquisition Targets</h1>
        <p className="text-slate-400">AI-powered property scoring and acquisition recommendations</p>
      </div>

      {/* Placeholder content */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
        <TrendingUp className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Acquisition Scoring Engine</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Property valuation models and acquisition scoring algorithms will help identify the best investment opportunities.
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white">
        <GlobalHeader />
        
        <main className="max-w-[1920px] mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<OverviewTab />} />
            <Route path="/tenant-financials" element={<TenantFinancialsTab />} />
            <Route path="/portfolio-performance" element={<PortfolioPerformanceTab />} />
            <Route path="/acquisition" element={<AcquisitionTargetsTab />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 mt-12 py-6">
          <div className="max-w-[1920px] mx-auto px-4 text-center text-sm text-slate-500">
            <p>RealSight — Commercial Property Management Analytics Platform</p>
            <p className="mt-1">Built for Tom Nowakowski • FocusPath Consulting</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
