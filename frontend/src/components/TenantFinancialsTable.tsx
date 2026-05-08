import { useMemo, useState } from 'react';
import { useRealSightStore } from '../store/useRealSightStore';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, DollarSign, Loader } from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export const TenantFinancialsTable: React.FC = () => {
  const { tenants, properties, isLoadingTenants } = useRealSightStore();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'daysPastDue',
    direction: 'desc',
  });

  // Build a property lookup map so we can show property names per tenant
  const propertyMap = useMemo(
    () => Object.fromEntries(properties.map(p => [p.id, p.name])),
    [properties]
  );

  // Map raw tenant store objects → flat financials row using real backend fields
  const rows = useMemo(() => {
    return tenants.map(tenant => {
      const lease          = tenant.lease;
      const payment        = tenant.currentPayment;
      const monthlyRent    = lease?.monthly_rent ?? 0;
      const amountDue      = payment?.amount_due  ?? monthlyRent;
      const amountPaid     = payment?.amount_paid ?? 0;
      const amountOwed     = Math.max(0, amountDue - amountPaid);
      const paymentStatus  = payment?.payment_status ?? (amountOwed > 0 ? 'delinquent' : 'paid');
      const daysPastDue    = payment?.days_past_due ?? 0;
      const leaseEnd       = lease?.lease_end_date ? new Date(lease.lease_end_date) : null;
      const daysToExpiry   = leaseEnd
        ? Math.round((leaseEnd.getTime() - Date.now()) / 86_400_000)
        : null;

      return {
        id:            tenant.id,
        businessName:  tenant.business_name,
        businessType:  tenant.business_type  ?? '—',
        creditRating:  tenant.credit_rating  ?? '—',
        propertyName:  propertyMap[tenant.property_id] ?? '—',
        monthlyRent,
        amountDue,
        amountPaid,
        amountOwed,
        paymentStatus,
        daysPastDue,
        daysToExpiry,
        leaseEnd,
      };
    });
  }, [tenants, propertyMap]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = (a as any)[sortConfig.key];
      const bv = (b as any)[sortConfig.key];
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }, [rows, sortConfig]);

  const handleSort = (key: string) =>
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));

  // Summary stats
  const totalRentDue    = rows.reduce((s, r) => s + r.amountDue, 0);
  const totalCollected  = rows.reduce((s, r) => s + r.amountPaid, 0);
  const totalOutstanding = rows.reduce((s, r) => s + r.amountOwed, 0);
  const collectionRate  = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;
  const problemCount    = rows.filter(r => ['partial', 'delinquent', 'defaulted'].includes(r.paymentStatus)).length;

  const getStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      paid:       { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Paid' },
      partial:    { bg: 'bg-blue-500/20 border-blue-500/30',       text: 'text-blue-400',    icon: <Clock className="w-3 h-3" />,        label: 'Partial' },
      late:       { bg: 'bg-amber-500/20 border-amber-500/30',     text: 'text-amber-400',   icon: <AlertTriangle className="w-3 h-3" />, label: 'Late' },
      delinquent: { bg: 'bg-orange-500/20 border-orange-500/30',   text: 'text-orange-400',  icon: <AlertTriangle className="w-3 h-3" />, label: 'Delinquent' },
      defaulted:  { bg: 'bg-red-600/20 border-red-600/30',         text: 'text-red-400',     icon: <AlertTriangle className="w-3 h-3" />, label: 'Defaulted' },
    };
    const s = map[status] ?? { bg: 'bg-slate-500/20 border-slate-500/30', text: 'text-slate-400', icon: null, label: status };
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${s.bg} ${s.text}`}>
        {s.icon}{s.label}
      </span>
    );
  };

  const getDaysPastDueCell = (days: number) => {
    if (days === 0)  return <span className="text-emerald-400 font-medium">On Time</span>;
    if (days <= 15)  return <span className="text-amber-400 font-medium">{days}d</span>;
    if (days <= 30)  return <span className="text-orange-400 font-semibold">{days}d</span>;
    if (days <= 60)  return <span className="text-red-400 font-bold">{days}d</span>;
    return <span className="text-red-500 font-black animate-pulse">{days}d ⚠️</span>;
  };

  const getCreditBadge = (rating: string) => {
    const color =
      rating.startsWith('A') ? 'text-emerald-400' :
      rating.startsWith('B') ? 'text-yellow-400'  :
      rating.startsWith('C') ? 'text-orange-400'  : 'text-red-400';
    return <span className={`font-bold text-sm ${color}`}>{rating}</span>;
  };

  const SortIndicator = ({ k }: { k: string }) =>
    sortConfig.key !== k ? null :
    sortConfig.direction === 'asc'
      ? <ArrowUp className="w-3 h-3 inline ml-1" />
      : <ArrowDown className="w-3 h-3 inline ml-1" />;

  if (isLoadingTenants) {
    return <div className="flex items-center justify-center p-12"><Loader className="w-8 h-8 animate-spin text-emerald-400" /></div>;
  }

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <DollarSign className="w-12 h-12 text-slate-600" />
        <p className="text-slate-400">No tenant data. Select a portfolio or property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Total Tenants</p>
          <p className="text-2xl font-bold text-white mt-1">{rows.length}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly Rent Due</p>
          <p className="text-2xl font-bold text-white mt-1">{fmt(totalRentDue)}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Collected</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{fmt(totalCollected)}</p>
        </div>
        <div className={`bg-slate-900 p-4 rounded-xl border ${totalOutstanding > 0 ? 'border-red-500/30' : 'border-slate-800'}`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${totalOutstanding > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{fmt(totalOutstanding)}</p>
        </div>
        <div className={`bg-slate-900 p-4 rounded-xl border ${collectionRate >= 90 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Collection Rate</p>
          <p className={`text-2xl font-bold mt-1 ${collectionRate >= 90 ? 'text-emerald-400' : 'text-red-400'}`}>{collectionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Problem tenants callout */}
      {problemCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span><strong>{problemCount}</strong> tenant{problemCount > 1 ? 's' : ''} with outstanding payments requiring attention</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('businessName')} className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tenant <SortIndicator k="businessName" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                <th onClick={() => handleSort('creditRating')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Credit <SortIndicator k="creditRating" />
                </th>
                <th onClick={() => handleSort('monthlyRent')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Monthly Rent <SortIndicator k="monthlyRent" />
                </th>
                <th onClick={() => handleSort('amountOwed')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Owed <SortIndicator k="amountOwed" />
                </th>
                <th onClick={() => handleSort('paymentStatus')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status <SortIndicator k="paymentStatus" />
                </th>
                <th onClick={() => handleSort('daysPastDue')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Past Due <SortIndicator k="daysPastDue" />
                </th>
                <th onClick={() => handleSort('daysToExpiry')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                  Lease Expires <SortIndicator k="daysToExpiry" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedRows.map(row => (
                <tr key={row.id} className={`hover:bg-slate-800/50 transition-colors ${row.paymentStatus === 'defaulted' ? 'bg-red-500/5' : row.paymentStatus === 'delinquent' ? 'bg-orange-500/5' : ''}`}>
                  <td className="px-4 py-3 font-medium text-white">{row.businessName}</td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell truncate max-w-[180px]">{row.propertyName}</td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{row.businessType}</td>
                  <td className="px-4 py-3 text-center hidden md:table-cell">{getCreditBadge(row.creditRating)}</td>
                  <td className="px-4 py-3 text-right text-slate-300 font-mono">{fmt(row.monthlyRent)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${row.amountOwed > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {row.amountOwed > 0 ? fmt(row.amountOwed) : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(row.paymentStatus)}</td>
                  <td className="px-4 py-3 text-center">{getDaysPastDueCell(row.daysPastDue)}</td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    {row.daysToExpiry == null ? '—' :
                     row.daysToExpiry < 0   ? <span className="text-red-400 font-semibold">Expired</span> :
                     row.daysToExpiry < 90  ? <span className="text-orange-400 font-semibold">{row.daysToExpiry}d</span> :
                     row.daysToExpiry < 365 ? <span className="text-yellow-400">{row.daysToExpiry}d</span> :
                     <span className="text-slate-400">{Math.round(row.daysToExpiry / 365 * 10) / 10}yr</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
