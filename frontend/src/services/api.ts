import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';
import { mockPortfolios, mockProperties, getTenantsByProperty as getMockTenants, getPropertiesByPortfolio as getMockProperties } from '../data/mockRealEstateData';

// For now, use mock data until backend is deployed
// TODO: Switch to real API calls when backend is ready
// const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with real API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/portfolios`);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch portfolios');
  // }
  // return response.json();
  
  return mockPortfolios;
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // TODO: Replace with real API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
  // if (!response.ok) {
  //   throw new Error('Failed to properties');
  // }
  // return response.json();
  
  return getMockProperties(portfolioId);
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // TODO: Replace with real API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch tenants');
  // }
  // return response.json();
  
  return getMockTenants(propertyId);
};
