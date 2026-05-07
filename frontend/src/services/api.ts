import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';
import { mockPortfolios, getPropertiesByPortfolio as getMockProperties, getTenantsByProperty as getMockTenants } from '../data/mockRealEstateData';

const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

// For now, use mock data as primary source since backend doesn't have PostgreSQL attached
// TODO: Switch to real API calls when Railway PostgreSQL service is added and seeded

export const getPortfolios = async (): Promise<Portfolio[]> => {
  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));
  
  try {
    const response = await fetch(`${API_BASE_URL}/portfolios`);
    if (!response.ok) throw new Error('Backend not ready');
    
    const data = await response.json();
    // Only use backend data if it returns 3+ portfolios
    if (Array.isArray(data) && data.length >= 3) {
      console.log('✅ Using real backend portfolios');
      return data;
    }
  } catch (error) {
    console.log('ℹ️ Backend not ready, using mock portfolios');
  }
  
  return mockPortfolios;
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
    if (!response.ok) throw new Error('Backend not ready');
    
    const data = await response.json();
    // Only use backend data if it returns properties for this portfolio
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Using real backend properties for ${portfolioId}`);
      return data;
    }
  } catch (error) {
    console.log(`ℹ️ Backend not ready, using mock properties for ${portfolioId}`);
  }
  
  return getMockProperties(portfolioId);
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
    if (!response.ok) throw new Error('Backend not ready');
    
    const data = await response.json();
    // Only use backend data if it returns tenants for this property
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Using real backend tenants for ${propertyId}`);
      return data;
    }
  } catch (error) {
    console.log(`ℹ️ Backend not ready, using mock tenants for ${propertyId}`);
  }
  
  return getMockTenants(propertyId);
};
