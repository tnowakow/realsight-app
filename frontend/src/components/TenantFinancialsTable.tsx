import { useState } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { type Tenant, type PaymentRecord } from '../store/useRealSightStore';

interface TenantFinancialsTableProps {
  selectedPropertyId?: string | null;
}

export const TenantFinancialsTable: React.FC<TenantFinancialsTableProps> = ({ selectedPropertyId }) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'daysPastDue',
    direction: 'desc',
  });

  // Mock data for tenants and payments (will be replaced by API)
  const mockTenants: Tenant[] = [
    { id: 't1', property_id: 'p1', business_name: 'TechStart Solutions', business_type: 'Technology', contact_email: 'billing@techstart.com', credit_rating: 'A' },
    { id: 't2', property_id: 'p1', business_name: 'Metro Medical Group', business_type: 'Healthcare', contact_email: 'accounts@metromedical.com', credit_rating: 'A+' },
    { id: 't3', property_id: 'p1', business_name: 'Downtown Coffee Co.', business_type: 'Retail', contact_email: 'finance@downtowncoffee.com', credit_rating: 'B' },
    { id: 't4', property_id: 'p2', business_name: 'Fashion Forward Boutique', business_type: 'Retail', contact_email: 'payments@fashionforward.com', credit_rating: 'C+' },
    { id: 't5', property_id: 'p2', business_name: 'Quick Stop Grocery', business_type: 'Retail', contact_email: 'billing@quickstop.com', credit_rating: 'B-' },
    { id: 't6', property_id: 'p3', business_name: 'Industrial Supply Inc.', business_type: 'Wholesale', contact_email: 'ap@industrialsupply.com', credit_rating: 'A' },
    { id: 't7', property_id: 'p1', business_name: 'Legal Partners LLP', business_type: 'Professional Services', contact_email: 'admin@legalpartners.com', credit_rating: 'A+' },
    { id: 't8', property_id: 'p2', business_name: 'Fitness First Gym', business_type: 'Retail', contact_email: 'billing@fitnessfirst.com', credit_rating: 'C' },
  ];

  const mockPayments: PaymentRecord[] = [
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't1', amount_due: 8500, amount_paid: 8500, payment_status: 'paid', days_past_due: 0 },
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't2', amount_due: 12000, amount_paid: 12000, payment_status: 'paid', days_past_due: 0 },
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't3', amount_due: 4200, amount_paid: 0, payment_status: 'late', days_past_due: 15 },
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't4', amount_due: 3800, amount_paid: 0, payment_status: 'delinquent', days_past_due: 45 },
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't5', amount_due: 5500, amount_paid: 2750, payment_status: 'partial', days_past_due: 10 },
    { time: '2026-05-01', property_id: 'p3', tenant_id: 't6', amount_due: 15000, amount_paid: 15000, payment_status: 'paid', days_past_due: 0 },
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't7', amount_due: 9800, amount_paid: 9800, payment_status: 'paid', days_past_due: 0 },
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't8', amount_due: 6200, amount_paid: 0, payment_status: 'defaulted', days_past_due: 92 },
  ];

  // This is the corrected and robust data mapping function.
  const tenantFinancials = mockTenants.map(tenant => {
    const latestPayment = mockPayments.find(p => p.tenant_id === tenant.id);
    
    // Explicitly handle cases where a tenant might not have a payment record.
    if (!latestPayment) {
      return {
        ...tenant,
        monthlyRent: 0,
        amountPaid: 0,
        amountOwed: 0,
        paymentStatus: 'paid', // Default to 'paid' if no records exist
        daysPastDue: 0,
      };
    }
    
    // If a payment record exists, we can safely access its properties.
    return {
      ...tenant,
      monthlyRent: latestPayment.amount_due,
      amountPaid: latestPayment.amount_paid,
      amountOwed: latestPayment.amount_due - latestPayment.amount_paid,
      paymentStatus: latestPayment.payment_status,
      daysPastDue: latestPayment.days_past_due,
    };
  });

  // Filter by selected property if specified
  const filteredTenants = selectedPropertyId 
    ? tenantFinancials.filter(t => t.property_id === selectedPropertyId)
    : tenantFinancials;

  // Sort data
  const sortedTenants = [...filteredTenants].sort((a, b) => {
    const key = sortConfig.key as keyof typeof a;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    if (a[key] < b[key]) return -1 * direction;
    if (a[key] > b[key]) return 1 * direction;
    return 0;
  });

  // Handle column clicks for sorting
  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Paid</span>;
      case 'partial':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium"><Clock className="w-3 h-3" /> Partial</span>;
      case 'late':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Late</span>;
      case 'delinquent':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Delinquent</span>;
      case 'defaulted':
        return <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-600/30 text-xs font-medium"><AlertTriangle className="w-3 h-3" /> Defaulted</span>;
      default:
        return <span className="px-2 py-1 rounded-full bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs font-medium">Unknown</span>;
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
    if (sortConfig.key !== columnKey) return <span className="opacity-0 group-hover:opacity-30">↕</span>;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />;
  };

  const totalRentDue = tenantFinancials.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalCollected = tenantFinancials.reduce((sum, t) => sum + t.amountPaid, 0);
  const collectionRate = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;
  const problemTenants = tenantFinancials.filter(t => t.daysPastDue > 30).length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* ... (rest of the component is unchanged) ... */}
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {/* ... */}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {/* ... */}
      </div>
    </div>
  );
};
