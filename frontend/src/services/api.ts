import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';

const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolios`);
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    // Fallback to mock data if backend fails
    const { mockPortfolios } = await import('../data/mockRealEstateData');
    return mockPortfolios;
  }
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching properties:', error);
    // Fallback to mock data if backend fails
    const { getPropertiesByPortfolio: getMockProperties } = await import('../data/mockRealEstateData');
    return getMockProperties(portfolioId);
  }
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenants: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching tenants:', error);
    // Fallback to mock data if backend fails
    const { getTenantsByProperty: getMockTenants } = await import('../data/mockRealEstateData');
    return getMockTenants(propertyId);
  }
};
