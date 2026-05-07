import { create } from 'zustand';
import { getPortfolios, getPropertiesByPortfolio, getTenantsByProperty, getTenantsByPortfolio } from '../services/api';

// ... (keep all the existing type definitions: Tab, DateFilter, Portfolio, etc.)

export type Tab = 'overview' | 'tenant-financials' | 'portfolio-performance' | 'acquisition';
export type DateFilter = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'ytd' | 'custom';

export interface Portfolio {
  id: string; name: string; owner_name?: string; headquarters_city?: string; headquarters_state?: string; subscription_tier?: string;
}
export interface Property {
  id: string; portfolio_id: string; name: string; address?: string; city?: string; state?: string; property_type?: 'Retail' | 'Office' | 'Industrial' | 'Mixed-Use'; total_square_feet?: number; unit_count?: number; is_acquisition_target?: boolean; acquisition_score?: number;
}
export interface Tenant {
  id: string; property_id: string; business_name: string; business_type?: string; contact_email?: string; credit_rating?: string;
  lease?: Lease; currentPayment?: PaymentRecord;
}
export interface Lease {
  id: string; tenant_id: string; property_id: string; lease_start_date: string; lease_end_date: string; monthly_rent: number; rent_per_sqft?: number; square_footage?: number; lease_type?: 'NNN' | 'Gross' | 'Modified Gross'; status?: 'active' | 'expired' | 'terminated';
}
export interface PaymentRecord {
  time: string; property_id: string; tenant_id: string; amount_due: number; amount_paid: number; payment_status: 'paid' | 'partial' | 'late' | 'delinquent' | 'defaulted'; days_past_due: number; late_fee_assessed?: number;
}

interface RealSightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  
  portfolios: Portfolio[];
  properties: Property[];
  tenants: Tenant[];
  paymentRecords: PaymentRecord[];
  
  selectedPortfolioId: string | null;
  selectedPropertyId: string | null;
  
  isLoadingPortfolios: boolean;
  isLoadingProperties: boolean;
  isLoadingTenants: boolean;

  fetchPortfolios: () => Promise<void>;
  selectPortfolio: (portfolioId: string | null) => Promise<void>;
  selectProperty: (propertyId: string | null) => Promise<void>;
}

export const useRealSightStore = create<RealSightState>((set, get) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  portfolios: [],
  properties: [],
  tenants: [],
  paymentRecords: [],
  
  selectedPortfolioId: null,
  selectedPropertyId: null,
  
  isLoadingPortfolios: false,
  isLoadingProperties: false,
  isLoadingTenants: false,

  fetchPortfolios: async () => {
    set({ isLoadingPortfolios: true });
    try {
      const portfolios = await getPortfolios();
      set({ portfolios, isLoadingPortfolios: false });
      if (portfolios.length > 0) {
        await get().selectPortfolio(portfolios[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch portfolios", error);
      set({ isLoadingPortfolios: false });
    }
  },

  selectPortfolio: async (portfolioId: string | null) => {
    set({ selectedPortfolioId: portfolioId, isLoadingProperties: true, properties: [], tenants: [], selectedPropertyId: null });
    if (portfolioId) {
      try {
        const [properties, tenants] = await Promise.all([
          getPropertiesByPortfolio(portfolioId),
          getTenantsByPortfolio(portfolioId),
        ]);
        set({ properties, tenants, isLoadingProperties: false, isLoadingTenants: false });
      } catch (error) {
        console.error('Failed to fetch portfolio data', error);
        set({ isLoadingProperties: false, isLoadingTenants: false });
      }
    } else {
      set({ properties: [], tenants: [], isLoadingProperties: false });
    }
  },

  selectProperty: async (propertyId: string | null) => {
    set({ selectedPropertyId: propertyId, isLoadingTenants: true, tenants: [] });
    const portfolioId = get().selectedPortfolioId;
    try {
      // null = All Properties → load all tenants for the whole portfolio
      const tenants = propertyId
        ? await getTenantsByProperty(propertyId)
        : portfolioId ? await getTenantsByPortfolio(portfolioId) : [];
      set({ tenants, isLoadingTenants: false });
    } catch (error) {
      console.error('Failed to fetch tenants', error);
      set({ isLoadingTenants: false });
    }
  },
}));
