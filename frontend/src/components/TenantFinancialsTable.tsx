import { useState } from 'react';
import { ArrowUp, ArrowDown, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useRealSightStore, type Tenant, type PaymentRecord } from '../store/useRealSightStore';

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
    // TechStart Solutions - Paid on time
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't1', amount_due: 8500, amount_paid: 8500, payment_status: 'paid', days_past_due: 0 },
    
    // Metro Medical Group - Paid on time
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't2', amount_due: 12000, amount_paid: 12000, payment_status: 'paid', days_past_due: 0 },
    
    // Downtown Coffee Co. - Late (15 days)
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't3', amount_due: 4200, amount_paid: 0, payment_status: 'late', days_past_due: 15 },
    
    // Fashion Forward Boutique - Delinquent (45 days) - PROBLEM TENANT
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't4', amount_due: 3800, amount_paid: 0, payment_status: 'delinquent', days_past_due: 45 },
    
    // Quick Stop Grocery - Partial payment (10 days late)
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't5', amount_due: 5500, amount_paid: 2750, payment_status: 'partial', days_past_due: 10 },
    
    // Industrial Supply Inc. - Paid on time
    { time: '2026-05-01', property_id: 'p3', tenant_id: 't6', amount_due: 15000, amount_paid: 15000, payment_status: 'paid', days_past_due: 0 },
    
    // Legal Partners LLP - Paid on time
    { time: '2026-05-01', property_id: 'p1', tenant_id: 't7', amount_due: 9800, amount_paid: 9800, payment_status: 'paid', days_past_due: 0 },
    
    // Fitness First Gym - Defaulted (90+ days) - CRITICAL PROBLEM TENANT
    { time: '2026-05-01', property_id: 'p2', tenant_id: 't8', amount_due: 6200, amount_paid: 0, payment_status: 'defaulted', days_past_due: 92 },
  ];

  // Combine tenant info with latest payment record
  const tenantFinancials = mockTenants.map(tenant => {
    const latestPayment = mockPayments.find(p => p.tenant_id === tenant.id);
    const monthlyRent = latestPayment?.amount_due ?? 0;
    const amountPaid = latestPayment?.amount_paid ?? 0;
    
    return {
      ...tenant,
      monthlyRent,
      amountPaid,
      amountOwed: monthlyRent - amountPaid,
      paymentStatus: latestPayment?.payment_status ?? 'paid',
      daysPastDue: latestPayment?.days_past_due ?? 0,
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

  // Get days past due styling (highlight problem tenants)
  const getDaysPastDueCell = (days: number) => {
    if (days === 0) return <span className="text-emerald-400 font-medium">On Time</span>;
    if (days <= 15) return <span className="text-amber-400 font-medium">{days} days</span>;
    if (days <= 30) return <span className="text-orange-400 font-semibold">{days} days</span>;
    if (days <= 60) return <span className="text-red-400 font-bold">{days} days</span>;
    return <span className="text-red-500 font-black animate-pulse">{days}+ days ⚠️</span>;
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return <span className="opacity-0 group-hover:opacity-30">↕</span>;
    return sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />;
  };

  // Calculate summary stats
  const totalRentDue = tenantFinancials.reduce((sum, t) => sum + t.monthlyRent, 0);
  const totalCollected = tenantFinancials.reduce((sum, t) => sum + t.amountPaid, 0);
  const collectionRate = totalRentDue > 0 ? (totalCollected / totalRentDue) * 100 : 0;
  const problemTenants = tenantFinancials.filter(t => t.daysPastDue > 30).length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Total Tenants</p>
          <p className="text-2xl font-bold text-white mt-1">{tenantFinancials.length}</p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Monthly Rent Due</p>
          <p className="text-2xl font-bold text-white mt-1">${totalRentDue.toLocaleString()}</p>
        </div>
        <div className={`bg-slate-900 p-4 rounded-xl border ${collectionRate >= 90 ? 'border-emerald-500/30' : collectionRate >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Collection Rate</p>
          <p className={`text-2xl font-bold mt-1 ${collectionRate >= 90 ? 'text-emerald-400' : collectionRate >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {collectionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Problem Tenants</p>
          <p className={`text-2xl font-bold mt-1 ${problemTenants === 0 ? 'text-emerald-400' : problemTenants <= 2 ? 'text-amber-400' : 'text-red-400'}`}>
            {problemTenants}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th 
                  onClick={() => handleSort('businessName')}
                  className="group text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Tenant Name <SortIndicator columnKey="businessName" />
                </th>
                <th 
                  onClick={() => handleSort('propertyId')}
                  className="group text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300 hidden md:table-cell"
                >
                  Property <SortIndicator columnKey="propertyId" />
                </th>
                <th 
                  onClick={() => handleSort('monthlyRent')}
                  className="group text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Monthly Rent <SortIndicator columnKey="monthlyRent" />
                </th>
                <th 
                  onClick={() => handleSort('amountOwed')}
                  className="group text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Amount Owed <SortIndicator columnKey="amountOwed" />
                </th>
                <th 
                  onClick={() => handleSort('paymentStatus')}
                  className="group text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Status <SortIndicator columnKey="paymentStatus" />
                </th>
                <th 
                  onClick={() => handleSort('daysPastDue')}
                  className="group text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-300"
                >
                  Days Past Due <SortIndicator columnKey="daysPastDue" />
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedTenants.map((tenant) => (
                <tr 
                  key={tenant.id} 
                  className={`hover:bg-slate-800/50 transition-colors ${
                    tenant.daysPastDue > 30 ? 'bg-red-500/5' : tenant.daysPastDue > 15 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        tenant.credit_rating?.startsWith('A') ? 'bg-emerald-500' : 
                        tenant.credit_rating?.startsWith('B') ? 'bg-blue-500' : 'bg-orange-500'
                      }`} />
                      <div>
                        <div className="text-sm font-medium text-white">{tenant.business_name}</div>
                        <div className="text-xs text-slate-500">{tenant.business_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400 hidden md:table-cell">
                    {tenant.property_id === 'p1' ? 'Detroit Tech Center' : 
                     tenant.property_id === 'p2' ? 'Riverside Retail Plaza' :
                     tenant.property_id === 'p3' ? 'Industrial Warehouse A' : 'Unknown'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-white">${tenant.monthlyRent.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${
                      tenant.amountOwed === 0 ? 'text-emerald-400' : 
                      tenant.amountOwed <= tenant.monthlyRent / 2 ? 'text-blue-400' : 'text-red-400'
                    }`}>
                      ${tenant.amountOwed.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(tenant.paymentStatus)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getDaysPastDueCell(tenant.daysPastDue)}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {sortedTenants.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No tenants found</p>
            <p className="text-sm text-slate-500 mt-1">Select a portfolio and property to view tenant financials</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span className="font-medium">Payment Status:</span>
        {getStatusBadge('paid')}
        {getStatusBadge('partial')}
        {getStatusBadge('late')}
        {getStatusBadge('delinquent')}
        {getStatusBadge('defaulted')}
      </div>
    </div>
  );
};
