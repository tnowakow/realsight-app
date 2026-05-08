import { useState, useEffect } from 'react';
import { useRealSightStore, type PaymentRecord } from '../../store/useRealSightStore';
import { AlertCard } from '../ui/AlertCard';
import { Tooltip } from '../ui/Tooltip';
import { Info } from 'lucide-react';

export const OverviewTab = () => {
  const selectedPortfolioId = useRealSightStore((state) => state.selectedPortfolioId);
  const selectedPropertyId = useRealSightStore((state) => state.selectedPropertyId);
  const properties = useRealSightStore((state) => state.properties);
  const tenants = useRealSightStore((state) => state.tenants);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedPortfolioId, selectedPropertyId]);

  const calculateMetrics = () => {
    if (!selectedPortfolioId || (!tenants.length && !properties.length)) return null;

    const relevantProperties = selectedPropertyId ? properties.filter(p => p.id === selectedPropertyId) : properties;
    const totalUnits = relevantProperties.reduce((sum, p) => sum + (p.unit_count || 0), 0);
    const occupiedUnits = tenants.filter(t => t.lease).length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    let totalRentDue = 0, totalPaid = 0, lateDaysPastDueSum = 0, lateTenantCount = 0;
    const problemTenants: any[] = [];

    tenants.forEach(tenant => {
      if (tenant.lease) totalRentDue += tenant.lease.monthly_rent || 0;
      if (tenant.currentPayment) {
        const payment = tenant.currentPayment;
        totalPaid += payment.amount_paid || 0;
        if ((payment.days_past_due || 0) > 0) {
          lateDaysPastDueSum += payment.days_past_due;
          lateTenantCount++;
        }
        if ((payment.days_past_due || 0) > 15 || ['partial', 'delinquent', 'defaulted'].includes(payment.payment_status || '')) {
          problemTenants.push({
            tenant, payment,
            severity: payment.payment_status === 'defaulted' ? 'critical' : (payment.days_past_due || 0) > 45 ? 'high' : 'medium',
            amountOwed: Math.max(0, (payment.amount_due || 0) - (payment.amount_paid || 0))
          });
        }
      }
    });

    const collectionRate  = totalRentDue > 0 ? (totalPaid / totalRentDue) * 100 : 100;
    const outstandingDebt = Math.max(0, totalRentDue - totalPaid);
    const avgDaysPastDue  = lateTenantCount > 0 ? Math.round(lateDaysPastDueSum / lateTenantCount) : 0;
    const noiMargin = totalPaid > 0 ? parseFloat((((totalPaid - totalPaid * 0.35) / totalPaid) * 100).toFixed(1)) : 0;

    let healthScore = 100;
    if (collectionRate < 95) healthScore -= 20;
    if (avgDaysPastDue > 10) healthScore -= 15;
    if (problemTenants.length > 3) healthScore -= 25;
    if (outstandingDebt > 20000) healthScore -= 20;
    if (occupancyRate < 90) healthScore -= 15;

    return {
      collectionRate: parseFloat(collectionRate.toFixed(1)), avgDaysPastDue, outstandingDebt, noiMargin,
      problemTenantsCount: problemTenants.length, totalRentDue, totalPaid, tenantCount: tenants.length,
      propertyCount: relevantProperties.length, totalUnits, occupiedUnits, occupancyRate: parseFloat(occupancyRate.toFixed(1)),
      healthScore: Math.max(0, Math.min(100, healthScore)), problemTenants,
      alertsActive: problemTenants.filter(t => t.severity === 'critical' || t.severity === 'high').length
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) return <div className="text-slate-400 text-center py-12">Loading portfolio data...</div>;
  if (!metrics) return <div className="text-slate-400 text-center py-12">{selectedPortfolioId ? 'Loading...' : 'Select a portfolio.'}</div>;

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  const getHealthVerdict = (score: number) => {
    if (score >= 80) return { text: 'HEALTHY', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { text: 'FAIR', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (score >= 40) return { text: 'POOR', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    return { text: 'CRITICAL', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const healthVerdict = getHealthVerdict(metrics.healthScore);

  // CORRECT PATTERN: Define all complex JSX for props as variables
  const tooltips = {
    collectionRate: <span><strong className="text-white">Rent Collection Rate:</strong> % of total rent due that was collected.</span>,
    occupancy: <span><strong className="text-white">Portfolio Occupancy:</strong> % of rentable units with an active lease.</span>,
    outstanding: <span><strong className="text-white">Total Outstanding:</strong> Total unpaid rent.</span>,
    daysPastDue: <span><strong className="text-white">Avg. Days Past Due:</strong> Average for late tenants only.</span>,
    monthlyRevenue: <span><strong className="text-white">Monthly Revenue:</strong> Gross potential income for the month.</span>,
    problemTenants: <span><strong className="text-white">Problem Tenants:</strong> Count of tenants who are >15 days late or have a problem status.</span>,
    activeAlerts: <span><strong className="text-white">Active Alerts:</strong> Count of tenants with 'critical' or 'high' severity status.</span>,
    noiMargin: <span><strong className="text-white">NOI Margin (Est.):</strong> Estimated Net Operating Income margin (assumes 35% OpEx).</span>,
  };

  const KPICard = ({ label, value, unit, target, isGood, tooltipText }: any) => (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
      <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider mb-1">
        <span>{label}</span>
        {tooltipText && <Tooltip text={tooltipText}><Info className="w-3 h-3 cursor-pointer" /></Tooltip>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {unit && <span className="text-sm text-slate-400">{unit}</span>}
      </div>
      {target && <div className={`text-xs mt-2 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>{target}</div>}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Rent Collection Rate" value={metrics.collectionRate} unit="%" target="≥95%" isGood={metrics.collectionRate >= 95} tooltipText={tooltips.collectionRate} />
        <KPICard label="Portfolio Occupancy" value={metrics.occupancyRate} unit="%" target="≥90%" isGood={metrics.occupancyRate >= 90} tooltipText={tooltips.occupancy} />
        <KPICard label="Total Outstanding" value={formatCurrency(metrics.outstandingDebt)} target="&lt;$15K" isGood={metrics.outstandingDebt <= 15000} tooltipText={tooltips.outstanding} />
        <KPICard label="Avg Days Past Due" value={metrics.avgDaysPastDue} unit="days" target="&lt;10 days" isGood={metrics.avgDaysPastDue <= 10} tooltipText={tooltips.daysPastDue} />
        <KPICard label="Monthly Revenue" value={formatCurrency(metrics.totalRentDue)} tooltipText={tooltips.monthlyRevenue} />
        <KPICard label="Problem Tenants" value={metrics.problemTenantsCount} target="≤2" isGood={metrics.problemTenantsCount <= 2} tooltipText={tooltips.problemTenants} />
        <KPICard label="Active Alerts" value={metrics.alertsActive} target="0" isGood={metrics.alertsActive === 0} tooltipText={tooltips.activeAlerts} />
        <KPICard label="NOI Margin" value={metrics.noiMargin} unit="%" target="≥25%" isGood={metrics.noiMargin >= 25} tooltipText={tooltips.noiMargin} />
      </section>

      {metrics.problemTenants.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Priority Alerts</h2>
          {metrics.problemTenants.slice(0, 5).map((item, idx) => (
            <AlertCard key={idx} type={item.severity === 'critical' ? 'warning' : 'info'} headline={`${item.tenant.business_name} — ${item.payment.payment_status.toUpperCase()}`} subtext={`Days Past Due: ${item.payment.days_past_due} | Amount Owed: ${formatCurrency(item.amountOwed)}`} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{metrics.propertyCount}</div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Properties</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="text-2xl font-bold text-white">{metrics.tenantCount}</div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Tenants</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-xl font-bold text-emerald-400">{formatCurrency(metrics.totalRentDue)}</div>
            <Tooltip text={tooltips.monthlyRevenue}><Info className="w-3 h-3 cursor-pointer text-slate-500" /></Tooltip>
          </div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Monthly Revenue</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-2xl font-bold text-white">{metrics.occupancyRate}%</div>
            <Tooltip text={tooltips.occupancy}><Info className="w-3 h-3 cursor-pointer text-slate-500" /></Tooltip>
          </div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Occupancy</div>
        </div>
        <div className={`rounded-lg p-4 border text-center ${healthVerdict.bg}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`text-2xl font-bold ${healthVerdict.color}`}>{metrics.alertsActive}</div>
            <Tooltip text={tooltips.activeAlerts}><Info className="w-3 h-3 cursor-pointer" /></Tooltip>
          </div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Alerts Active</div>
        </div>
      </section>

      <section className={`bg-gradient-to-r ${healthVerdict.bg} rounded-xl p-8 border ${healthVerdict.color.replace('text', 'border')}/30`}>
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Health Score</h3>
            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black text-white">{metrics.healthScore}</span>
              <span className={`text-2xl font-bold ${healthVerdict.color}`}>{healthVerdict.text}</span>
            </div>
            <p className="text-slate-500 mt-3">Based on collection rate, occupancy, days past due, and problem tenant count</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-2">Performance Grade</div>
            <div className={`text-5xl font-black ${healthVerdict.color}`}>{metrics.healthScore >= 80 ? 'A' : metrics.healthScore >= 60 ? 'B' : 'C'}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
