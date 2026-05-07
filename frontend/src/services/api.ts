import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';
import { mockPortfolios, getPropertiesByPortfolio as getMockProperties, getTenantsByProperty as getMockTenants } from '../data/mockRealEstateData';

const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/portfolios`);
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolios: ${response.statusText}`);
    }
    const data = await response.json();
    
    // If backend returns empty or only 1 portfolio, supplement with mock data for demo
    if (!Array.isArray(data) || data.length < 3) {
      console.log('Backend returned limited portfolios, using mock data for demo');
      return mockPortfolios;
    }
    return data;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return mockPortfolios;
  }
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    const data = await response.json();
    
    // If backend returns empty array for this portfolio, use mock data
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`No properties found for portfolio ${portfolioId}, using mock data`);
      return getMockProperties(portfolioId);
    }
    return data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return getMockProperties(portfolioId);
  }
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tenants: ${response.statusText}`);
    }
    const data = await response.json();
    
    // If backend returns empty array for this property, use mock data
    if (!Array.isArray(data) || data.length === 0) {
      console.log(`No tenants found for property ${propertyId}, using mock data`);
      return getMockTenants(propertyId);
    }
    return data;
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return getMockTenants(propertyId);
  }
};
