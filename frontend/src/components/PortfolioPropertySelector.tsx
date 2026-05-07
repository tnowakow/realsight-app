import { useState, useEffect } from 'react';
import { ChevronDown, Building2, TrendingUp } from 'lucide-react';
import { useRealSightStore, type Portfolio, type Property } from '../store/useRealSightStore';

export const PortfolioPropertySelector = () => {
  const { 
    portfolios, 
    setPortfolios, 
    selectedPortfolioId, 
    setSelectedPortfolioId,
    properties,
    setProperties,
    selectedPropertyId,
    setSelectedPropertyId,
    setIsLoadingData 
  } = useRealSightStore();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);
  const [isLoadingPortfolios, setIsLoadingPortfolios] = useState(portfolios.length === 0);

  // Mock data for initial load (will be replaced by API)
  useEffect(() => {
    if (portfolios.length === 0) {
      const mockPortfolios: Portfolio[] = [
        { id: '1', name: 'Midwest Commercial Properties', owner_name: 'Tom Nowakowski', headquarters_city: 'Detroit', headquarters_state: 'MI' },
        { id: '2', name: 'Great Lakes Retail Group', owner_name: 'John Smith', headquarters_city: 'Chicago', headquarters_state: 'IL' },
        { id: '3', name: 'Industrial Park Holdings', owner_name: 'Sarah Johnson', headquarters_city: 'Cleveland', headquarters_state: 'OH' },
      ];
      setPortfolios(mockPortfolios);
      
      if (mockPortfolios.length > 0 && !selectedPortfolioId) {
        setSelectedPortfolioId(mockPortfolios[0].id);
      }
    }
  }, []);

  // Load properties when portfolio changes
  useEffect(() => {
    if (!selectedPortfolioId) return;
    
    const loadProperties = async () => {
      setIsLoadingData(true);
      
      // Mock properties based on selected portfolio (will be replaced by API call)
      const mockProperties: Property[] = [
        { id: 'p1', portfolio_id: selectedPortfolioId, name: 'Detroit Tech Center', address: '1234 Woodward Ave', city: 'Detroit', state: 'MI', property_type: 'Office', total_square_feet: 50000, unit_count: 25 },
        { id: 'p2', portfolio_id: selectedPortfolioId, name: 'Riverside Retail Plaza', address: '5678 River Rd', city: 'Detroit', state: 'MI', property_type: 'Retail', total_square_feet: 30000, unit_count: 12 },
        { id: 'p3', portfolio_id: selectedPortfolioId, name: 'Industrial Warehouse A', address: '999 Commerce Dr', city: 'Dearborn', state: 'MI', property_type: 'Industrial', total_square_feet: 75000, unit_count: 4 },
        { id: 'p4', portfolio_id: selectedPortfolioId, name: 'Mixed-Use Downtown', address: '200 Main St', city: 'Ann Arbor', state: 'MI', property_type: 'Mixed-Use', total_square_feet: 45000, unit_count: 18 },
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setProperties(mockProperties);
        if (mockProperties.length > 0 && !selectedPropertyId) {
          setSelectedPropertyId(mockProperties[0].id);
        }
        setIsLoadingData(false);
      }, 300);
    };

    loadProperties();
  }, [selectedPortfolioId]);

  const handlePortfolioSelect = (portfolioId: string) => {
    if (portfolioId === selectedPortfolioId) return;
    
    setDropdownOpen(false);
    setSelectedPortfolioId(portfolioId);
    setSelectedPropertyId(null); // Reset property selection when portfolio changes
  };

  const handlePropertySelect = (propertyId: string) => {
    if (propertyId === selectedPropertyId) return;
    
    setPropertyDropdownOpen(false);
    setSelectedPropertyId(propertyId);
  };

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
  const filteredProperties = properties.filter(p => p.portfolio_id === selectedPortfolioId);
  const selectedProperty = filteredProperties.find(p => p.id === selectedPropertyId);

  if (isLoadingPortfolios) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-400">Loading portfolios...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Portfolio Selector */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-slate-300">
            {selectedPortfolio?.name || 'Select Portfolio'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => handlePortfolioSelect(portfolio.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedPortfolioId === portfolio.id
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{portfolio.name}</div>
                  {portfolio.owner_name && (
                    <div className="text-xs text-slate-500 mt-0.5">Owner: {portfolio.owner_name}</div>
                  )}
                  {selectedPortfolioId === portfolio.id && (
                    <svg className="w-4 h-4 text-blue-400 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Selector (only shown when portfolio is selected) */}
      {selectedPortfolioId && filteredProperties.length > 1 && (
        <div className="relative">
          <button
            onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-slate-300">
              {selectedProperty?.name || 'All Properties'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {propertyDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPropertyDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
                {/* Option to view all properties */}
                <button
                  onClick={() => {
                    setSelectedPropertyId(null);
                    setPropertyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    !selectedPropertyId
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="font-medium">📊 All Properties in Portfolio</span>
                  {!selectedPropertyId && (
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Individual properties */}
                {filteredProperties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      selectedPropertyId === property.id
                        ? 'bg-emerald-600/20 text-emerald-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {property.property_type} • {property.total_square_feet?.toLocaleString()} sqft
                        </div>
                      </div>
                      {selectedPropertyId === property.id && (
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Acquisition Target Badge (if selected property is a target) */}
      {selectedProperty?.is_acquisition_target && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
          <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">Target</span>
        </div>
      )}
    </div>
  );
};
