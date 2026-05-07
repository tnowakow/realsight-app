import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';

// Mock portfolios (holding companies)
export const mockPortfolios: Portfolio[] = [
  {
    id: 'portfolio-1',
    name: 'Midwest Commercial Properties LLC',
    owner_name: 'Tom Nowakowski',
    headquarters_city: 'Detroit',
    headquarters_state: 'MI',
    subscription_tier: 'Enterprise'
  },
  {
    id: 'portfolio-2',
    name: 'Great Lakes Retail Holdings',
    owner_name: 'Sarah Mitchell',
    headquarters_city: 'Chicago',
    headquarters_state: 'IL',
    subscription_tier: 'Professional'
  },
  {
    id: 'portfolio-3',
    name: 'Industrial Park Ventures',
    owner_name: 'Marcus Chen',
    headquarters_city: 'Cleveland',
    headquarters_state: 'OH',
    subscription_tier: 'Enterprise'
  }
];

// Mock properties (commercial buildings)
export const mockProperties: Property[] = [
  // Portfolio 1 - Midwest Commercial Properties
  { id: 'prop-1', portfolio_id: 'portfolio-1', name: 'Detroit Tech Center', address: '1500 Woodward Ave', city: 'Detroit', state: 'MI', property_type: 'Office', total_square_feet: 45000, unit_count: 12 },
  { id: 'prop-2', portfolio_id: 'portfolio-1', name: 'Riverfront Retail Plaza', address: '890 River St', city: 'Detroit', state: 'MI', property_type: 'Retail', total_square_feet: 32000, unit_count: 8 },
  { id: 'prop-3', portfolio_id: 'portfolio-1', name: 'Ann Arbor Medical Office', address: '456 State St', city: 'Ann Arbor', state: 'MI', property_type: 'Office', total_square_feet: 28000, unit_count: 7 },
  { id: 'prop-4', portfolio_id: 'portfolio-1', name: 'Grand Rapids Warehouse', address: '2200 Industrial Blvd', city: 'Grand Rapids', state: 'MI', property_type: 'Industrial', total_square_feet: 65000, unit_count: 5 },
  
  // Portfolio 2 - Great Lakes Retail Holdings
  { id: 'prop-5', portfolio_id: 'portfolio-2', name: 'Chicago Loop Office Tower', address: '180 N Michigan Ave', city: 'Chicago', state: 'IL', property_type: 'Office', total_square_feet: 120000, unit_count: 24 },
  { id: 'prop-6', portfolio_id: 'portfolio-2', name: 'Naperville Shopping Center', address: '1500 Ogden Ave', city: 'Naperville', state: 'IL', property_type: 'Retail', total_square_feet: 85000, unit_count: 18 },
  { id: 'prop-7', portfolio_id: 'portfolio-2', name: 'Evanston Mixed Use', address: '300 Chicago Ave', city: 'Evanston', state: 'IL', property_type: 'Mixed-Use', total_square_feet: 42000, unit_count: 14 },
  
  // Portfolio 3 - Industrial Park Ventures
  { id: 'prop-8', portfolio_id: 'portfolio-3', name: 'Cleveland Distribution Hub', address: '5500 Market St', city: 'Cleveland', state: 'OH', property_type: 'Industrial', total_square_feet: 150000, unit_count: 8 },
  { id: 'prop-9', portfolio_id: 'portfolio-3', name: 'Akron Manufacturing Park', address: '7800 Industrial Pkwy', city: 'Akron', state: 'OH', property_type: 'Industrial', total_square_feet: 200000, unit_count: 12 },
];

// Mock tenants with leases and payment data
export const mockTenants: Tenant[] = [
  // Detroit Tech Center (prop-1) - 12 units
  { id: 'tenant-1', property_id: 'prop-1', business_name: 'TechStart Solutions', business_type: 'Technology', contact_email: 'admin@techstart.com', credit_rating: 'A', lease: { id: 'lease-1', tenant_id: 'tenant-1', property_id: 'prop-1', lease_start_date: '2024-01-01', lease_end_date: '2029-12-31', monthly_rent: 8500, rent_per_sqft: 28.50, square_footage: 3000, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-1', tenant_id: 'tenant-1', amount_due: 8500, amount_paid: 8500, payment_status: 'paid', days_past_due: 0 } },
  { id: 'tenant-2', property_id: 'prop-1', business_name: 'DataFlow Analytics', business_type: 'Technology', contact_email: 'billing@dataflow.io', credit_rating: 'B+', lease: { id: 'lease-2', tenant_id: 'tenant-2', property_id: 'prop-1', lease_start_date: '2023-06-01', lease_end_date: '2028-05-31', monthly_rent: 12000, rent_per_sqft: 30.00, square_footage: 4000, lease_type: 'Modified Gross', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-1', tenant_id: 'tenant-2', amount_due: 12000, amount_paid: 6000, payment_status: 'partial', days_past_due: 28 } },
  { id: 'tenant-3', property_id: 'prop-1', business_name: 'CloudNine Consulting', business_type: 'Professional Services', contact_email: 'accounts@cloudnine.com', credit_rating: 'A-', lease: { id: 'lease-3', tenant_id: 'tenant-3', property_id: 'prop-1', lease_start_date: '2025-03-01', lease_end_date: '2030-02-28', monthly_rent: 6800, rent_per_sqft: 27.20, square_footage: 2500, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-1', tenant_id: 'tenant-3', amount_due: 6800, amount_paid: 6800, payment_status: 'paid', days_past_due: 0 } },
  { id: 'tenant-4', property_id: 'prop-1', business_name: 'Metro Financial Group', business_type: 'Financial Services', contact_email: 'leasing@metrofin.com', credit_rating: 'A+', lease: { id: 'lease-4', tenant_id: 'tenant-4', property_id: 'prop-1', lease_start_date: '2022-09-01', lease_end_date: '2032-08-31', monthly_rent: 15000, rent_per_sqft: 30.00, square_footage: 5000, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-1', tenant_id: 'tenant-4', amount_due: 15000, amount_paid: 0, payment_status: 'delinquent', days_past_due: 42 } },
  
  // Riverfront Retail Plaza (prop-2) - 8 units
  { id: 'tenant-5', property_id: 'prop-2', business_name: 'Urban Fitness Studio', business_type: 'Fitness & Recreation', contact_email: 'info@urbanfitness.com', credit_rating: 'B', lease: { id: 'lease-5', tenant_id: 'tenant-5', property_id: 'prop-2', lease_start_date: '2024-07-01', lease_end_date: '2029-06-30', monthly_rent: 9500, rent_per_sqft: 38.00, square_footage: 2500, lease_type: 'Modified Gross', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-2', tenant_id: 'tenant-5', amount_due: 9500, amount_paid: 9500, payment_status: 'paid', days_past_due: 0 } },
  { id: 'tenant-6', property_id: 'prop-2', business_name: 'Gourmet Market Fresh', business_type: 'Retail - Grocery', contact_email: 'corporate@gourmetmarket.com', credit_rating: 'A', lease: { id: 'lease-6', tenant_id: 'tenant-6', property_id: 'prop-2', lease_start_date: '2023-01-01', lease_end_date: '2033-12-31', monthly_rent: 18000, rent_per_sqft: 45.00, square_footage: 4000, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-2', tenant_id: 'tenant-6', amount_due: 18000, amount_paid: 18000, payment_status: 'paid', days_past_due: 0 } },
  { id: 'tenant-7', property_id: 'prop-2', business_name: 'Style & Co Boutique', business_type: 'Retail - Fashion', contact_email: 'owner@styleandco.com', credit_rating: 'C+', lease: { id: 'lease-7', tenant_id: 'tenant-7', property_id: 'prop-2', lease_start_date: '2025-01-01', lease_end_date: '2030-12-31', monthly_rent: 4200, rent_per_sqft: 42.00, square_footage: 1000, lease_type: 'Modified Gross', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-2', tenant_id: 'tenant-7', amount_due: 4200, amount_paid: 1000, payment_status: 'defaulted', days_past_due: 67 } },
  
  // Ann Arbor Medical Office (prop-3) - 7 units
  { id: 'tenant-8', property_id: 'prop-3', business_name: 'Ann Arbor Dental Associates', business_type: 'Healthcare - Dental', contact_email: 'admin@aadental.com', credit_rating: 'A', lease: { id: 'lease-8', tenant_id: 'tenant-8', property_id: 'prop-3', lease_start_date: '2021-04-01', lease_end_date: '2031-03-31', monthly_rent: 11000, rent_per_sqft: 36.67, square_footage: 3000, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-3', tenant_id: 'tenant-8', amount_due: 11000, amount_paid: 11000, payment_status: 'paid', days_past_due: 0 } },
  { id: 'tenant-9', property_id: 'prop-3', business_name: 'Physical Therapy Plus', business_type: 'Healthcare - PT', contact_email: 'billing@ptplus.com', credit_rating: 'B+', lease: { id: 'lease-9', tenant_id: 'tenant-9', property_id: 'prop-3', lease_start_date: '2024-10-01', lease_end_date: '2029-09-30', monthly_rent: 7500, rent_per_sqft: 37.50, square_footage: 2000, lease_type: 'Modified Gross', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-3', tenant_id: 'tenant-9', amount_due: 7500, amount_paid: 7500, payment_status: 'paid', days_past_due: 0 } },
  
  // Grand Rapids Warehouse (prop-4) - 5 units
  { id: 'tenant-10', property_id: 'prop-4', business_name: 'Midwest Distribution Co', business_type: 'Logistics', contact_email: 'leasing@midwestdist.com', credit_rating: 'A-', lease: { id: 'lease-10', tenant_id: 'tenant-10', property_id: 'prop-4', lease_start_date: '2023-03-01', lease_end_date: '2033-02-28', monthly_rent: 28000, rent_per_sqft: 8.00, square_footage: 35000, lease_type: 'NNN', status: 'active' }, currentPayment: { time: '2026-05-07T00:00:00Z', property_id: 'prop-4', tenant_id: 'tenant-10', amount_due: 28000, amount_paid: 28000, payment_status: 'paid', days_past_due: 0 } },
];

// Helper to get tenants by property (for demo)
export const getTenantsByProperty = (propertyId: string): Tenant[] => {
  return mockTenants.filter(tenant => tenant.property_id === propertyId);
};

// Helper to get properties by portfolio (for demo)
export const getPropertiesByPortfolio = (portfolioId: string): Property[] => {
  return mockProperties.filter(prop => prop.portfolio_id === portfolioId);
};
