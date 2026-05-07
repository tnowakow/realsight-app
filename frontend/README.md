# RealSight Frontend

Commercial Property Management Analytics Platform — User Interface

## Overview

RealSight is a real estate analytics dashboard adapted from the Dentsight dental practice platform. It provides property owners and portfolio managers with:

- **Tenant Financials Tracking** — Monitor rent collection, identify delinquent accounts
- **Portfolio Performance** — KPI dashboards for occupancy, NOI, cap rates
- **Acquisition Target Scoring** — AI-powered property valuation recommendations
- **Alert System** — Real-time notifications for payment issues and critical metrics

## Architecture

### Component Reuse from Dentsight

| Component | Status | Notes |
|-----------|--------|-------|
| PortfolioPropertySelector | ✅ Built | Adapted from CompanySelector |
| TenantFinancialsTable | ✅ Built | New component for tenant payments |
| RealEstateKPICards | ✅ Built | Adapted KPI cards for real estate metrics |
| GlobalHeader | ✅ Built | Updated branding and navigation |
| Alert System | 🔄 In Progress | Reusing Dentsight alert patterns |

### Tech Stack

- **Framework:** React 18 + TypeScript
- **State Management:** Zustand (useRealSightStore)
- **Routing:** React Router v6
- **Styling:** TailwindCSS
- **Icons:** Lucide React
- **Charts:** Recharts (to be integrated)

## Getting Started

### Prerequisites

```bash
node >= 18.x
npm >= 9.x
```

### Installation

```bash
cd dev-team/projects/realsight/frontend
npm install
```

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── PortfolioPropertySelector.tsx    # Portfolio + property drill-down selector
│   ├── TenantFinancialsTable.tsx        # Main tenant payment tracking table
│   ├── RealEstateKPICards.tsx           # KPI dashboard cards
│   └── ui/                              # Shared UI components (to be added)
├── store/
│   └── useRealSightStore.ts             # Zustand state management
├── services/
│   └── api.ts                           # API client (to be adapted)
├── utils/
│   └── formatting.ts                    # Currency, percentage formatters
├── App.tsx                              # Main app component + routing
├── main.tsx                             # Entry point
└── index.css                            # Global styles
```

## Key Features (Phase 1)

### ✅ Completed

1. **Portfolio/Property Selector** — Two-level drill-down navigation
2. **Tenant Financials Table** — Sortable, filterable tenant payment data with status badges
3. **KPI Cards** — Real estate metrics (collection rate, occupancy, outstanding debt)
4. **Dashboard Layout** — Overview page with alerts and quick stats

### 🔄 In Progress

1. API integration with Marcus's backend endpoints
2. Chart visualizations (occupancy trends, NOI by property)
3. Acquisition scoring UI
4. Authentication flow

### 🔜 Planned

1. Property import from CSV/API
2. Lease management module
3. Operating expense tracking
4. Multi-portfolio comparison views

## Mock Data

Currently using mock data for demonstration. The following entities are mocked:

- **Portfolios** — 3 sample portfolios (Midwest Commercial, Great Lakes Retail, Industrial Park)
- **Properties** — 4 properties per portfolio with realistic details
- **Tenants** — 8 tenants across properties with varied payment statuses
- **Payment Records** — Monthly rent data with paid/late/delinquent/defaulted states

### Example Tenant Scenarios

| Tenant | Property | Status | Days Past Due | Amount Owed |
|--------|----------|--------|---------------|-------------|
| Fitness First Gym | Riverside Retail Plaza | Defaulted | 92 days | $6,200 |
| Fashion Forward Boutique | Riverside Retail Plaza | Delinquent | 45 days | $3,800 |
| Quick Stop Grocery | Riverside Retail Plaza | Partial | 10 days | $2,750 |
| Downtown Coffee Co. | Detroit Tech Center | Late | 15 days | $4,200 |

## API Integration (Next Steps)

Once Marcus's backend is ready, update the following:

### Endpoints Needed

```typescript
// Portfolio/Property Management
GET /api/portfolios              // List all portfolios
GET /api/portfolios/:id          // Get portfolio details + properties
GET /api/properties/:id          // Get property details + tenants

// Tenant Financials
GET /api/tenants?property_id=X   // List tenants for a property
GET /api/tenants/:id/payments    // Payment history for tenant

// KPI Data
GET /api/kpi/portfolio-overview  // Portfolio-level metrics
GET /api/kpi/property/:id        // Property-specific metrics

// Alerts
GET /api/alerts?portfolio_id=X   // Active alerts for portfolio
```

### Store Updates

Update `useRealSightStore` actions to call real API endpoints instead of using mock data.

## Testing

```bash
# Run tests
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

## Deployment

### Railway (Production)

See `railway.toml` for deployment configuration. Environment variables:

```env
VITE_API_BASE_URL=/api
NODE_ENV=production
```

### Build

```bash
npm run build
```

Production bundle will be in `dist/` directory.

## Team

- **Maya** — Frontend Developer (current sprint)
- **Marcus** — Backend Developer (parallel work)
- **Tom Nowakowski** — Product Owner / FocusPath Consulting

## References

- [RealSight Architecture](../02-architecture.md)
- [Dentsight Source Code](../../dentsight/)
- [Project Brief](../PROJECT-BRIEF.md)

---

**Status:** Phase 1 Frontend Sprint — Components Built, Awaiting Backend Integration  
**Last Updated:** 2026-05-07
