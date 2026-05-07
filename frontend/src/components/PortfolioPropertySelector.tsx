import { useState } from 'react';
import { useRealSightStore } from '../store/useRealSightStore';
import { ChevronDown, Building2, Loader } from 'lucide-react';

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
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800">
        <Loader className="w-4 h-4 animate-spin" />
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-white font-medium">
            {selectedPortfolio?.name || 'Select Portfolio'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        {portfolioDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPortfolioDropdownOpen(false)} />
            <div className="absolute top-full left-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => handlePortfolioSelect(portfolio.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 ${selectedPortfolioId === portfolio.id ? 'text-blue-400' : 'text-slate-300'}`}
                >
                  {portfolio.name}
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
          >
            {isLoadingProperties ? 
              <Loader className="w-4 h-4 animate-spin" /> :
              <Building2 className="w-4 h-4 text-emerald-400" />
            }
            <span className="text-sm text-white font-medium">
              {selectedProperty?.name || 'All Properties'}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {propertyDropdownOpen && !isLoadingProperties && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setPropertyDropdownOpen(false)} />
              <div className="absolute top-full left-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20 py-1">
                <button onClick={() => handlePropertySelect(null)} className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 ${!selectedPropertyId ? 'text-blue-400' : 'text-slate-300'}`}>
                  All Properties
                </button>
                {properties.map((property) => (
                  <button
                    key={property.id}
                    onClick={() => handlePropertySelect(property.id)}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-800 ${selectedPropertyId === property.id ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {property.name}
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
