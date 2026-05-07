import { useMemo, useState } from 'react';
import { useRealSightStore } from '../store/useRealSightStore';
import { Loader } from 'lucide-react';

export const TenantFinancialsTable: React.FC = () => {
  const { tenants, isLoadingTenants } = useRealSightStore();
  const [sortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'daysPastDue', direction: 'desc' });

  const tenantFinancials = useMemo(() => {
    // In a real app, paymentRecords would be fetched from the API based on selected tenants
    // For now, we simulate finding the latest payment for each tenant from a mock/global list
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
  
  // ... (UI helper functions like getStatusBadge, etc.)

  if (isLoadingTenants) {
    return <div className="flex items-center justify-center p-12"><Loader className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase">Tenant</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase">Amount Owed</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase">Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedTenants.map(tenant => (
            <tr key={tenant.id} className="border-b border-slate-800 last:border-b-0">
              <td className="px-4 py-3 text-sm text-white">{tenant.business_name}</td>
              <td className="px-4 py-3 text-sm text-white text-right">${tenant.amountOwed.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-white text-center">{tenant.paymentStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
