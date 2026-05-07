import type { Portfolio, Property, Tenant } from '../store/useRealSightStore';
import { mockPortfolios, getPropertiesByPortfolio as getMockProperties, getTenantsByProperty as getMockTenants } from '../data/mockRealEstateData';

const API_BASE_URL = 'https://realsight-app-production.up.railway.app/api';

export const getPortfolios = async (): Promise<Portfolio[]> => {
  try {
    console.log('🔄 Fetching portfolios from backend...');
    const response = await fetch(`${API_BASE_URL}/portfolios`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Loaded ${data.length} portfolio(s) from backend`);
      return data;
    }
    
    throw new Error('Backend returned empty array');
  } catch (error) {
    console.error('❌ Backend error, falling back to mock:', error);
    console.log('📦 Using mock portfolios for demo');
    return mockPortfolios;
  }
};

export const getPropertiesByPortfolio = async (portfolioId: string): Promise<Property[]> => {
  try {
    console.log(`🔄 Fetching properties for portfolio ${portfolioId}...`);
    const response = await fetch(`${API_BASE_URL}/properties?portfolio_id=${portfolioId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Loaded ${data.length} property(ies) from backend`);
      return data;
    }
    
    throw new Error('Backend returned empty array');
  } catch (error) {
    console.error('❌ Backend error, falling back to mock:', error);
    console.log(`📦 Using mock properties for portfolio ${portfolioId}`);
    return getMockProperties(portfolioId);
  }
};

export const getTenantsByProperty = async (propertyId: string): Promise<Tenant[]> => {
  try {
    console.log(`🔄 Fetching tenants for property ${propertyId}...`);
    const response = await fetch(`${API_BASE_URL}/tenants?property_id=${propertyId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`✅ Loaded ${data.length} tenant(s) from backend`);
      return data;
    }
    
    throw new Error('Backend returned empty array');
  } catch (error) {
    console.error('❌ Backend error, falling back to mock:', error);
    console.log(`📦 Using mock tenants for property ${propertyId}`);
    return getMockTenants(propertyId);
  }
};
