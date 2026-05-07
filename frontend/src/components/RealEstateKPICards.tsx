import { TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  target?: string;
  trend?: 'up' | 'down' | 'stable';
  subtext?: string;
  icon?: React.ReactNode;
  colorScheme?: 'default' | 'success' | 'warning' | 'danger';
}

export const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  target, 
  trend = 'stable',
  subtext,
  icon,
  colorScheme = 'default'
}) => {
  const borderColors = {
    default: 'border-slate-800 hover:border-blue-500/30',
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    danger: 'border-red-500/30',
  };

  const trendIcons = {
    up: <TrendingUp className="w-3 h-3 text-emerald-500" />,
    down: <AlertTriangle className="w-3 h-3 text-amber-500" />,
    stable: <span className="text-slate-600">—</span>,
  };

  return (
    <div className={`bg-slate-900 p-4 rounded-xl border ${borderColors[colorScheme]} transition-all group hover:shadow-lg hover:shadow-blue-900/10`}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter">{title}</p>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>

      {target && (
        <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${
          trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-amber-500' : 'text-slate-500'
        }`}>
          {trendIcons[trend]}
          <span>vs target ({target})</span>
        </div>
      )}

      {subtext && (
        <p className="text-xs text-slate-600 mt-1">{subtext}</p>
      )}
    </div>
  );
};

// Main KPI Cards Container for RealSight Dashboard
export const RealEstateKPICards = () => {
  // Mock KPI data (will be replaced by API)
  const kpiData = {
    rentCollectionRate: 87.5, // % - target is 92%+
    portfolioOccupancy: 94.2, // % - target is 95%+
    totalOutstandingDebt: 18600, // $ - lower is better
    avgDaysPastDue: 12, // days - target is <10
    noiMargin: 23.5, // % Net Operating Income margin
    capRate: 5.8, // % Capitalization rate
    tenantTurnoverRate: 18, // % annual turnover - lower is better
    maintenanceCostPerSqft: 4.25, // $/sqft/year - target < $5
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Rent Collection Rate - PRIMARY METRIC */}
      <KPICard 
        title="Rent Collection Rate"
        value={`${kpiData.rentCollectionRate}%`}
        target="92%"
        trend={kpiData.rentCollectionRate >= 92 ? 'up' : kpiData.rentCollectionRate >= 85 ? 'stable' : 'down'}
        subtext="Target: ≥92% | Industry benchmark: 90-95%"
        icon={<DollarSign className="w-4 h-4" />}
        colorScheme={kpiData.rentCollectionRate >= 92 ? 'success' : kpiData.rentCollectionRate >= 85 ? 'default' : 'warning'}
      />

      {/* Portfolio Occupancy */}
      <KPICard 
        title="Portfolio Occupancy"
        value={`${kpiData.portfolioOccupancy}%`}
        target="95%"
        trend={kpiData.portfolioOccupancy >= 95 ? 'up' : kpiData.portfolioOccupancy >= 90 ? 'stable' : 'down'}
        subtext="Target: ≥95% | Vacant units cost money"
        icon={<Users className="w-4 h-4" />}
        colorScheme={kpiData.portfolioOccupancy >= 95 ? 'success' : kpiData.portfolioOccupancy >= 90 ? 'default' : 'warning'}
      />

      {/* Total Outstanding Debt */}
      <KPICard 
        title="Total Outstanding"
        value={`$${kpiData.totalOutstandingDebt.toLocaleString()}`}
        target="<$15K"
        trend={kpiData.totalOutstandingDebt < 15000 ? 'up' : kpiData.totalOutstandingDebt < 25000 ? 'stable' : 'down'}
        subtext="Late payments + delinquent accounts"
        icon={<AlertTriangle className="w-4 h-4" />}
        colorScheme={kpiData.totalOutstandingDebt < 15000 ? 'success' : kpiData.totalOutstandingDebt < 25000 ? 'default' : 'danger'}
      />

      {/* Average Days Past Due */}
      <KPICard 
        title="Avg. Days Past Due"
        value={kpiData.avgDaysPastDue}
        target="<10 days"
        trend={kpiData.avgDaysPastDue < 10 ? 'up' : kpiData.avgDaysPastDue < 20 ? 'stable' : 'down'}
        subtext="Target: <10 days | Above 30 = critical"
        icon={<AlertTriangle className="w-4 h-4" />}
        colorScheme={kpiData.avgDaysPastDue < 10 ? 'success' : kpiData.avgDaysPastDue < 20 ? 'default' : 'warning'}
      />

      {/* NOI Margin */}
      <KPICard 
        title="NOI Margin"
        value={`${kpiData.noiMargin}%`}
        target="≥25%"
        trend={kpiData.noiMargin >= 25 ? 'up' : kpiData.noiMargin >= 20 ? 'stable' : 'down'}
        subtext="Net Operating Income / Gross Revenue"
        icon={<DollarSign className="w-4 h-4" />}
        colorScheme={kpiData.noiMargin >= 25 ? 'success' : kpiData.noiMargin >= 20 ? 'default' : 'warning'}
      />

      {/* Cap Rate */}
      <KPICard 
        title="Cap Rate"
        value={`${kpiData.capRate}%`}
        target="Market: 5-7%"
        trend="stable"
        subtext="NOI / Property Value | Market dependent"
        icon={<TrendingUp className="w-4 h-4" />}
        colorScheme="default"
      />

      {/* Tenant Turnover Rate */}
      <KPICard 
        title="Tenant Turnover"
        value={`${kpiData.tenantTurnoverRate}%`}
        target="<15%"
        trend={kpiData.tenantTurnoverRate < 15 ? 'up' : kpiData.tenantTurnoverRate < 20 ? 'stable' : 'down'}
        subtext="Annual turnover | High = vacancy risk"
        icon={<Users className="w-4 h-4" />}
        colorScheme={kpiData.tenantTurnoverRate < 15 ? 'success' : kpiData.tenantTurnoverRate < 20 ? 'default' : 'warning'}
      />

      {/* Maintenance Cost per SqFt */}
      <KPICard 
        title="Maintenance / SqFt"
        value={`$${kpiData.maintenanceCostPerSqft}/yr`}
        target="<$5/sqft"
        trend={kpiData.maintenanceCostPerSqft < 5 ? 'up' : 'stable'}
        subtext="Annual maintenance cost per square foot"
        icon={<DollarSign className="w-4 h-4" />}
        colorScheme={kpiData.maintenanceCostPerSqft < 5 ? 'success' : 'default'}
      />
    </div>
  );
};
