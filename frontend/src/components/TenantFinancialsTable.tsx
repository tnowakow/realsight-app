import { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, DollarSign, Loader } from 'lucide-react';
import { useRealSightStore } from '../store/useRealSightStore';

interface TenantFinancialsTableProps {
  selectedPropertyId?: string | null;
}

export const TenantFinancialsTable: React.FC<TenantFinancialsTableProps> = ({ selectedPropertyId }) => {
  const { tenants, paymentRecords, isLoadingTenants } = useRealSightStore();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'daysPastDue',
    direction: 'desc',
  });

  // Combine tenant info with latest payment record from the store
  const tenantFinancials = useMemo(() => tenants.map(tenant => {
    // NOTE: This uses mock payments for now. In a real app, you'd fetch these from the API.
    const mockPayments: any[] = [
        { time: '2026-05-01', property_id: 'p1', tenant_id: 't1', amount_due: 8500, amount_paid: 8500, payment_status: 'paid', days_past_due: 0 },
        { time: '2026-05-01', property_id: 'p1', tenant_id: 't2', amount_due: 12000, amount_paid: 12000, payment_status: 'paid', days_past_due: 0 },
        { time: '2026-05-01', property_id: 'p1', tenant_id: 't3', amount_due: 4200, amount_paid: 0, payment_status: 'late', days_past_due: 15 },
        { time: '2026-05-01', property_id: 'p2', tenant_id: 't4', amount_due: 3800, amount_paid: 0, payment_status: 'delinquent', days_past_due: 45 },
        { time: '2026-05-01', property_id: 'p2', tenant_id: 't5', amount_due: 5500, amount_paid: 2750, payment_status: 'partial', days_past_due: 10 },
        { time: '2026-05-01', property_id: 'p3', tenant_id: 't6', amount_due: 15000, amount_paid: 15000, payment_status: 'paid', days_past_due: 0 },
        { time: '2026-05-01', property_id: 'p1', tenant_id: 't7', amount_due: 9800, amount_paid: 9800, payment_status: 'paid', days_past_due: 0 },
        { time: '2026-05-01', property_id: 'p2', tenant_id: 't8', amount_due: 6200, amount_paid: 0, payment_status: 'defaulted', days_past_due: 92 },
      ];
    const latestPayment = mockPayments.find(p => p.tenant_id === tenant.id);
    if (!latestPayment) {
      return { ...tenant, monthlyRent: 0, amountPaid: 0, amountOwed: 0, paymentStatus: 'paid', daysPastDue: 0 };
    }
    return { ...tenant, monthlyRent: latestPayment.amount_due, amountPaid: latestPayment.amount_paid, amountOwed: latestPayment.amount_due - latestPayment.amount_paid, paymentStatus: latestPayment.payment_status, daysPastDue: latestPayment.days_past_due };
  }), [tenants, paymentRecords]);

  // Filter tenants by property if one is selected
  const filteredTenants = useMemo(() => selectedPropertyId 
    ? tenantFinancials.filter(t => t.property_id === selectedPropertyId)
    : tenantFinancials
  , [tenantFinancials, selectedPropertyId]);

  // Sort data
  const sortedTenants = useMemo(() => [...filteredTenants].sort((a, b) => {
    const key = sortConfig.key as keyof typeof a;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    const aValue = a[key] as any;
    const bValue = b[key] as any;
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  }), [filteredTenants, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc' }));
  };

  // ... (getStatusBadge, getDaysPastDueCell, SortIndicator components remain the same)

  // Calculate summary stats
  const totalRentDue = tenantFinancials.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalCollected = tenantFinancials.reduce((sum, t) => sum + t.amountPaid, 0);
  const collectionRate = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;
  const problemTenants = tenantFinancials.filter(t => t.daysPastDue > 30).length;

  if (isLoadingTenants) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900 rounded-xl border border-slate-800">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="ml-4 text-slate-400">Loading tenant data...</p>
      </div>
    );
  }
  
  // ... (rest of the return statement with the table and summary cards is the same)
};
