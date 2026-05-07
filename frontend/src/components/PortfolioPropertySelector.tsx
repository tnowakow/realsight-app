import { useState } from 'react';
import { ChevronDown, Building2, TrendingUp } from 'lucide-react';
import { useRealSightStore } from '../store/useRealSightStore';

export const PortfolioPropertySelector = () => {
  const { 
    portfolios, 
    selectedPortfolioId, 
    selectPortfolio,
    properties,
    selectedPropertyId,
    selectProperty,
    isLoadingPortfolios,
    isLoadingProperties
  } = useRealSightStore();
  
  const [portfolioDropdownOpen, setPortfolioDropdownOpen] = useState(false);
  const [propertyDropdownOpen, setPropertyDropdownOpen] = useState(false);

  const handlePortfolioSelect = (portfolioId: string) => {
    setPortfolioDropdownOpen(false);
    if (portfolioId !== selectedPortfolioId) {
      selectPortfolio(portfolioId);
    }
  };

  const handlePropertySelect = (propertyId: string | null) => {
    setPropertyDropdownOpen(false);
    if (propertyId !== selectedPropertyId) {
      selectProperty(propertyId);
    }
  };

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);

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
          onClick={() => setPortfolioDropdownOpen(!portfolioDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <Building2 className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-slate-300">
            {selectedPortfolio?.name || 'Select Portfolio'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </button>

        {portfolioDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPortfolioDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => handlePortfolioSelect(portfolio.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors relative ${
                    selectedPortfolioId === portfolio.id ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-medium">{portfolio.name}</div>
                  {portfolio.owner_name && <div className="text-xs text-slate-500 mt-0.5">Owner: {portfolio.owner_name}</div>}
                  {selectedPortfolioId === portfolio.id && <svg className="w-4 h-4 text-blue-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Property Selector */}
      {selectedPortfolioId && (
        <div className="relative">
          <button
            onClick={() => setPropertyDropdownOpen(!propertyDropdownOpen)}
            disabled={isLoadingProperties}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors disabled:opacity-50"
          >
            {isLoadingProperties ? 
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> :
              <Building2 className="w-4 h-4 text-emerald-500" />
            }
            <span className="text-sm text-slate-300">
              {selectedProperty?.name || 'All Properties'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {propertyDropdownOpen && !isLoadingProperties && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPropertyDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1 max-h-96 overflow-y-auto">
                <button onClick={() => handlePropertySelect(null)} className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${!selectedPropertyId ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-slate-800'}`}>
                  <span className="font-medium">📊 All Properties in Portfolio</span>
                  {!selectedPropertyId && <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                </button>
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property.id)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedPropertyId === property.id ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{property.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{property.property_type} • {property.total_square_feet?.toLocaleString()} sqft</div>
                      </div>
                      {selectedPropertyId === property.id && <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
