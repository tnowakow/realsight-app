import { create } from 'zustand';

export type Tab = 'overview' | 'tenant-financials' | 'portfolio-performance' | 'acquisition';
export type DateFilter = 'today' | 'this-week' | 'this-month' | 'last-month' | 'this-quarter' | 'ytd' | 'custom';

// Real Estate Domain Entities
export interface Portfolio {
  id: string;
  name: string;
  owner_name?: string;
  headquarters_city?: string;
  headquarters_state?: string;
  subscription_tier?: string;
}

export interface Property {
  id: string;
  portfolio_id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  property_type?: 'Retail' | 'Office' | 'Industrial' | 'Mixed-Use';
  total_square_feet?: number;
  unit_count?: number;
  is_acquisition_target?: boolean;
  acquisition_score?: number;
}

export interface Tenant {
  id: string;
  property_id: string;
  business_name: string;
  business_type?: string;
  contact_email?: string;
  credit_rating?: string;
}

export interface Lease {
  id: string;
  tenant_id: string;
  property_id: string;
  lease_start_date: string;
  lease_end_date: string;
  monthly_rent: number;
  rent_per_sqft?: number;
  square_footage?: number;
  lease_type?: 'NNN' | 'Gross' | 'Modified Gross';
  status?: 'active' | 'expired' | 'terminated';
}

export interface PaymentRecord {
  time: string;
  property_id: string;
  tenant_id: string;
  amount_due: number;
  amount_paid: number;
  payment_status: 'paid' | 'partial' | 'late' | 'delinquent' | 'defaulted';
  days_past_due: number;
  late_fee_assessed?: number;
}

interface RealSightState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
  lastUpdated: string;
  setLastUpdated: (timestamp: string) => void;
  
  // Portfolio selector state
  portfolios: Portfolio[];
  setPortfolios: (portfolios: Portfolio[]) => void;
  selectedPortfolioId: string | null;
  setSelectedPortfolioId: (portfolioId: string | null) => void;
  
  // Property drill-down
  properties: Property[];
  setProperties: (properties: Property[]) => void;
  selectedPropertyId: string | null;
  setSelectedPropertyId: (propertyId: string | null) => void;
  
  // Tenant data
  tenants: Tenant[];
  setTenants: (tenants: Tenant[]) => void;
  
  // Payment records
  paymentRecords: PaymentRecord[];
  setPaymentRecords: (records: PaymentRecord[]) => void;
  
  isLoadingData: boolean;
  setIsLoadingData: (loading: boolean) => void;
}

export const useRealSightStore = create<RealSightState>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
  dateFilter: 'this-month',
  setDateFilter: (filter) => set({ dateFilter: filter }),
  lastUpdated: new Date().toLocaleString(),
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
  
  // Portfolio defaults
  portfolios: [],
  setPortfolios: (portfolios) => set({ portfolios }),
  selectedPortfolioId: null,
  setSelectedPortfolioId: (portfolioId) => set({ selectedPortfolioId: portfolioId }),
  
  // Property defaults
  properties: [],
  setProperties: (properties) => set({ properties }),
  selectedPropertyId: null,
  setSelectedPropertyId: (propertyId) => set({ selectedPropertyId: propertyId }),
  
  // Tenant defaults
  tenants: [],
  setTenants: (tenants) => set({ tenants }),
  
  // Payment records
  paymentRecords: [],
  setPaymentRecords: (records) => set({ paymentRecords: records }),
  
  isLoadingData: false,
  setIsLoadingData: (loading) => set({ isLoadingData: loading }),
}));
