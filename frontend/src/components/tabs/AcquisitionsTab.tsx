import React, { useState, useEffect } from 'react';
import { getAcquisitionPipeline } from '../../services/api';

interface AcquisitionTarget {
  id: string;
  property_name: string;
  address: string;
  city: string;
  state: string;
  market: string;
  cap_rate: number;
  noi_growth_percent: number;
  acquisition_score: number;
  deal_type: 'Value-Add' | 'Stabilized' | 'Distressed';
}

const AcquisitionsTab: React.FC = () => {
  const [pipeline, setPipeline] = useState<AcquisitionTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [dealTypeFilter, setDealTypeFilter] = useState<string>('All');
  const [marketFilter, setMarketFilter] = useState<string>('All');
  const [scoreThreshold, setScoreThreshold] = useState<number>(0);
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'acquisition_score', 
    direction: 'desc' 
  });
  
  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        setLoading(true);
        const data = await getAcquisitionPipeline();
        setPipeline(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch acquisition pipeline:', err);
        setError('Failed to load acquisition pipeline data');
      } finally {
        setLoading(false);
      }
    };

    fetchPipeline();
  }, []);

  // Get unique markets for filter dropdown
  const markets = ['All', ...Array.from(new Set(pipeline.map(item => item.market)))];
  
  // Filter and sort pipeline data
  const filteredAndSortedPipeline = React.useMemo(() => {
    console.log('Filtering data with:', { dealTypeFilter, marketFilter, scoreThreshold });
    let result = [...pipeline];
    
    // Apply deal type filter
    if (dealTypeFilter !== 'All') {
      result = result.filter(item => item.deal_type === dealTypeFilter);
    }
    
    // Apply market filter
    if (marketFilter !== 'All') {
      result = result.filter(item => item.market === marketFilter);
    }
    
    // Apply score threshold filter
    result = result.filter(item => item.acquisition_score >= scoreThreshold);
    
    console.log('Filtered result count:', result.length);
    
    // Sort the results
    result.sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      const dir = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * dir;
      }
      
      return aValue < bValue ? -dir : aValue > bValue ? dir : 0;
    });
    
    return result;
  }, [pipeline, dealTypeFilter, marketFilter, scoreThreshold, sortConfig]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Exceptional' };
    if (score >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Strong' };
    if (score >= 70) return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Good' };
    return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Review' };
  };

  const getDealTypeBadge = (type: string) => {
    switch (type) {
      case 'Value-Add':
        return { bg: 'bg-green-500/20', text: 'text-green-400' };
      case 'Stabilized':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400' };
      case 'Distressed':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400' };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' };
    }
  };

  const SortIndicator = ({ key }: { key: string }) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  const getTrendArrow = (value: number) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '→';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Acquisition Pipeline</h1>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Acquisition Pipeline</h1>
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Acquisition Pipeline</h1>
      <p className="text-slate-400">View and manage acquisition targets and pipeline status.</p>
      
      {/* Filters */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Deal Type</label>
            <select
              value={dealTypeFilter}
              onChange={(e) => setDealTypeFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              <option value="All">All Deal Types</option>
              <option value="Value-Add">Value-Add</option>
              <option value="Stabilized">Stabilized</option>
              <option value="Distressed">Distressed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Market</label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
            >
              {markets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Score Threshold: {scoreThreshold}</label>
            <input
              type="range"
              min="0"
              max="100"
              value={scoreThreshold}
              onChange={(e) => setScoreThreshold(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>
      
      {/* Pipeline Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th 
                  onClick={() => handleSort('property_name')}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Property Name <SortIndicator key="property_name" />
                </th>
                <th 
                  onClick={() => handleSort('address')}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Address <SortIndicator key="address" />
                </th>
                <th 
                  onClick={() => handleSort('market')}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Market <SortIndicator key="market" />
                </th>
                <th 
                  onClick={() => handleSort('cap_rate')}
                  className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Cap Rate <SortIndicator key="cap_rate" />
                </th>
                <th 
                  onClick={() => handleSort('noi_growth_percent')}
                  className="cursor-pointer px-4 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  NOI Growth % <SortIndicator key="noi_growth_percent" />
                </th>
                <th 
                  onClick={() => handleSort('acquisition_score')}
                  className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Acquisition Score <SortIndicator key="acquisition_score" />
                </th>
                <th 
                  onClick={() => handleSort('deal_type')}
                  className="cursor-pointer px-4 py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >
                  Deal Type <SortIndicator key="deal_type" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredAndSortedPipeline.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No acquisition targets match your filters
                  </td>
                </tr>
              ) : (
                filteredAndSortedPipeline.map((item) => {
                  const scoreBadge = getScoreBadge(item.acquisition_score);
                  const dealTypeBadge = getDealTypeBadge(item.deal_type);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{item.property_name}</td>
                      <td className="px-4 py-3 text-slate-400">{item.address}</td>
                      <td className="px-4 py-3 text-slate-400">{item.market}</td>
                      <td className="px-4 py-3 text-right text-slate-300 font-mono">{(item.cap_rate ?? 0).toFixed(2)}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono">
                          {getTrendArrow(item.noi_growth_percent)} {(item.noi_growth_percent ?? 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreBadge.bg} ${scoreBadge.text}`}>
                          {item.acquisition_score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dealTypeBadge.bg} ${dealTypeBadge.text}`}>
                          {item.deal_type}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcquisitionsTab;