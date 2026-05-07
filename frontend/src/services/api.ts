import { Portfolio, Property, Tenant } from '../store/useRealSightStore';

const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  const response = await fetch(`${API_BASE_URL}/portfolios`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolios');
  }
  return response.json();
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch properties');
  }
  return response.json();
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tenants');
  }
  return response.json();
};
