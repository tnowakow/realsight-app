import { useState, useEffect } from 'react';
import { useRealSightStore } from '../../store/useRealSightStore';
import { AlertCard } from '../ui/AlertCard';
import { Tooltip } from '../ui/Tooltip';
import { Info } from 'lucide-react';

const KPICard = ({ label, value, unit, target, isGood, tooltipText }: any) => (
  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800">
    <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider mb-1">
      <span>{label}</span>
      {tooltipText && (
        <Tooltip text={tooltipText}>
          <Info className="w-3 h-3 cursor-pointer" />
        </Tooltip>
      )}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-xl font-bold text-white">{value}</span>
      {unit && <span className="text-sm text-slate-400">{unit}</span>}
    </div>
    {target && <div className={`text-xs mt-2 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>{target}</div>}
  </div>
);

export const OverviewTab = () => {
  const { selectedPortfolioId, selectedPropertyId, properties, tenants } = useRealSightStore();
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    setIsLoading(true);
    if (selectedPortfolioId) {
      const relevantProperties = selectedPropertyId ? properties.filter(p => p.id === selectedPropertyId) : properties;
      if (relevantProperties.length === 0 && tenants.length === 0) {
        setMetrics(null);
        setIsLoading(false);
        return;
      }

      const totalUnits = relevantProperties.reduce((sum, p) => sum + (p.unit_count || 0), 0);
      const occupiedUnits = tenants.filter(t => t.lease).length;
      const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
      let totalRentDue = 0, totalPaid = 0, lateDaysPastDueSum = 0, lateTenantCount = 0;
      const problemTenants: any[] = [];

      tenants.forEach(tenant => {
        if (tenant.lease) totalRentDue += tenant.lease.monthly_rent || 0;
        if (tenant.currentPayment) {
          const p = tenant.currentPayment;
          totalPaid += p.amount_paid || 0;
          const daysPastDue = p._calculated_days_past_due ?? p.days_past_due ?? 0;
          if (daysPastDue > 0) {
            lateDaysPastDueSum += daysPastDue;
            lateTenantCount++;
          }
          if (daysPastDue > 15 || ['partial', 'delinquent', 'defaulted'].includes(p.payment_status || '')) {
            problemTenants.push({ tenant, payment: p, amountOwed: Math.max(0, (p.amount_due || 0) - (p.amount_paid || 0)) });
          }
        }
      });

      const collectionRate = totalRentDue > 0 ? (totalPaid / totalRentDue) * 100 : 100;
      const outstandingDebt = Math.max(0, totalRentDue - totalPaid);
      const avgDaysPastDue = lateTenantCount > 0 ? Math.round(lateDaysPastDueSum / lateTenantCount) : 0;
      const netOperatingIncome = totalPaid * 0.65;
      const noiMargin = totalRentDue > 0 ? (netOperatingIncome / totalRentDue) * 100 : 0;
      let healthScore = 100 - (100 - collectionRate) * 1.5 - avgDaysPastDue * 0.5 - problemTenants.length * 5 - (100 - occupancyRate);
      
      setMetrics({
        collectionRate: collectionRate.toFixed(1), avgDaysPastDue, outstandingDebt, noiMargin: noiMargin.toFixed(1),
        problemTenantsCount: problemTenants.length, totalRentDue, totalPaid, tenantCount: tenants.length,
        propertyCount: relevantProperties.length, occupancyRate: occupancyRate.toFixed(1),
        healthScore: Math.max(0, Math.min(100, healthScore)).toFixed(0), problemTenants,
        alertsActive: problemTenants.length
      });
    }
    const timer = setTimeout(() => setIsLoading(false), 250);
    return () => clearTimeout(timer);
  }, [selectedPortfolioId, selectedPropertyId, properties, tenants]);

  if (isLoading) return <div className="text-center py-12 text-slate-400">Loading portfolio data...</div>;
  if (!metrics) return <div className="text-center py-12 text-slate-400">Select a portfolio to get started.</div>;

  const formatCurrency = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const getHealthVerdict = (score: number) => {
    if (score >= 80) return { text: 'HEALTHY', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (score >= 60) return { text: 'FAIR', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { text: 'POOR', color: 'text-red-400', bg: 'bg-red-500/10' };
  };
  const healthVerdict = getHealthVerdict(Number(metrics.healthScore));

  const tooltips = {
    collectionRate: <span><strong className="text-white">Rent Collection Rate:</strong> % of total rent due that was collected.</span>,
    occupancy: <span><strong className="text-white">Portfolio Occupancy:</strong> % of rentable units with an active lease.</span>,
    outstanding: <span><strong className="text-white">Total Outstanding:</strong> Total unpaid rent.</span>,
    daysPastDue: <span><strong className="text-white">Avg. Days Past Due:</strong> Average for late tenants only.</span>,
    monthlyRevenue: <span><strong className="text-white">Monthly Revenue:</strong> Gross potential income for the month.</span>,
    problemTenants: <span><strong className="text-white">Problem Tenants:</strong> Count of tenants who are >15 days late or have a problem status.</span>,
    activeAlerts: <span><strong className="text-white">Active Alerts:</strong> Count of tenants with a 'critical' or 'high' severity status.</span>,
    noiMargin: <span><strong className="text-white">NOI Margin (Est.):</strong> Estimated Net Operating Income margin (assumes 35% OpEx).</span>,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Rent Collection Rate" value={metrics.collectionRate} unit="%" target="&ge;95%" isGood={metrics.collectionRate >= 95} tooltipText={tooltips.collectionRate} />
        <KPICard label="Portfolio Occupancy" value={metrics.occupancyRate} unit="%" target="&ge;90%" isGood={metrics.occupancyRate >= 90} tooltipText={tooltips.occupancy} />
        <KPICard label="Total Outstanding" value={formatCurrency(metrics.outstandingDebt)} target="&lt; $15K" isGood={metrics.outstandingDebt <= 15000} tooltipText={tooltips.outstanding} />
        <KPICard label="Avg Days Past Due" value={metrics.avgDaysPastDue} unit="days" target="&lt; 10 days" isGood={metrics.avgDaysPastDue <= 10} tooltipText={tooltips.daysPastDue} />
        <KPICard label="Monthly Revenue" value={formatCurrency(metrics.totalRentDue)} tooltipText={tooltips.monthlyRevenue} />
        <KPICard label="Problem Tenants" value={metrics.problemTenantsCount} target="&le;2" isGood={metrics.problemTenantsCount <= 2} tooltipText={tooltips.problemTenants} />
        <KPICard label="Active Alerts" value={metrics.alertsActive} target="0" isGood={metrics.alertsActive === 0} tooltipText={tooltips.activeAlerts} />
        <KPICard label="NOI Margin" value={metrics.noiMargin} unit="%" target="&ge;25%" isGood={metrics.noiMargin >= 25} tooltipText={tooltips.noiMargin} />
      </section>

      {metrics.problemTenants.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Priority Alerts</h2>
          {metrics.problemTenants.slice(0, 5).map((item: any, idx: number) => (
            <AlertCard key={idx} type={'warning'} headline={`${item.tenant.business_name} — ${item.payment.payment_status.toUpperCase()}`} subtext={`Days Past Due: ${(item.payment._calculated_days_past_due || item.payment.days_past_due)} | Amount Owed: ${formatCurrency(item.amountOwed)}`} />
          ))}
        </section>
      )}

      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center"><div className="text-2xl font-bold text-white">{metrics.propertyCount}</div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Properties</div></div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center"><div className="text-2xl font-bold text-white">{metrics.tenantCount}</div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Active Tenants</div></div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center"><div className="flex items-center justify-center gap-2"><div className="text-xl font-bold text-emerald-400">{formatCurrency(metrics.totalRentDue)}</div><Tooltip text={tooltips.monthlyRevenue}><Info className="w-3 h-3" /></Tooltip></div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Monthly Revenue</div></div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center"><div className="flex items-center justify-center gap-2"><div className="text-2xl font-bold text-white">{metrics.occupancyRate}%</div><Tooltip text={tooltips.occupancy}><Info className="w-3 h-3" /></Tooltip></div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Occupancy</div></div>
        <div className={`rounded-lg p-4 border text-center ${healthVerdict.bg}`}><div className="flex items-center justify-center gap-2"><div className={`text-2xl font-bold ${healthVerdict.color}`}>{metrics.alertsActive}</div><Tooltip text={tooltips.activeAlerts}><Info className="w-3 h-3" /></Tooltip></div><div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Alerts Active</div></div>
      </section>

      <section className={`bg-gradient-to-r ${healthVerdict.bg} rounded-xl p-8 border ${healthVerdict.color.replace('text', 'border')}/30`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Portfolio Health Score</h3>
            <div className="flex items-baseline gap-4"><span className="text-6xl font-black text-white">{metrics.healthScore}</span><span className={`text-2xl font-bold ${healthVerdict.color}`}>{healthVerdict.text}</span></div>
            <p className="text-slate-500 mt-3">Based on collection, occupancy, days past due, and problem tenants.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-2">Performance Grade</div>
            <div className={`text-5xl font-black ${healthVerdict.color}`}>{Number(metrics.healthScore) >= 80 ? 'A' : Number(metrics.healthScore) >= 60 ? 'B' : 'C'}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
