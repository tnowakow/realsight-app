import { useEffect, useState, useMemo } from 'react';
import { useRealSightStore } from '../../store/useRealSightStore';
import { getPortfolioMetrics, getPropertyPerformance, getTenantsByProperty, type PortfolioMetric, type PropertyPerformance, type Tenant } from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Building2, ArrowUp, ArrowDown, Loader, AlertTriangle } from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : fmt(n);

const MONTH_LABELS = (() => {
  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    labels.push(d.toLocaleString('default', { month: 'short' }));
  }
  return labels;
})();

const TYPE_COLORS: Record<string, string> = {
  Office:     '#34d399', // emerald
  Retail:     '#60a5fa', // blue
  Industrial: '#f59e0b', // amber
  Healthcare: '#a78bfa', // violet
};

const collectionRateColor = (r: number) =>
  r >= 95 ? '#34d399' : r >= 85 ? '#fbbf24' : '#f87171';

// ─── Property-level tenant detail view ─────────────────────────────────────
const PropertyTenantDetail = ({ tenants, propertyId }: { tenants: Tenant[]; propertyId: string }) => {
  const property = useRealSightStore(s => s.properties).find(p => p.id === propertyId);

  // Aggregate tenant payment data
  const tenantData = useMemo(() => {
    return tenants.map(tenant => {
      const lease = tenant.leases[0];
      if (!lease) return null;

      const payments = tenant.payments || [];
      const recentPmt = payments.length > 0 ? payments[0] : null;

      // Calculate 6-month trend
      const monthlyRevenue = [];
      for (let mo = 5; mo >= 0; mo--) {
        const mStart = new Date(); mStart.setDate(1); mStart.setHours(0,0,0,0); mStart.setMonth(mStart.getMonth() - mo - 1);
        const mEnd   = new Date(); mEnd.setDate(1);   mEnd.setHours(0,0,0,0);   mEnd.setMonth(mEnd.getMonth() - mo);
        const pmts = payments.filter(p => {
          const pd = new Date(p.time);
          return pd >= mStart && pd < mEnd;
        });
        monthlyRevenue.push(pmts.reduce((s, p) => s + p.amount_paid, 0));
      }

      const totalDue6mo = lease.monthly_rent * 6;
      const totalPaid6mo = payments.slice(0, 6).reduce((s, p) => s + p.amount_paid, 0);
      const collectionRate = totalDue6mo > 0 ? (totalPaid6mo / totalDue6mo) * 100 : 0;

      return {
        id: tenant.id,
        name: tenant.business_name,
        businessType: tenant.business_type,
        creditRating: tenant.credit_rating,
        monthlyRent: lease.monthly_rent,
        recentPaymentStatus: recentPmt?.payment_status ?? 'no_data',
        daysPastDue: recentPmt?.days_past_due ?? 0,
        amountPaid: recentPmt?.amount_paid ?? 0,
        collectionRate,
        monthlyRevenue,
      };
    }).filter(Boolean) as any[];
  }, [tenants]);

  if (!property) return null;

  const totalMonthlyRent = tenantData.reduce((s, t) => s + t.monthlyRent, 0);
  const avgCollectionRate = tenantData.length > 0 
    ? tenantData.reduce((s, t) => s + t.collectionRate, 0) / tenantData.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Property header */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{property.name}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {property.city}, {property.state} · {property.property_type}
            </p>
            <div className="flex gap-4 mt-3 text-xs text-slate-500">
              <span>{property.total_square_feet.toLocaleString()} sqft</span>
              <span>·</span>
              <span>{tenantData.length} tenants</span>
              <span>·</span>
              <span>${(totalMonthlyRent / 1000).toFixed(0)}K/mo rent</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Collection</p>
            <p className={`text-2xl font-bold ${avgCollectionRate >= 90 ? 'text-emerald-400' : avgCollectionRate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
              {avgCollectionRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Tenant performance table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Tenant Payment Performance</h3>
          <span className="text-xs text-slate-500">Last 6 months</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Credit</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Rent</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">6-Mo Collection</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tenantData.map(t => {
                const isProblem = t.recentPaymentStatus === 'delinquent' || t.recentPaymentStatus === 'defaulted' || t.daysPastDue > 15;
                return (
                  <tr key={t.id} className={`hover:bg-slate-800/40 transition-colors ${isProblem ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.businessType}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.creditRating.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' :
                        t.creditRating.startsWith('B') ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {t.creditRating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{fmtK(t.monthlyRent)}</td>
                    <td className="px-4 py-3 text-center">
                      {t.daysPastDue > 0 ? (
                        <span className={`text-xs font-semibold ${
                          t.daysPastDue > 30 ? 'text-red-400' : t.daysPastDue > 15 ? 'text-orange-400' : 'text-yellow-400'
                        }`}>
                          {t.daysPastDue} days late
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-400">✓ On time</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      <span className={`font-semibold ${
                        t.collectionRate >= 95 ? 'text-emerald-400' : 
                        t.collectionRate >= 85 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {t.collectionRate.toFixed(1)}%
                      </span>
                    </td>
                    {/* Sparkline */}
                    <td className="px-4 py-3 text-center hidden xl:table-cell">
                      <svg width="64" height="24" viewBox="0 0 64 24">
                        {(() => {
                          const min = Math.min(...t.monthlyRevenue);
                          const max = Math.max(...t.monthlyRevenue);
                          const range = max - min || 1;
                          return (
                            <>
                              <polyline
                                fill="none"
                                stroke={t.collectionRate >= 90 ? '#34d399' : t.collectionRate >= 80 ? '#fbbf24' : '#f87171'}
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                points={t.monthlyRevenue.map((v, i) => {
                                  const x = (i / 5) * 60 + 2;
                                  const y = 22 - ((v - min) / range) * 20;
                                  return `${x},${y}`;
                                }).join(' ')}
                              />
                              {t.monthlyRevenue.map((v, i) => (
                                <circle key={i} cx={(i / 5) * 60 + 2} cy={22 - ((v - min) / range) * 20} r="1.5" fill="#34d399" />
                              ))}
                            </>
                          );
                        })()}
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: number }) => {
  const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend == null ? '' : trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400';
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {TrendIcon && <span className={`flex items-center gap-0.5 text-xs font-medium mb-0.5 ${trendColor}`}><TrendIcon className="w-3 h-3" />{Math.abs(trend!).toFixed(1)}%</span>}
      </div>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
};

const SectionHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-white">{title}</h2>
    {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
export const PortfolioPerformanceTab = () => {
  const selectedPortfolioId = useRealSightStore(s => s.selectedPortfolioId);
  const selectedPropertyId  = useRealSightStore(s => s.selectedPropertyId);
  const portfolios          = useRealSightStore(s => s.portfolios);

  const [metrics,     setMetrics]     = useState<PortfolioMetric[]>([]);
  const [performance, setPerformance] = useState<PropertyPerformance[]>([]);
  const [tenants,     setTenants]     = useState<Tenant[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [sortKey,     setSortKey]     = useState<keyof PropertyPerformance>('estimated_noi');
  const [sortDir,     setSortDir]     = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!selectedPortfolioId) return;
    setLoading(true);

    const fetchAll = async () => {
      // Always fetch portfolio-level data
      const [m, p] = await Promise.all([
        getPortfolioMetrics(selectedPortfolioId),
        getPropertyPerformance(selectedPortfolioId),
      ]);
      setMetrics(m);
      setPerformance(p);

      // If a specific property is selected, also fetch its tenants
      if (selectedPropertyId) {
        const t = await getTenantsByProperty(selectedPropertyId);
        setTenants(t);
      } else {
        setTenants([]);
      }

      setLoading(false);
    };

    fetchAll();
  }, [selectedPortfolioId, selectedPropertyId]);

  // ── Trend chart data: collection rate + revenue last 6 months ───────────
  const trendData = useMemo(() => {
    return MONTH_LABELS.map((month, idx) => {
      const monthMetrics = metrics.filter(m => {
        const d = new Date(m.metric_date);
        const target = new Date(); target.setDate(1); target.setHours(0,0,0,0);
        target.setMonth(target.getMonth() - (5 - idx));
        return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth();
      });
      const collRate  = monthMetrics.find(m => m.metric_name === 'monthly_collection_rate')?.metric_value ?? null;
      const revenue   = monthMetrics.find(m => m.metric_name === 'monthly_revenue')?.metric_value ?? null;
      const outstanding = monthMetrics.find(m => m.metric_name === 'monthly_outstanding')?.metric_value ?? null;
      return { month, collRate, revenue, outstanding };
    });
  }, [metrics]);

  // ── Collection rate trend (first → last month) ───────────────────────────
  const rateFirst = trendData[0]?.collRate;
  const rateLast  = trendData[trendData.length - 1]?.collRate;
  const rateTrend = rateFirst != null && rateLast != null ? rateLast - rateFirst : undefined;

  // ── Revenue trend ────────────────────────────────────────────────────────
  const revFirst  = trendData[0]?.revenue;
  const revLast   = trendData[trendData.length - 1]?.revenue;
  const revTrend  = revFirst != null && revFirst > 0 && revLast != null
    ? ((revLast - revFirst) / revFirst) * 100 : undefined;

  // ── NOI by property (bar chart) ──────────────────────────────────────────
  const noiData = useMemo(() =>
    [...performance]
      .sort((a, b) => b.estimated_noi - a.estimated_noi)
      .slice(0, 12)
      .map(p => ({ name: p.name.split('—')[0].trim(), noi: p.estimated_noi, type: p.property_type })),
    [performance]
  );

  // ── Occupancy by property type ───────────────────────────────────────────
  const occupancyByType = useMemo(() => {
    const types: Record<string, { totalUnits: number; occupiedUnits: number }> = {};
    performance.forEach(p => {
      if (!types[p.property_type]) types[p.property_type] = { totalUnits: 0, occupiedUnits: 0 };
      types[p.property_type].totalUnits   += p.unit_count;
      types[p.property_type].occupiedUnits += p.occupied_units;
    });
    return Object.entries(types).map(([type, d]) => ({
      type,
      rate: d.totalUnits > 0 ? parseFloat(((d.occupiedUnits / d.totalUnits) * 100).toFixed(1)) : 0,
      occupied: d.occupiedUnits,
      total: d.totalUnits,
    }));
  }, [performance]);

  // ── Sorted property table ────────────────────────────────────────────────
  const sortedPerformance = useMemo(() => {
    return [...performance].sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'desc' ? bv - av : av - bv;
    });
  }, [performance, sortKey, sortDir]);

  const handleSort = (key: keyof PropertyPerformance) => {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }: { k: keyof PropertyPerformance }) =>
    sortKey !== k ? null :
      sortDir === 'desc' ? <ArrowDown className="w-3 h-3 inline ml-1" /> : <ArrowUp className="w-3 h-3 inline ml-1" />;

  const portfolioName = portfolios.find(p => p.id === selectedPortfolioId)?.name ?? 'Portfolio';

  // Show property-level view if a specific property is selected
  if (selectedPropertyId && tenants.length > 0) {
    return <PropertyTenantDetail tenants={tenants} propertyId={selectedPropertyId} />;
  }

  // ── Summary totals ───────────────────────────────────────────────────────
  const totalRevenue   = performance.reduce((s, p) => s + p.total_paid, 0);
  const totalNOI       = performance.reduce((s, p) => s + p.estimated_noi, 0);
  const totalOutstanding = performance.reduce((s, p) => s + p.outstanding, 0);
  const avgOccupancy   = performance.length
    ? performance.reduce((s, p) => s + p.occupancy_rate, 0) / performance.length : 0;
  const avgCollection  = performance.length
    ? performance.reduce((s, p) => s + p.collection_rate, 0) / performance.length : 0;

  if (!selectedPortfolioId) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        Select a portfolio to view performance data.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  const CustomTooltipCurrency = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {fmtK(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  const CustomTooltipPercent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
        <p className="text-slate-400 mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value?.toFixed(1)}%
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">

      {/* ── Top summary KPIs ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Monthly Revenue"    value={fmtK(totalRevenue)}                sub={`${performance.length} properties`} trend={revTrend} />
        <StatCard label="Est. Monthly NOI"   value={fmtK(totalNOI)}                    sub="~65% margin assumed" />
        <StatCard label="Outstanding Debt"   value={fmtK(totalOutstanding)}            sub={totalOutstanding > 0 ? 'Needs attention' : 'Fully collected'} />
        <StatCard label="Avg Occupancy"      value={`${avgOccupancy.toFixed(1)}%`}     sub="Across all properties" />
        <StatCard label="Avg Collection"     value={`${avgCollection.toFixed(1)}%`}    sub="Current month" trend={rateTrend} />
      </div>

      {/* ── Trend charts row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue vs Outstanding trend */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <SectionHeader title="Revenue vs Outstanding Debt" subtitle="6-month trend" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => fmtK(v)} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<CustomTooltipCurrency />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Line type="monotone" dataKey="revenue"     name="Revenue"     stroke="#34d399" strokeWidth={2} dot={{ r: 3, fill: '#34d399' }} />
              <Line type="monotone" dataKey="outstanding" name="Outstanding" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: '#f87171' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Collection rate trend */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <SectionHeader title="Collection Rate Trend" subtitle="6-month — target ≥95%" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<CustomTooltipPercent />} />
              {/* Target line at 95% */}
              <Line type="monotone" dataKey={() => 95} name="Target (95%)" stroke="#475569" strokeWidth={1} dot={false} strokeDasharray="6 3" />
              <Line type="monotone" dataKey="collRate" name="Collection Rate" stroke="#60a5fa" strokeWidth={2} dot={{ r: 3, fill: '#60a5fa' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── NOI by property (bar) + Occupancy by type ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* NOI by property */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <SectionHeader title="Estimated NOI by Property" subtitle="Current month, sorted highest to lowest" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={noiData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tickFormatter={v => fmtK(v)} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip content={<CustomTooltipCurrency />} />
              <Bar dataKey="noi" name="Est. NOI" radius={[0, 4, 4, 0]}>
                {noiData.map((entry, i) => (
                  <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <span key={type} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>

        {/* Occupancy by property type */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <SectionHeader title="Occupancy by Property Type" subtitle="Occupied units ÷ total units" />
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={occupancyByType} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<CustomTooltipPercent />} />
              <Bar dataKey="rate" name="Occupancy" radius={[4, 4, 0, 0]}>
                {occupancyByType.map((entry, i) => (
                  <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#34d399'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Detail breakdown */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {occupancyByType.map(t => (
              <div key={t.type} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2 text-xs">
                <span className="text-slate-400">{t.type}</span>
                <span className="font-semibold" style={{ color: TYPE_COLORS[t.type] }}>
                  {t.occupied}/{t.total} units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Property performance table ────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">Property Performance Detail</h2>
            <p className="text-xs text-slate-500 mt-0.5">{portfolioName} — {performance.length} properties — click headers to sort</p>
          </div>
          <Building2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th onClick={() => handleSort('occupancy_rate')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Occupancy <SortIcon k="occupancy_rate" />
                </th>
                <th onClick={() => handleSort('collection_rate')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Collection <SortIcon k="collection_rate" />
                </th>
                <th onClick={() => handleSort('total_paid')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Revenue <SortIcon k="total_paid" />
                </th>
                <th onClick={() => handleSort('estimated_noi')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Est. NOI <SortIcon k="estimated_noi" />
                </th>
                <th onClick={() => handleSort('revenue_per_sqft')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  $/SqFt <SortIcon k="revenue_per_sqft" />
                </th>
                <th onClick={() => handleSort('outstanding')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Outstanding <SortIcon k="outstanding" />
                </th>
                <th onClick={() => handleSort('problem_tenants')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Issues <SortIcon k="problem_tenants" />
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden xl:table-cell">6-Mo Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedPerformance.map(prop => {
                const isUnderperforming = prop.occupancy_rate < 80 || prop.collection_rate < 85 || prop.problem_tenants > 2;
                const trendMin = Math.min(...prop.monthly_revenue_trend);
                const trendMax = Math.max(...prop.monthly_revenue_trend);
                const trendRange = trendMax - trendMin || 1;

                return (
                  <tr key={prop.id} className={`hover:bg-slate-800/40 transition-colors ${isUnderperforming ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white text-sm leading-tight">{prop.name.split('—')[0].trim()}</div>
                      <div className="text-xs text-slate-500">{prop.city}, {prop.state} · {prop.total_square_feet.toLocaleString()} sqft</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${TYPE_COLORS[prop.property_type]}20`, color: TYPE_COLORS[prop.property_type] }}>
                        {prop.property_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${prop.occupancy_rate >= 90 ? 'text-emerald-400' : prop.occupancy_rate >= 80 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {prop.occupancy_rate.toFixed(1)}%
                      </span>
                      <div className="text-xs text-slate-500">{prop.occupied_units}/{prop.unit_count} units</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold" style={{ color: collectionRateColor(prop.collection_rate) }}>
                        {prop.collection_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{fmtK(prop.total_paid)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400">{fmtK(prop.estimated_noi)}</td>
                    <td className="px-4 py-3 text-right text-slate-300 hidden lg:table-cell">${prop.revenue_per_sqft.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      {prop.outstanding > 0
                        ? <span className="text-red-400 font-mono font-medium">{fmtK(prop.outstanding)}</span>
                        : <span className="text-emerald-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {prop.problem_tenants > 0
                        ? <span className="flex items-center justify-center gap-1 text-orange-400 font-semibold"><AlertTriangle className="w-3 h-3" />{prop.problem_tenants}</span>
                        : <span className="text-emerald-400 text-xs">✓ Clean</span>}
                    </td>
                    {/* Sparkline */}
                    <td className="px-4 py-3 text-center hidden xl:table-cell">
                      <svg width="64" height="24" viewBox="0 0 64 24">
                        <polyline
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={prop.monthly_revenue_trend.map((v, i) => {
                            const x = (i / 5) * 60 + 2;
                            const y = 22 - ((v - trendMin) / trendRange) * 20;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        {prop.monthly_revenue_trend.map((v, i) => (
                          <circle key={i} cx={(i / 5) * 60 + 2} cy={22 - ((v - trendMin) / trendRange) * 20} r="1.5" fill="#34d399" />
                        ))}
                      </svg>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPerformanceTab;
