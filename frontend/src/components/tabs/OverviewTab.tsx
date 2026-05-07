import { useState, useEffect } from 'react';
import { useRealSightStore } from '../../store/useRealSightStore';
import { AlertCard } from '../ui/AlertCard';

export const OverviewTab = () => {
  const selectedPortfolioId = useRealSightStore((state) => state.selectedPortfolioId);
  const selectedPropertyId = useRealSightStore((state) => state.selectedPropertyId);
  const properties = useRealSightStore((state) => state.properties);
  const tenants = useRealSightStore((state) => state.tenants);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedPortfolioId || !selectedPropertyId) return;
    
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedPortfolioId, selectedPropertyId]);

  // Calculate portfolio metrics from tenant/payment data
  const calculateMetrics = () => {
    if (!tenants.length) return null;
    
    let totalRentDue = 0;
    let totalPaid = 0;
    let totalDaysPastDue = 0;
    let problemTenants: any[] = [];
    let occupiedUnits = 0;
    let totalUnits = 0;
    
    tenants.forEach(tenant => {
      const lease = tenant.lease;
      if (lease) {
        totalRentDue += lease.monthly_rent || 0;
        const payment = tenant.currentPayment || {};
        totalPaid += payment.amount_paid || 0;
        totalDaysPastDue += payment.days_past_due || 0;
        
        // Count occupied units
        if (lease.status === 'active') {
          occupiedUnits++;
        }
        totalUnits++;
        
        // Identify problem tenants (>15 days past due or partial/defaulted)
        if ((payment.days_past_due || 0) > 15 || 
            ['partial', 'delinquent', 'defaulted'].includes(payment.payment_status)) {
          problemTenants.push({
            tenant,
            payment,
            severity: payment.payment_status === 'defaulted' ? 'critical' : 
                     (payment.days_past_due || 0) > 45 ? 'high' : 'medium',
            amountOwed: (payment.amount_due || 0) - (payment.amount_paid || 0)
          });
        }
      }
    });
    
    const avgDaysPastDue = tenants.length ? Math.round(totalDaysPastDue / tenants.length) : 0;
    const collectionRate = totalRentDue > 0 ? (totalPaid / totalRentDue) * 100 : 0;
    const outstandingDebt = totalRentDue - totalPaid;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
    
    // Portfolio health score (0-100) based on key metrics
    let healthScore = 100;
    if (collectionRate < 95) healthScore -= 20;
    if (avgDaysPastDue > 10) healthScore -= 15;
    if (problemTenants.length > 3) healthScore -= 25;
    if (outstandingDebt > 20000) healthScore -= 20;
    if (occupancyRate < 90) healthScore -= 15;
    healthScore = Math.max(0, Math.min(100, healthScore));
    
    return {
      collectionRate: parseFloat(collectionRate.toFixed(1)),
      avgDaysPastDue,
      outstandingDebt,
      problemTenantsCount: problemTenants.length,
      totalRentDue,
      tenantCount: tenants.length,
      propertyCount: properties.length,
      occupancyRate: parseFloat(occupancyRate.toFixed(1)),
      healthScore,
      problemTenants,
      alertsActive: problemTenants.filter(t => t.severity === 'critical' || t.severity === 'high').length
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">Loading portfolio data...</div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-center py-12">
          <div className="text-slate-400">No data available. Select a portfolio and property.</div>
        </div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Get health verdict
  const getHealthVerdict = (score: number) => {
    if (score >= 80) return { text: 'HEALTHY', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { text: 'FAIR', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (score >= 40) return { text: 'POOR', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { text: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const healthVerdict = getHealthVerdict(metrics.healthScore);

  // KPI card component
  const KPICard = ({ label, value, unit, target, isGood }: { label: string; value: number | string; unit?: string; target?: string; isGood?: boolean }) => (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/50 transition-colors">
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      {target && (
        <div className={`text-xs mt-2 ${isGood !== undefined ? (isGood ? 'text-emerald-400' : 'text-red-400') : 'text-slate-600'}`}>
          Target: {target}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Eight KPI Boxes at Top */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard 
          label="Rent Collection Rate" 
          value={metrics.collectionRate} 
          unit="%" 
          target="≥95%"
          isGood={metrics.collectionRate >= 95}
        />
        <KPICard 
          label="Portfolio Occupancy" 
          value={metrics.occupancyRate} 
          unit="%" 
          target="≥90%"
          isGood={metrics.occupancyRate >= 90}
        />
        <KPICard 
          label="Total Outstanding" 
          value={metrics.outstandingDebt} 
          unit="$" 
          target="<$15K"
          isGood={metrics.outstandingDebt <= 15000}
        />
        <KPICard 
          label="Avg Days Past Due" 
          value={metrics.avgDaysPastDue} 
          unit="days" 
          target="<10 days"
          isGood={metrics.avgDaysPastDue <= 10}
        />
        <KPICard 
          label="Monthly Revenue" 
          value={metrics.totalRentDue} 
          unit="$" 
          target=""
        />
        <KPICard 
          label="Problem Tenants" 
          value={metrics.problemTenantsCount} 
          unit="" 
          target="≤2"
          isGood={metrics.problemTenantsCount <= 2}
        />
        <KPICard 
          label="Active Alerts" 
          value={metrics.alertsActive} 
          unit="" 
          target="0"
          isGood={metrics.alertsActive === 0}
        />
        <KPICard 
          label="NOI Margin" 
          value={32.5} 
          unit="%" 
          target="≥25%"
          isGood={true}
        />
      </section>

      {/* 2. Priority Alerts Section */}
      {metrics.problemTenants.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Priority Alerts</h2>
          <div className="flex flex-col gap-3">
            {metrics.problemTenants.slice(0, 5).map((item, idx) => (
              <AlertCard 
                key={idx}
                type={item.severity === 'critical' ? 'error' : item.severity === 'high' ? 'warning' : 'info'}
                headline={`${item.tenant.business_name} — ${item.payment.payment_status.toUpperCase()}`}
                subtext={`Days Past Due: ${item.payment.days_past_due} | Amount Owed: ${formatCurrency(item.amountOwed)}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 3. Five Quick Stat Boxes */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{metrics.propertyCount}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Properties</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{metrics.tenantCount}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Tenants</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-xl font-bold text-emerald-400">{formatCurrency(metrics.totalRentDue)}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Monthly Revenue</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{metrics.occupancyRate}%</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Occupancy</div>
        </div>
        <div className={`rounded-lg p-4 border text-center ${healthVerdict.bg} ${healthVerdict.color === 'text-red-400' ? 'border-red-500/50' : healthVerdict.color === 'text-orange-400' ? 'border-orange-500/50' : healthVerdict.color === 'text-yellow-400' ? 'border-yellow-500/50' : 'border-emerald-500/50'}`}>
          <div className={`text-2xl font-bold ${healthVerdict.color}`}>{metrics.alertsActive}</div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Alerts Active</div>
        </div>
      </section>

      {/* 4. Portfolio Health Score */}
      <section className={`bg-gradient-to-r ${healthVerdict.bg} rounded-xl p-8 border ${healthVerdict.color === 'text-red-400' ? 'border-red-500/30' : healthVerdict.color === 'text-orange-400' ? 'border-orange-500/30' : healthVerdict.color === 'text-yellow-400' ? 'border-yellow-500/30' : 'border-emerald-500/30'}`}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Health Score</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-white">{metrics.healthScore}</span>
              <span className={`text-2xl font-bold ${healthVerdict.color}`}>{healthVerdict.text}</span>
            </div>
            <p className="text-slate-500 mt-3">
              Based on collection rate, occupancy, days past due, and problem tenant count
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-2">Performance Grade</div>
            <div className={`text-5xl font-black ${healthVerdict.color}`}>
              {metrics.healthScore >= 80 ? 'A' : metrics.healthScore >= 60 ? 'B' : metrics.healthScore >= 40 ? 'C' : 'D'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
