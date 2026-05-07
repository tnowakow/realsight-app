import { useState, useEffect } from 'react';
import { useRealSightStore } from '../../store/useRealSightStore';
import { AlertCard } from '../ui/AlertCard';
import { BenchmarkIndicator } from '../ui/BenchmarkIndicator';
import { formatCurrency, formatPercent } from '../../utils/formatting';

export const OverviewTab = () => {
  const selectedPortfolioId = useRealSightStore((state) => state.selectedPortfolioId);
  const selectedPropertyId = useRealSightStore((state) => state.selectedPropertyId);
  const properties = useRealSightStore((state) => state.properties);
  const tenants = useRealSightStore((state) => state.tenants);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedPortfolioId || !selectedPropertyId) return;
    
    setIsLoading(true);
    // Simulate data fetch delay
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedPortfolioId, selectedPropertyId]);

  // Calculate portfolio KPIs from tenant/payment data
  const calculateKPIs = () => {
    if (!tenants.length) return null;
    
    let totalRentDue = 0;
    let totalPaid = 0;
    let totalDaysPastDue = 0;
    let problemTenants = [];
    
    tenants.forEach(tenant => {
      const lease = tenant.lease;
      if (lease) {
        totalRentDue += lease.monthly_rent || 0;
        const payment = tenant.currentPayment || {};
        totalPaid += payment.amount_paid || 0;
        totalDaysPastDue += payment.days_past_due || 0;
        
        // Identify problem tenants (>15 days past due or partial/defaulted)
        if ((payment.days_past_due || 0) > 15 || 
            ['partial', 'delinquent', 'defaulted'].includes(payment.payment_status)) {
          problemTenants.push({
            tenant,
            payment,
            severity: payment.payment_status === 'defaulted' ? 'critical' : 
                     (payment.days_past_due || 0) > 45 ? 'high' : 'medium'
          });
        }
      }
    });
    
    const avgDaysPastDue = tenants.length ? Math.round(totalDaysPastDue / tenants.length) : 0;
    const collectionRate = totalRentDue > 0 ? (totalPaid / totalRentDue) * 100 : 0;
    const outstandingDebt = totalRentDue - totalPaid;
    
    // Portfolio health score (0-100) based on key metrics
    let healthScore = 100;
    if (collectionRate < 95) healthScore -= 20;
    if (avgDaysPastDue > 10) healthScore -= 15;
    if (problemTenants.length > 3) healthScore -= 25;
    if (outstandingDebt > 20000) healthScore -= 20;
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      collectionRate: parseFloat(collectionRate.toFixed(1)),
      avgDaysPastDue,
      outstandingDebt,
      problemTenantsCount: problemTenants.length,
      totalRentDue,
      tenantCount: tenants.length,
      propertyCount: properties.length,
      healthScore,
      problemTenants
    };
  };

  const kpiData = calculateKPIs();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">No data available. Select a portfolio and property.</div>
        </div>
      </div>
    );
  }

  // Determine health verdict
  const getHealthVerdict = (score: number) => {
    if (score >= 80) return { text: 'HEALTHY', color: 'text-emerald-400' };
    if (score >= 60) return { text: 'FAIR', color: 'text-yellow-400' };
    if (score >= 40) return { text: 'POOR', color: 'text-orange-400' };
    return { text: 'CRITICAL', color: 'text-red-400' };
  };

  const healthVerdict = getHealthVerdict(kpiData.healthScore);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Active Alerts Panel */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Alerts</h2>
        <div className="flex flex-col gap-3">
          {kpiData.problemTenants.length > 0 ? (
            kpiData.problemTenants.map((item, idx) => (
              <AlertCard 
                key={idx}
                type={item.severity === 'critical' ? 'error' : item.severity === 'high' ? 'warning' : 'info'}
                headline={`${item.tenant.business_name} — ${item.payment.payment_status.toUpperCase()}`}
                subtext={`Days Past Due: ${item.payment.days_past_due} | Amount Owed: ${formatCurrency(item.payment.amount_due - (item.payment.amount_paid || 0))}`}
              />
            ))
          ) : (
            <div className="text-slate-500 text-sm">No active alerts — all tenants current on payments</div>
          )}
        </div>
      </section>

      {/* 2. Portfolio Health Score */}
      <section className="bg-slate-900/50 rounded-lg p-6 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Health Score</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-bold text-white">{kpiData.healthScore}</span>
              <span className={`text-xl font-semibold ${healthVerdict.color}`}>{healthVerdict.text}</span>
            </div>
            <p className="text-slate-500 mt-2">Based on collection rate, days past due, and problem tenant count</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Performance Grade</div>
            <div className={`text-3xl font-bold ${healthVerdict.color}`}>
              {kpiData.healthScore >= 80 ? 'A' : kpiData.healthScore >= 60 ? 'B' : kpiData.healthScore >= 40 ? 'C' : 'D'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. KPI Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rent Collection Rate */}
          <BenchmarkIndicator 
            label="Rent Collection Rate"
            value={kpiData.collectionRate}
            unit="%"
            target={95}
            trend={kpiData.collectionRate >= 95 ? 'up' : 'down'}
            description="Percentage of rent collected vs. due"
          />
          
          {/* Average Days Past Due */}
          <BenchmarkIndicator 
            label="Avg Days Past Due"
            value={kpiData.avgDaysPastDue}
            unit="days"
            target={10}
            inverse={true}
            trend={kpiData.avgDaysPastDue <= 10 ? 'up' : 'down'}
            description="Average delinquency across all tenants"
          />
          
          {/* Total Outstanding */}
          <BenchmarkIndicator 
            label="Total Outstanding"
            value={kpiData.outstandingDebt}
            unit="$"
            isCurrency={true}
            target={15000}
            inverse={true}
            trend={kpiData.outstandingDebt <= 15000 ? 'up' : 'down'}
            description="Unpaid rent across portfolio"
          />
          
          {/* Problem Tenants */}
          <BenchmarkIndicator 
            label="Problem Tenants"
            value={kpiData.problemTenantsCount}
            unit="tenants"
            target={2}
            inverse={true}
            trend={kpiData.problemTenantsCount <= 2 ? 'up' : 'down'}
            description="Tenants >15 days past due or defaulted"
          />
        </div>
      </section>

      {/* 4. Quick Stats */}
      <section className="bg-slate-900/30 rounded-lg p-6 border border-slate-800">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-2xl font-bold text-white">{kpiData.propertyCount}</div>
            <div className="text-sm text-slate-500">Properties</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{kpiData.tenantCount}</div>
            <div className="text-sm text-slate-500">Active Tenants</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(kpiData.totalRentDue)}</div>
            <div className="text-sm text-slate-500">Monthly Rent Due</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{formatPercent(kpiData.collectionRate)}</div>
            <div className="text-sm text-slate-500">Collection Rate</div>
          </div>
        </div>
      </section>

      {/* 5. Portfolio Summary */}
      {properties.length > 1 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Properties in Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {properties.map(property => (
              <div key={property.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="font-semibold text-white">{property.name}</div>
                <div className="text-sm text-slate-500 mt-1">
                  {property.property_type} • {property.total_square_feet?.toLocaleString()} sqft
                </div>
                <div className="text-xs text-slate-600 mt-2">
                  {property.city}, {property.state}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default OverviewTab;
