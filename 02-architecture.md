# RealSight Phase 2 — Architecture Review & Reuse Analysis

**Role:** Vitaly (Senior Architect)
**Date:** 2026-05-07
**Project:** RealSight - Commercial Property Management Analytics Platform
**Phase:** Phase 2: Architecture Review & Reuse Analysis

---

## Mission: Analyze Dentsight codebase for maximum reuse potential and document architecture decisions for RealSight.

---

### Reference Materials:
- **Dentsight Codebase:** `dev-team/projects/dentsight/`
- **RealSight Research:** `dev-team/projects/realsight/01-industry-research.md` (JayJay's completed research)
- **Project Brief:** `dev-team/projects/realsight/PROJECT-BRIEF.md`

---

## Work Items:

### 1. Component Reuse Assessment
**Goal:** Identify which Dentsight components can be directly reused vs. need modification vs. must be rebuilt.

#### Dashboard Components to Evaluate:
- [x] Alert system architecture (critical alerts panel)
- [x] KPI card components
- [x] Chart/visualization library setup
- [x] Data table components with sorting/filtering
- [x] Portfolio health score widget
- [x] Drill-down navigation patterns
- [x] Authentication flows

#### Deliverable: Component Reuse Matrix
| Component | Reuse Level | Modifications Needed | Effort Estimate |
|-----------|-------------|---------------------|-----------------|
| Alert System (AlertCard.tsx) | 95% Direct Reuse | Rename props, adjust alert types for tenant payments | 2 hours |
| KPI Cards (BenchmarkIndicator.tsx) | 90% Direct Reuse | Update metric labels, add real estate benchmarks | 3 hours |
| Charts/Visualizations (Recharts) | 85% Reusable Pattern | New chart configs for occupancy trends, NOI by property | 6 hours |
| Company Selector → Portfolio Selector | 80% Adaptation | Rename "Company" to "Portfolio", add property drill-down | 4 hours |
| Data Tables (OperationsTab pattern) | 75% Reusable Pattern | New columns: tenant name, amount owed, days past due | 5 hours |
| Tab Navigation System | 95% Direct Reuse | Rename tabs: Overview, Tenant Financials, Portfolio Performance, Acquisition | 2 hours |
| Authentication (JWT pattern) | 100% Direct Reuse | No changes needed - same auth flow | 0 hours |
| State Management (Zustand store) | 70% Adaptation | New store schema for properties/tenants vs. practices/patients | 4 hours |

**Total Frontend Effort:** ~26 hours for component adaptation

---

### 2. Data Model Adaptation
**Goal:** Map Dentsight's dental practice entities to RealSight's commercial property entities.

#### Entity Mapping Analysis:
```
DENTSIGHT → REALSIGHT MAPPING:

Practice (Company) → Portfolio/Property Owner
├── practice_id → portfolio_id
├── practice_hash → portfolio_hash (SHA-256)
├── owner_name → owner_name
├── location_city/state → headquarters_location
└── subscription_tier → subscription_tier (same tiers)

Patient Records → Tenant Records
├── patient_hash → tenant_hash (SHA-256 of tenant identifier)
├── age_bucket → business_type (Retail, Office, Industrial, etc.)
├── insurance_type → lease_type (NNN, Gross, Modified Gross)
└── treatment_history → payment_history

Provider Network → Property Portfolio
├── dentist_profile → property_profile
├── specialty → property_type (Retail, Office, Industrial, Mixed-Use)
└── network_status → acquisition_target_score

Insurance Claims → Lease/Payment Records
├── claim_amount → rent_amount
├── claim_status → payment_status (Paid, Late, Delinquent, Defaulted)
├── denial_reasons → late_payment_reasons
└── payer_rules → lease_terms

Practice Analytics → Portfolio Analytics
├── revenue_metrics → NOI, Cap Rate, Occupancy Rate
├– patient_demographics → tenant_concentration_risk
└── operational_kpis → maintenance_costs, turnover_rates, utility_efficiency

Expenses (QuickBooks) → Operating Expenses
├── expense_category → expense_category (same: utilities, maintenance, insurance)
├── amount → amount
└── is_addback → is_capex (capital improvements vs. operating expenses)
```

#### RealSight Database Schema (Adapted from Dentsight):
```sql
-- Core multi-tenancy table (same pattern as Dentsight 'practices')
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    portfolio_hash VARCHAR(64) UNIQUE NOT NULL,
    owner_name VARCHAR(255),
    headquarters_city VARCHAR(100),
    headquarters_state VARCHAR(50),
    subscription_tier VARCHAR(50) DEFAULT 'founding',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY portfolio_isolation ON portfolios
    USING (id = current_setting('app.current_portfolio_id')::uuid);

-- Properties within a portfolio
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    property_type VARCHAR(50),  -- Retail, Office, Industrial, Mixed-Use
    total_square_feet INTEGER,
    unit_count INTEGER,
    acquisition_date DATE,
    acquisition_price DECIMAL(15,2),
    current_valuation DECIMAL(15,2),
    is_acquisition_target BOOLEAN DEFAULT FALSE,
    acquisition_score INTEGER,  -- 1-100 score from scoring algorithm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(portfolio_id, name)
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY properties_by_portfolio ON properties
    USING (portfolio_id = current_setting('app.current_portfolio_id')::uuid);

-- Tenants (PHI-minimized like Dentsight patients)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    tenant_hash VARCHAR(64) UNIQUE NOT NULL,  -- SHA-256 of tenant identifier
    business_name VARCHAR(255),  -- Can store name (not PHI like patient names)
    business_type VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    credit_rating VARCHAR(20),  -- A, B, C, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(property_id, tenant_hash)
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenants_by_portfolio ON tenants
    USING (property_id IN (
        SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
    ));

-- Leases (new entity specific to real estate)
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    property_id UUID REFERENCES properties(id) NOT NULL,
    lease_start_date DATE NOT NULL,
    lease_end_date DATE NOT NULL,
    monthly_rent DECIMAL(12,2) NOT NULL,
    rent_per_sqft DECIMAL(10,4),
    square_footage INTEGER,
    lease_type VARCHAR(50),  -- NNN, Gross, Modified Gross
    has_escalation_clause BOOLEAN DEFAULT FALSE,
    escalation_rate DECIMAL(5,4),  -- e.g., 0.03 for 3%
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_options INTEGER,
    status VARCHAR(50) DEFAULT 'active',  -- active, expired, terminated
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY leases_by_portfolio ON leases
    USING (property_id IN (
        SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
    ));

-- Payment Records (Time-series hypertable like Dentsight appointments)
CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE payments (
    time TIMESTAMP WITH TIME ZONE NOT NULL,  -- Payment date or due date
    property_id UUID REFERENCES properties(id) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) NOT NULL,
    lease_id UUID REFERENCES leases(id),
    amount_due DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50),  -- paid, partial, late, delinquent, defaulted
    days_past_due INTEGER DEFAULT 0,
    late_fee_assessed DECIMAL(10,2) DEFAULT 0,
    late_fee_collected DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    notes TEXT,
    
    PRIMARY KEY (time, property_id, tenant_id)
);

SELECT create_hypertable('payments', 'time');

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_by_portfolio ON payments
    USING (property_id IN (
        SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
    ));

-- Metrics table (same pattern as Dentsight, different metric names)
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) NOT NULL,
    property_id UUID REFERENCES properties(id),  -- Nullable for portfolio-level metrics
    metric_date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,  -- e.g., "rent_collection_rate", "occupancy_rate"
    metric_value DECIMAL(12,4) NOT NULL,
    target_value DECIMAL(12,4),
    industry_benchmark DECIMAL(12,4),
    unit VARCHAR(50),  -- %, $, ratio
    
    UNIQUE(portfolio_id, property_id, metric_date, metric_name)
);

CREATE INDEX idx_metrics_portfolio_date ON metrics(portfolio_id, metric_date DESC);
CREATE INDEX idx_metrics_property_date ON metrics(property_id, metric_date DESC);

ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY metrics_by_portfolio ON metrics
    USING (portfolio_id = current_setting('app.current_portfolio_id')::uuid
        OR property_id IN (
            SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
        ));

-- Alerts table (same pattern as Dentsight)
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) NOT NULL,
    property_id UUID REFERENCES properties(id),  -- Nullable for portfolio-level alerts
    metric_name VARCHAR(100),
    alert_type VARCHAR(50) NOT NULL,  -- warning, info, success, critical
    message TEXT NOT NULL,
    severity INTEGER DEFAULT 2,  -- 1=critical, 2=warning, 3=info
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_alerts_active ON alerts(portfolio_id, is_resolved) WHERE is_resolved = FALSE;
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY alerts_by_portfolio ON alerts
    USING (portfolio_id = current_setting('app.current_portfolio_id')::uuid
        OR property_id IN (
            SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
        ));

-- Operating Expenses (same pattern as Dentsight expenses)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) NOT NULL,
    property_id UUID REFERENCES properties(id),  -- Nullable for portfolio-level expenses
    expense_date DATE NOT NULL,
    category VARCHAR(100),  -- utilities, maintenance, insurance, property_tax, management_fees
    subcategory VARCHAR(100),
    amount DECIMAL(12,2) NOT NULL,
    is_capex BOOLEAN DEFAULT FALSE,  -- Capital improvements vs. operating expenses
    vendor_name VARCHAR(255),
    notes TEXT,
    
    PRIMARY KEY (id)
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_by_portfolio ON expenses
    USING (portfolio_id = current_setting('app.current_portfolio_id')::uuid
        OR property_id IN (
            SELECT id FROM properties WHERE portfolio_id = current_setting('app.current_portfolio_id')::uuid
        ));
```

#### Deliverable: Data Model Summary
- [x] Entity relationship diagram created (above SQL schema)
- [x] Field-level mappings documented from Dentsight
- [x] New entities identified: `properties`, `tenants`, `leases`, `payments` (vs. Dentsight's `practices`, `patients`, `appointments`, `procedures`)

---

### 3. API Layer Reuse
**Goal:** Inventory reusable API endpoints and document required modifications.

#### Dentsight Backend Structure (from `app.js`):
```
/api/auth          → Authentication routes
/api/metrics       → Time-series metric data
/api/alerts        → Alert notifications
/api/valuation     → Valuation calculations
/api/practice      → Practice-specific endpoints
/api/companies     → Company/portfolio management
/api/kpi           → KPI dashboard data
/api/recommendations → AI-powered recommendations
/api/operations    → Operational metrics (denials, appointments)
```

#### Endpoint Analysis:
```
REUSABLE PATTERNS (Dentsight → RealSight):

GET /api/companies → GET /api/portfolios
└── Same multi-tenancy pattern, rename entity

GET /api/metrics?company_id=X&from=Y&to=Z → GET /api/metrics?portfolio_id=X&property_id=Y&from=A&to=B
└── Query params extended for property-level filtering

GET /api/alerts?company_id=X&resolved=false → GET /api/alerts?portfolio_id=X&property_id=Y&resolved=false
└── Alert logic identical, just different thresholds

GET /api/kpi/company-overview → GET /api/kpi/portfolio-overview
└── Same KPI aggregation pattern

POST /api/auth/login → POST /api/auth/login
└── 100% reusable - JWT auth unchanged

NEW ENDPOINTS NEEDED:
- GET /api/acquisition-targets (scoring algorithm for properties)
- GET /api/tenants/{id}/payment-history (tenant payment tracking)
- GET /api/properties/{id}/lease-expirations (lease management)
- POST /api/properties/import (bulk property import from CSV/API)
```

#### Deliverable: API Endpoint Inventory
| Dentsight Endpoint | RealSight Equivalent | Modifications Needed | Effort | Priority |
|-------------------|---------------------|---------------------|--------|----------|
| GET /api/companies | GET /api/portfolios | Rename entity, add property drill-down | 2h | High |
| POST /api/auth/login | POST /api/auth/login | None - direct reuse | 0h | High |
| GET /api/metrics | GET /api/metrics | Add property_id param, new metric names | 4h | High |
| GET /api/alerts | GET /api/alerts | New alert types for tenant payments | 3h | High |
| GET /api/kpi/company-overview | GET /api/kpi/portfolio-overview | Rename + real estate KPIs | 5h | High |
| GET /api/valuation | GET /api/properties/:id/valuation | Property-level valuation logic | 8h | Medium |
| GET /api/recommendations | GET /api/recommendations | AI recommendations for properties | 6h | Medium |
| GET /api/operations | GET /api/tenants/financials | Tenant payment behavior analysis | 10h | High |
| NEW: acquisition scoring | POST /api/acquisition/score | New ML model integration | 12h | Low |

**Total Backend Effort:** ~50 hours for API adaptation

---

### 4. Deployment Configuration
**Goal:** Adapt Railway deployment template for RealSight.

#### Dentsight Railway Config (`railway.toml`):
```toml
[build]
builder = "DOCKERFILE"

[deploy]
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
healthCheckPath = "/api/health"
healthCheckTimeout = 30
```

#### Environment Variables (Dentsight → RealSight):
| Variable | Dentsight Value | RealSight Value | Notes |
|----------|-----------------|-----------------|-------|
| DATABASE_URL | postgresql://... | postgresql://... | New DB instance |
| JWT_SECRET | <random> | <new random> | Generate new secret |
| PORT | 3001 | 3001 | Same default |
| NODE_ENV | production | production | Unchanged |
| VITE_API_BASE_URL | /api | /api | Frontend proxy unchanged |

#### Railway Service Dependencies:
```
Dentsight Services:
├── Web Service (Node.js + Express)
└── PostgreSQL 15 with TimescaleDB extension

RealSight Services (SAME):
├── Web Service (Node.js + Express) - same Dockerfile pattern
└── PostgreSQL 15 with TimescaleDB extension - identical setup
```

#### Deployment Checklist:
- [x] Review Dentsight Railway config (`railway.toml`)
- [x] Document environment variable changes needed
- [ ] Create RealSight `railway.toml` (copy from Dentsight, rename project)
- [ ] Set up new PostgreSQL instance on Railway
- [ ] Enable TimescaleDB extension in database settings
- [ ] Configure database migrations (Prisma schema → SQL migration)
- [ ] Set up CI/CD pipeline for auto-deploy on main branch push
- [ ] Add health check monitoring (`GET /api/health`)
- [ ] Configure log aggregation (Railway built-in logs)

#### Database Migration Strategy:
1. **Create Prisma Schema** from the SQL schema defined in Section 2
2. **Generate migration files**: `prisma migrate dev --name init`
3. **Run on Railway**: Add migration step to Dockerfile or use `railway run` for initial setup
4. **Seed data**: Adapt Dentsight's `seed.js` for RealSight test portfolios/properties

---

### 5. Effort Estimation & Risk Assessment

#### Total Project Effort Breakdown:
| Phase | Component | Estimated Hours | Complexity | Dependencies |
|-------|-----------|-----------------|------------|---------------|
| **Backend Setup** | Database schema (Prisma + migrations) | 8h | Medium | None |
| | API layer adaptation (9 endpoints) | 50h | High | DB schema complete |
| | Authentication system | 2h | Low | None |
| **Frontend Build** | Dashboard components (AlertCard, KPI cards) | 10h | Low | None |
| | Charts/Visualizations (Recharts configs) | 6h | Medium | API endpoints ready |
| | Portfolio selector + drill-down navigation | 8h | Medium | Backend portfolios API |
| | Tenant financials tab (payment tracking) | 12h | High | Payments API complete |
| | Acquisition targets scoring UI | 10h | High | Scoring algorithm ready |
| **Data Integration** | Property import flow (CSV/API) | 8h | Medium | None |
| | Metric calculation engine | 16h | High | DB schema, test data |
| | Alert threshold configuration | 4h | Low | Metrics engine complete |
| **Testing & QA** | Unit tests (backend + frontend) | 12h | Medium | All components built |
| | Integration tests (API contracts) | 8h | High | Backend complete |
| | E2E testing (critical user flows) | 6h | High | Full stack ready |
| **Deployment** | Railway setup + CI/CD pipeline | 4h | Low | Codebase frozen |
| | Database seeding + test data | 3h | Low | Migrations complete |

#### Grand Total: ~127 hours (~16 working days for one developer)

#### Risk Factors:

**HIGH RISK:**
- [ ] **Acquisition Scoring Algorithm**: No existing model in Dentsight - requires new ML/ML-like logic to score properties based on financial metrics, tenant quality, location factors. May need external data sources (CoStar, LoopNet APIs).
- [ ] **Tenant Payment Behavior Analysis**: JayJay's research confirms this is the priority feature, but we have no historical payment data patterns yet. Need to define what "problematic" means quantitatively.

**MEDIUM RISK:**
- [ ] **Data Integration Complexity**: Real estate data comes from property management systems (Yardi, AppFolio, Buildium) - each has different APIs. May need custom connectors.
- [ ] **TimescaleDB Query Performance**: Payment history queries could be heavy if portfolios have 100+ properties with monthly payment records over years. Need to test query optimization early.

**LOW RISK:**
- [ ] **Frontend Component Reuse**: Dentsight components are well-factored and should adapt cleanly. Main risk is just time, not technical feasibility.
- [ ] **Authentication Flow**: JWT auth is battle-tested in Dentsight - minimal risk here.

#### Mitigation Strategies:
1. **Start with mock data** (like Dentsight's `mockData.ts`) to build UI before real integrations
2. **Define acquisition scoring heuristics first** - don't wait for ML model; start with rule-based scoring
3. **Build one property management connector at a time** - prioritize most common systems
4. **Add database indexes early** on `payments` table (time, property_id, tenant_id) before data grows

---

## Final Deliverables Checklist:
- [x] Component reuse matrix completed (Section 1)
- [x] Data model diagram created (Section 2 - full SQL schema with RLS policies)
- [x] API endpoint inventory documented (Section 3 - 9 endpoints mapped)
- [x] Deployment checklist finalized (Section 4 - Railway config + migration strategy)
- [x] Effort estimates provided (Section 5 - ~127 hours total, broken down by phase)
- [x] Risk assessment complete (Section 5 - high/medium/low risks with mitigations)

## Architecture Review Summary:

### Key Findings:
1. **High Reuse Potential**: Dentsight's architecture is ~80% reusable for RealSight. The core patterns (multi-tenancy, alerting, KPI dashboards, JWT auth) transfer directly.
2. **Domain-Specific Additions**: RealSight needs 4 new entities (`properties`, `tenants`, `leases`, `payments`) vs. Dentsight's dental-focused schema.
3. **Critical New Feature**: Acquisition scoring algorithm has no precedent in Dentsight - this is the biggest unknown and should be prototyped early.
4. **Deployment Parity**: Railway setup is identical; same Dockerfile pattern, same PostgreSQL+TimescaleDB stack.

### Recommended Next Steps:
1. **Phase 3 (JayJay + Marcus)**: Create 18-20 property portfolio scenarios with realistic test data
2. **Backend Sprint 1**: Set up Prisma schema, run migrations, build core API endpoints (portfolios, properties, tenants)
3. **Frontend Sprint 1**: Copy Dentsight components, rename entities, wire to new APIs
4. **Sprint 2**: Build tenant payment behavior analysis (JayJay's priority feature)
5. **Sprint 3**: Acquisition scoring algorithm + property valuation module

### Confidence Level: HIGH
The architecture is well-understood and the path forward is clear. Dentsight provides a proven foundation that reduces RealSight development time by an estimated 60-70%.

---
**Review Completed By:** Vitaly (Senior Architect)
**Completion Date:** 2026-05-07
**Next Phase Owner:** JayJay + Marcus (Phase 3: Test Data Scenarios)

---

**Next Steps After Completion:**
Once this architecture review is done, Phase 3 begins: JayJay + Marcus create 18-20 property portfolio scenarios for testing and demo purposes.

**Target Completion:** Within 24 hours of assignment (by 2026-05-08)

---

*This document will be updated by Vitaly as the architecture review progresses.*
