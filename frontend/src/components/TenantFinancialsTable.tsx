import { useMemo, useState } from 'react';
import { useRealSightStore } from '../store/useRealSightStore';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, DollarSign, Loader } from 'lucide-react';

export const TenantFinancialsTable: React.FC = () => {
  const { tenants, isLoadingTenants } = useRealSightStore();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'daysPastDue', direction: 'desc' });

  // This combines live tenant data from the store with mock payment data.
  // This is the next part we will make fully live.
  const tenantFinancials = useMemo(() => {
    const mockPayments = [
      { tenant_id: 't1', amount_due: 8500, amount_paid: 8500, payment_status: 'paid', days_past_due: 0 },
      { tenant_id: 't2', amount_due: 12000, amount_paid: 12000, payment_status: 'paid', days_past_due: 0 },
      { tenant_id: 't3', amount_due: 4200, amount_paid: 0, payment_status: 'late', days_past_due: 15 },
      { tenant_id: 't4', amount_due: 3800, amount_paid: 0, payment_status: 'delinquent', days_past_due: 45 },
      { tenant_id: 't5', amount_due: 5500, amount_paid: 2750, payment_status: 'partial', days_past_due: 10 },
      { tenant_id: 't6', amount_due: 15000, amount_paid: 15000, payment_status: 'paid', days_past_due: 0 },
      { tenant_id: 't7', amount_due: 9800, amount_paid: 9800, payment_status: 'paid', days_past_due: 0 },
      { tenant_id: 't8', amount_due: 6200, amount_paid: 0, payment_status: 'defaulted', days_past_due: 92 },
    ];

    return tenants.map(tenant => {
      const latestPayment = mockPayments.find(p => p.tenant_id === tenant.id);
      if (!latestPayment) {
        return { ...tenant, monthlyRent: 0, amountPaid: 0, amountOwed: 0, paymentStatus: 'paid', daysPastDue: 0 };
      }
      return { ...tenant, monthlyRent: latestPayment.amount_due, amountPaid: latestPayment.amount_paid, amountOwed: latestPayment.amount_due - latestPayment.amount_paid, paymentStatus: latestPayment.payment_status, daysPastDue: latestPayment.days_past_due };
    });
  }, [tenants]);

  const sortedTenants = useMemo(() => {
    return [...tenantFinancials].sort((a, b) => {
      const key = sortConfig.key as keyof typeof a;
      const aValue = a[key] as any;
      const bValue = b[key] as any;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (aValue < bValue) return -1 * direction;
      if (aValue > bValue) return 1 * direction;
      return 0;
    });
  }, [tenantFinancials, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'partial': return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium"><Clock className="w-3 h-3" /> Partial</span>;
      case 'late': return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Late</span>;
      case 'delinquent': return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Delinquent</span>;
      case 'defaulted': return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Defaulted</span>;
      default: return <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs font-medium">Unknown</span>;
    }
  };

  const getDaysPastDueCell = (days: number) => {
    if (days === 0) return <span className="text-emerald-400 font-medium">On Time</span>;
    if (days <= 15) return <span className="text-amber-400 font-medium">{days} days</span>;
    if (days <= 30) return <span className="text-orange-400 font-semibold">{days} days</span>;
    if (days <= 60) return <span className="text-red-400 font-bold">{days} days</span>;
    return <span className="text-red-500 font-black animate-pulse">{days}+ days ⚠️</span>;
  };

  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline ml-1" /> : <ArrowDown className="w-3 h-3 inline ml-1" />;
  };

  const totalRentDue = tenantFinancials.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalCollected = tenantFinancials.reduce((sum, t) => sum + t.amountPaid, 0);
  const collectionRate = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;
  const problemTenants = tenantFinancials.filter(t => t.daysPastDue > 30).length;

  if (isLoadingTenants) {
    return <div className="flex items-center justify-center p-12"><Loader className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Total Tenants</p><p className="text-2xl font-bold text-white mt-1">{tenantFinancials.length}</p></div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Monthly Rent Due</p><p className="text-2xl font-bold text-white mt-1">${totalRentDue.toLocaleString()}</p></div>
        <div className={`bg-slate-900 p-4 rounded-xl border ${collectionRate >= 90 ? 'border-emerald-500/30' : 'border-red-500/30'}`}><p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Collection Rate</p><p className={`text-2xl font-bold mt-1 ${collectionRate >= 90 ? 'text-emerald-400' : 'text-red-400'}`}>{collectionRate.toFixed(1)}%</p></div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800"><p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Problem Tenants</p><p className={`text-2xl font-bold mt-1 ${problemTenants > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{problemTenants}</p></div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th onClick={() => handleSort('business_name')} className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Tenant <SortIndicator columnKey="business_name" /></th>
                <th onClick={() => handleSort('amountOwed')} className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Amount Owed <SortIndicator columnKey="amountOwed" /></th>
                <th onClick={() => handleSort('paymentStatus')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Status <SortIndicator columnKey="paymentStatus" /></th>
                <th onClick={() => handleSort('daysPastDue')} className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Days Past Due <SortIndicator columnKey="daysPastDue" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-sm text-white">{tenant.business_name}</td>
                  <td className="px-4 py-3 text-sm text-white text-right">${tenant.amountOwed.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{getStatusBadge(tenant.paymentStatus)}</td>
                  <td className="px-4 py-3 text-center">{getDaysPastDueCell(tenant.daysPastDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sortedTenants.length === 0 && (<div className="text-center py-12"><DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-400">No tenants found.</p></div>)}
      </div>
    </div>
  );
};
