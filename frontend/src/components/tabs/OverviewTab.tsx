import { useState, useEffect } from 'react';
import { useRealSightStore, type PaymentRecord } from '../../store/useRealSightStore';
import { AlertCard } from '../ui/AlertCard';
import { Tooltip } from '../ui/Tooltip'; // Import the new Tooltip component
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

  // Calculate portfolio metrics from tenant/payment data
  const calculateMetrics = () => {
    if (!selectedPortfolioId) return null;
    if (!tenants.length && !properties.length) return null;

    // ── Occupancy ──────────────────────────────────────────────────────────
    // Total units = sum of unit_count on the relevant properties (not tenant count)
    // Occupied units = number of tenants who have a lease record
    const relevantProperties = selectedPropertyId
      ? properties.filter(p => p.id === selectedPropertyId)
      : properties;
    const totalUnits = relevantProperties.reduce((sum, p) => sum + (p.unit_count || 0), 0);
    const occupiedUnits = tenants.filter(t => t.lease).length;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    // ── Rent & payments ───────────────────────────────────────────────────
    let totalRentDue = 0;
    let totalPaid = 0;
    let lateDaysPastDueSum = 0;
    let lateTenantCount = 0;
    const problemTenants: any[] = [];

    tenants.forEach(tenant => {
      const lease = tenant.lease;
      const payment: PaymentRecord | undefined = tenant.currentPayment;

      if (lease) totalRentDue += lease.monthly_rent || 0;
      if (payment) {
        totalPaid += payment.amount_paid || 0;

        // Avg days past due: only count tenants that are actually late
        if ((payment.days_past_due || 0) > 0) {
          lateDaysPastDueSum += payment.days_past_due;
          lateTenantCount++;
        }

        const paymentStatus = payment.payment_status || 'paid';
        if ((payment.days_past_due || 0) > 15 ||
            ['partial', 'delinquent', 'defaulted'].includes(paymentStatus)) {
          problemTenants.push({
            tenant,
            payment,
            severity:
              paymentStatus === 'defaulted' ? 'critical' :
              (payment.days_past_due || 0) > 45 ? 'high' : 'medium',
            amountOwed: Math.max(0, (payment.amount_due || 0) - (payment.amount_paid || 0))
          });
        }
      }
    });

    const collectionRate  = totalRentDue > 0 ? (totalPaid / totalRentDue) * 100 : 100;
    const outstandingDebt = Math.max(0, totalRentDue - totalPaid);
    // Avg days past due only among tenants who are actually late (not diluted by on-time payers)
    const avgDaysPastDue  = lateTenantCount > 0 ? Math.round(lateDaysPastDueSum / lateTenantCount) : 0;
    // NOI margin: rough estimate using a standard 35% operating expense ratio
    // Replace with real expense data when available
    const noiMargin = totalPaid > 0 ? parseFloat((((totalPaid - totalPaid * 0.35) / totalPaid) * 100).toFixed(1)) : 0;

    // ── Health score ──────────────────────────────────────────────────────
    let healthScore = 100;
    if (collectionRate < 95)          healthScore -= 20;
    if (avgDaysPastDue > 10)          healthScore -= 15;
    if (problemTenants.length > 3)    healthScore -= 25;
    if (outstandingDebt > 20000)      healthScore -= 20;
    if (occupancyRate < 90)           healthScore -= 15;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      collectionRate:      parseFloat(collectionRate.toFixed(1)),
      avgDaysPastDue,
      outstandingDebt,
      noiMargin,
      problemTenantsCount: problemTenants.length,
      totalRentDue,
      totalPaid,
      tenantCount:   tenants.length,
      propertyCount: relevantProperties.length,
      totalUnits,
      occupiedUnits,
      occupancyRate: parseFloat(occupancyRate.toFixed(1)),
      healthScore,
      problemTenants,
      alertsActive:  problemTenants.filter(t => t.severity === 'critical' || t.severity === 'high').length
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
          <div className="text-slate-400">{selectedPortfolioId ? 'Loading portfolio data...' : 'Select a portfolio to get started.'}</div>
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

  const monthlyRevenueTooltip = <><strong>Monthly Revenue:</strong> The total potential rent due from all leased units for the current month.</>;
  const avgOccupancyTooltip = <><strong>Average Occupancy:</strong> The percentage of total rentable units that currently have an active lease across the selected portfolio/property.</>;
  const activeAlertsTooltip = <><strong>Active Alerts:</strong> The number of tenants with a 'critical' or 'high' severity status, indicating severe delinquency or default.</>;

  // KPI card component
  const KPICard = ({ label, value, unit, target, isGood, tooltipText }: { label: string; value: number | string; unit?: string; target?: string; isGood?: boolean; tooltipText?: React.ReactNode }) => (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 hover:border-emerald-500/50 transition-colors">
      <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider mb-1">
        <span>{label}</span>
        {tooltipText && (
          <Tooltip text={tooltipText}>
            <Info className="w-3 h-3 cursor-pointer" />
          </Tooltip>
        )}
      </div>
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
          tooltipText={
            <>
              <strong className="text-white">Rent Collection Rate:</strong> The percentage of total rent due that was actually collected in the current period.
              <br /><br />
              <span className="text-slate-400">Calculation: (Total Paid / Total Rent Due) * 100</span>
            </>
          }
        />
        <KPICard 
          label="Portfolio Occupancy" 
          value={metrics.occupancyRate} 
          unit="%" 
          target="≥90%"
          isGood={metrics.occupancyRate >= 90}
          tooltipText={
            <>
              <strong className="text-white">Portfolio Occupancy:</strong> The percentage of total rentable units that currently have an active lease.
              <br /><br />
              <span className="text-slate-400">Calculation: (Occupied Units / Total Units) * 100</span>
            </>
          }
        />
        <KPICard 
          label="Total Outstanding" 
          value={formatCurrency(metrics.outstandingDebt)}
          target="&lt;$15K"
          isGood={metrics.outstandingDebt <= 15000}
          tooltipText={
            <>
              <strong className="text-white">Total Outstanding:</strong> The total dollar amount of unpaid rent across all tenants in the current period.
              <br /><br />
              <span className="text-slate-400">Calculation: Total Rent Due - Total Paid</span>
            </>
          }
        />
        <KPICard 
          label="Avg Days Past Due" 
          value={metrics.avgDaysPastDue} 
          unit="days" 
          target="&lt;10 days"
          isGood={metrics.avgDaysPastDue <= 10}
          tooltipText={
            <>
              <strong className="text-white">Avg. Days Past Due:</strong> The average number of days rent is overdue, calculated *only* for tenants who are currently late.
              <br /><br />
              <span className="text-slate-400">This metric is not diluted by on-time payers.</span>
            </>
          }
        />
        <KPICard 
          label="Monthly Revenue" 
          value={formatCurrency(metrics.totalRentDue)}
          target=""
          tooltipText={
            <>
              <strong className="text-white">Monthly Revenue:</strong> The total potential rent due from all leased units for the current month.
              <br /><br />
              <span className="text-slate-400">This represents the gross potential income.</span>
            </>
          }
        />
        <KPICard 
          label="Problem Tenants" 
          value={metrics.problemTenantsCount} 
          target="≤2"
          isGood={metrics.problemTenantsCount <= 2}
          tooltipText={
            <>
              <strong className="text-white">Problem Tenants:</strong> The number of tenants who are significantly late (e.g., >15 days) or have a payment status of 'partial', 'delinquent', or 'defaulted'.
            </>
          }
        />
        <KPICard 
          label="Active Alerts" 
          value={metrics.alertsActive} 
          target="0"
          isGood={metrics.alertsActive === 0}
          tooltipText={
            <>
              <strong className="text-white">Active Alerts:</strong> The number of tenants with a 'critical' or 'high' severity status, typically those who are severely delinquent or have defaulted.
            </>
          }
        />
        <KPICard 
          label="NOI Margin" 
          value={metrics.noiMargin} 
          unit="%" 
          target="≥25%"
          isGood={metrics.noiMargin >= 25}
          tooltipText={
            <>
              <strong className="text-white">NOI Margin (Est.):</strong> An estimate of the Net Operating Income margin.
              <br /><br />
              <span className="text-slate-400">Calculation: Based on a standard 35% operating expense ratio. This is a temporary estimate until real expense data is integrated.</span>
            </>
          }
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
                type={item.severity === 'critical' ? 'warning' : item.severity === 'high' ? 'warning' : 'info'}
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
          <div className="flex items-center justify-center gap-2">
            <div className="text-xl font-bold text-emerald-400">{formatCurrency(metrics.totalRentDue)}</div>
            <Tooltip text={monthlyRevenueTooltip}>
              <Info className="w-3 h-3 cursor-pointer text-slate-500" />
            </Tooltip>
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Monthly Revenue</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="text-2xl font-bold text-white">{metrics.occupancyRate}%</div>
            <Tooltip text={avgOccupancyTooltip}>
              <Info className="w-3 h-3 cursor-pointer text-slate-500" />
            </Tooltip>
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Avg Occupancy</div>
        </div>
        <div className={`rounded-lg p-4 border text-center ${healthVerdict.bg} ${healthVerdict.color === 'text-red-400' ? 'border-red-500/50' : healthVerdict.color === 'text-orange-400' ? 'border-orange-500/50' : healthVerdict.color === 'text-yellow-400' ? 'border-yellow-500/50' : 'border-emerald-500/50'}`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`text-2xl font-bold ${healthVerdict.color}`}>{metrics.alertsActive}</div>
            <Tooltip text={activeAlertsTooltip}>
              <Info className="w-3 h-3 cursor-pointer" />
            </Tooltip>
          </div>
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
