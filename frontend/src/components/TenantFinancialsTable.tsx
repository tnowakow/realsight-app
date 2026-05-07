import { useMemo } from 'react';
import { useRealSightStore } from '../store/useRealSightStore';

export const TenantFinancialsTable: React.FC = () => {
  const { tenants, isLoadingTenants } = useRealSightStore();

  const tenantFinancials = useMemo(() => tenants.map(tenant => ({ 
    ...tenant,
    amountOwed: 1000, 
    paymentStatus: 'late',
  })), [tenants]);

  if (isLoadingTenants) {
    return <div>Loading tenants...</div>;
  }

  return (
    <div>
      <h2>Tenant Financials</h2>
      {tenantFinancials.length > 0 ? (
        <ul>
          {tenantFinancials.map(tenant => (
            <li key={tenant.id}>
              {tenant.business_name}: ${tenant.amountOwed} ({tenant.paymentStatus})
            </li>
          ))}
        </ul>
      ) : (
        <p>No tenants to display.</p>
      )}
    </div>
  );
};
