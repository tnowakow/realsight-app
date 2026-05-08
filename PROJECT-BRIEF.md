# RealSight - Commercial Property Management Analytics Platform

## Project Overview

**RealSight** is a SaaS analytics platform for commercial property owners and management companies. Similar to how Dentsight serves dental practice acquisitions, RealSight provides data-driven insights for real estate portfolio optimization, tenant performance tracking, and acquisition target identification.

### Target Customer
- Commercial property owners (multi-property portfolios)
- Property management companies
- Real estate investment firms
- REITs looking for acquisition targets

### Core Value Proposition
"Identify underperforming assets, track problematic tenants, and discover high-value acquisition opportunities through AI-powered analytics."

---

## Phase 1: Industry Research & KPI Definition (COMPLETED ✅)

### Primary Research Questions

**JayJay (Industry Advisor)** needs to research and document:

#### Tenant Payment Behavior (CONFIRMED PRIORITY)
- What metrics matter for late payment tracking?
  - Days past due distribution
  - Total outstanding by tenant
  - Payment history trends
  - Chronic late payers vs. one-time incidents
  - Late fee collection rates
- How do property managers currently track this?
- What thresholds trigger concern/action?

#### Portfolio Performance Metrics (TO RESEARCH)
- Occupancy/vacancy rates by property and portfolio-wide
- Rental income per square foot
- Net Operating Income (NOI) trends
- Cap rates and yield analysis
- Property appreciation/depreciation patterns

#### Operational Efficiency Metrics (TO RESEARCH)
- Maintenance cost per unit/square foot
- Vendor performance tracking
- Turnover costs between tenants
- Utility cost optimization opportunities

#### Acquisition Target Indicators (TO RESEARCH)
- What makes a property an attractive acquisition?
  - Below-market rents with upside potential
  - Value-add renovation opportunities
  - Distressed ownership situations
  - Favorable lease expiration schedules
- How do investors evaluate deal quality?

#### Risk & Compliance Metrics (TO RESEARCH)
- Lease compliance tracking
- Insurance coverage adequacy
- Regulatory compliance issues
- Tenant concentration risk

### Deliverables for Phase 1

**Output File:** `dev-team/projects/realsight/01-industry-research.md`

Must include:
1. Top 15-20 KPIs that commercial property owners care about (ranked by importance)
2. Industry benchmarks/targets for each metric
3. Data sources needed to calculate each KPI
4. Sample dashboard layout recommendations, use Densight as template
5. Acquisition target scoring methodology

---

## Phase 2: Technical Architecture & Code Reuse Analysis (COMPLETED ✅)

### Vitaly (Technical Architect) Tasks

**Code Reuse Assessment:**
- Review Dentsight codebase (`dev-team/projects/dentsight/`)
- Identify reusable components:
  - Multi-company/portfolio selection UI pattern ✅ (confirmed from Dentsight V3)
  - KPI grid layouts and visualizations
  - Alert/notification system
  - Recommendation engine structure
  - Database schema patterns
  - API endpoint structures

**New Requirements:**
- Property-specific data models (vs. dental practice models)
- Tenant relationship tracking (vs. patient relationships)
- Lease management integration
- Geographic/portfolio-level aggregations

### Deliverables for Phase 2

**Output File:** `dev-team/projects/realsight/02-architecture.md`

Must include:
1. Database schema design (properties, tenants, leases, payments, maintenance)
2. API endpoint specifications
3. Component reuse plan from Dentsight
4. New components needed
5. Technology stack decisions (can we use same stack as Dentsight?)

---

## Phase 3: Seed Data & Demo Scenarios (CURRENT PHASE)

### JayJay + Marcus Tasks

Create 18-20 distinct property portfolio scenarios similar to Dentsight's 10 dental practice profiles, however each property is owned by the same company:

**Example Scenarios:**
1. "High-Growth Urban Portfolio" - Prime locations, strong occupancy, acquisition target
2. "Suburban Landlord, Aging Stock" - Stable but outdated properties needing renovation
3. "Distressed Owner, Financial Trouble" - Multiple late payments, high vacancy
4. "Institutional Quality REIT" - Well-managed, efficient operations
5. "Mom & Pop Multi-Property" - 5-10 units, inconsistent management
6. "Value-Add Opportunity" - Below-market rents, renovation potential
7. "Single-Tenant Industrial" - One major lease, concentration risk
8. "Mixed-Use Complex" - Retail + residential, diverse income streams

### Deliverables for Phase 3

**Output File:** `dev-team/projects/realsight/03-scenarios.md`

Must include:
1. Detailed profiles for 8-10 property portfolios
2. Specific metrics and pain points for each scenario
3. Sample tenant data (names, payment histories, lease terms) designed to dynamically calculate time-sensitive metrics (e.g., 'days past due', 'lease expiration countdown') relative to the current system date.
4. Property details (locations, unit counts, square footage, rental rates)

---

## Phase 4: Development & Deployment

### Marcus + Maya Tasks

**Backend (Marcus):**
- Implement database schema from Phase 2
- Create API endpoints for property/tenant data, ensuring all time-sensitive data (e.g., payment due dates, lease terms) can be queried and calculated dynamically based on the current date.
- Build seed data loader for demo scenarios
- Integrate AI recommendation engine (adapted from Dentsight)

**Frontend (Maya):**
- Reuse Dentsight components where applicable
- Build property portfolio selector
- Implement KPI dashboards for each metric category, ensuring all time-sensitive data points (e.g., 'Days Past Due', 'Lease Expiration Schedule') dynamically update relative to the current viewing date.
- Create tenant payment tracking views
- Design acquisition target highlighting

### Deliverables for Phase 4

1. Working application deployed to Railway
2. Demo URL: `https://realsight-production.up.railway.app`
3. All 8-10 scenarios loadable with distinct data
4. Responsive design (desktop + mobile)

---

## Phase 5: QA & Validation

### Riley + JayJay Tasks

**QA Testing (Riley):**
- Functional testing of all features
- Data accuracy validation across scenarios
- Performance testing with large datasets
- Mobile responsiveness verification

**Industry Validation (JayJay):**
- Verify KPIs match real-world property management priorities
- Confirm acquisition target indicators are realistic
- Validate demo narratives make sense to industry professionals

---

## Success Criteria

✅ **RealSight is production-ready when:**
1. All 8-10 portfolio scenarios load correctly with distinct data
2. Tenant payment tracking shows late payers prominently (Tom's priority)
3. Portfolio selector works smoothly (like Dentsight company selector)
4. KPIs are industry-relevant and benchmarks are accurate, with all time-sensitive data dynamically adjusting to the current viewing date.
5. Acquisition targets are clearly identified and justified
6. Application deploys successfully to Railway
7. Demo script created for sales/pitch use

---

## Timeline & Next Steps

**Immediate Action Required:**
1. ✅ Project brief created (this file)

**Target Completion:** 7-10 days from research start

---

## Notes from Tom (Project Sponsor)

> "I know for a fact that identifying tenants that are consistently late in their payments is a big one and they want to easily know who those tenants are and how late in payments and total they are."
> 
> **This is the #1 feature priority.** Make sure tenant payment tracking is prominent, easy to use, and shows:
> - Who owes money
> - How much they owe
> - How long it's been outstanding
> - Payment history patterns
> - Total exposure by property/portfolio

---

## Related Projects

- **Dentsight:** `dev-team/projects/dentsight/` - Reference for architecture, components, deployment pattern
- **Property Maintenance Agent:** `dev-team/projects/property-maintenance-agent/` - Different domain (maintenance tickets vs. financial analytics)
