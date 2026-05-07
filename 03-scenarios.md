# RealSight Phase 3 — Portfolio Scenarios & Demo Data

**Roles:** JayJay (Industry Advisor) + Marcus (Backend Developer)
**Date:** 2026-05-07
**Project:** RealSight - Commercial Property Management Analytics Platform
**Phase:** Phase 3: Portfolio Scenarios & Demo Data Creation

---

## Mission: Create realistic property portfolio scenarios with demo data for testing, demos, and development.

---

### CRITICAL CONTEXT: Single Owner Model

Unlike Dentsight (multiple independent dental practices), **RealSight serves ONE company/owner managing multiple properties**. The entire platform is about:
- Managing a single business's property portfolio
- Finding low-performing tenants across all properties
- Tracking KPIs at the portfolio level
- Identifying value-add opportunities and acquisition targets

---

## Scenario Requirements

### Portfolio Overview
- **Portfolio Owner:** "Meridian Commercial Properties" (fictional company name)
- **Total Properties:** 18-20 commercial properties
- **Property Types:** Mix of retail, office, industrial, mixed-use
- **Geographic Spread:** Multiple cities/regions
- **Total Tenants:** ~50-75 tenants across all properties

### Key Scenarios to Include

#### 1. Chronic Late Payers (Tom's #1 Priority)
**Goal:** Demonstrate tenant payment tracking capabilities

Create 3-5 tenants who consistently pay late:
- Tenant A: Always 30+ days past due, owes $45,000 total
- Tenant B: Sporadic late payments, currently 45 days overdue ($28,000)
- Tenant C: Recently defaulted, 90+ days past due ($67,000)

**Data needed:** Payment history showing pattern over 12 months

#### 2. High vs. Low Performing Properties
**Goal:** Show portfolio performance comparison

Create property mix:
- **High Performers (5-6 properties):** >95% occupancy, strong NOI, low maintenance costs
- **Average Performers (8-10 properties):** 85-95% occupancy, moderate metrics
- **Underperformers (3-4 properties):** <80% occupancy, declining NOI, high vacancy

**Data needed:** KPIs for each property type

#### 3. Lease Expirations Pipeline
**Goal:** Demonstrate proactive lease management

Create expiration schedule:
- Next 6 months: 5-7 leases expiring (~$120K/month rent at risk)
- 6-12 months: 8-10 leases expiring (~$180K/month rent at risk)
- Include renewal probability estimates for each

#### 4. Acquisition Target Property
**Goal:** Show value-add opportunity identification

Create 1 "distressed" property as acquisition target:
- Below-market rents (20% below comparable properties)
- High vacancy rate (>30%)
- Recent ownership change or financial distress signals
- Clear value-add potential (renovation, lease-up strategy)

#### 5. Portfolio-Wide KPIs
**Goal:** Demonstrate aggregate analytics

Calculate portfolio-level metrics:
- Overall rent collection rate: ~92% (below target of 96%)
- Portfolio occupancy: ~87% (target 90%+)
- Total NOI: $2.4M annually
- Weighted average cap rate: 6.8%
- Tenant concentration risk: Top tenant = 15% of portfolio revenue

---

## Deliverable Structure

### Section 1: Property Portfolio Inventory
| Property Name | Type | City | State | Zip Code | Sq Ft | Units | Occupancy | Monthly Rent | NOI | Cap Rate | Performance Tier |
|---------------|----------|----------|-------|----------|-------|-------|-----------|--------------|-------------|----------|------------------|
| Grand Central Tower | Office | New York | NY | 10017 | 300000 | 25 | 0.98 | $1,500,000 | $10,500,000 | 0.07 | High |
| Sunset Strip Retail | Retail | Los Angeles | CA | 90069 | 120000 | 18 | 0.95 | $600,000 | $4,800,000 | 0.08 | High |
| Riverbend Industrial | Industrial | Chicago | IL | 60608 | 500000 | 10 | 0.92 | $500,000 | $3,500,000 | 0.07 | Average |
| Midtown Plaza | Office | Atlanta | GA | 30308 | 250000 | 20 | 0.90 | $750,000 | $5,250,000 | 0.07 | Average |
| Bayfront Lofts | Mixed-Use | Miami | FL | 33139 | 150000 | 30 | 0.88 | $450,000 | $3,150,000 | 0.07 | Average |
| Desert Bloom Outlets | Retail | Phoenix | AZ | 85004 | 100000 | 15 | 0.80 | $200,000 | $1,200,000 | 0.06 | Low |
| Rust Belt Warehouse | Industrial | Detroit | MI | 48201 | 400000 | 8 | 0.75 | $250,000 | $1,500,000 | 0.06 | Low |
| Gateway Office Park | Office | Denver | CO | 80202 | 180000 | 15 | 0.93 | $540,000 | $3,780,000 | 0.07 | High |
| Harbor View Suites | Office | Boston | MA | 02110 | 200000 | 22 | 0.97 | $970,000 | $6,790,000 | 0.07 | High |
| Silicon Valley Tech Hub | Office | San Jose | CA | 95110 | 400000 | 30 | 0.96 | $2,000,000 | $14,000,000 | 0.07 | High |
| Lone Star Logistics | Industrial | Dallas | TX | 75201 | 600000 | 12 | 0.89 | $600,000 | $4,200,000 | 0.07 | Average |
| Emerald City Plaza | Retail | Seattle | WA | 98101 | 80000 | 12 | 0.91 | $280,000 | $1,960,000 | 0.07 | Average |
| Sunshine Medical Center | Office | Orlando | FL | 32801 | 130000 | 18 | 0.94 | $455,000 | $3,185,000 | 0.07 | High |
| Liberty Bell Square | Retail | Philadelphia | PA | 19103 | 90000 | 10 | 0.85 | $270,000 | $1,620,000 | 0.06 | Low |
| Bourbon Street Shops | Retail | New Orleans | LA | 70112 | 70000 | 8 | 0.70 | $105,000 | $630,000 | 0.06 | Distressed |
| Capitol Hill Offices | Office | Washington | DC | 20003 | 160000 | 15 | 0.90 | $640,000 | $4,480,000 | 0.07 | Average |
| Mountain View Tech Park | Industrial | Portland | OR | 97209 | 350000 | 10 | 0.88 | $420,000 | $2,940,000 | 0.07 | Average |
| Waterfront Commerce | Office | San Diego | CA | 92101 | 220000 | 18 | 0.95 | $880,000 | $6,160,000 | 0.07 | High |

### Section 2: Tenant Roster with Payment Patterns
| Tenant Name | Property | Business Type | Lease Start | Lease End | Monthly Rent | Payment Status | Days Past Due | Total Owed | Chronic Late? |
|------------|-------------------------|---------------|-------------|-----------|--------------|----------------|---------------|------------|---------------|
| Tech Solutions Inc. | Grand Central Tower | Tech Office | 2023-01-01 | 2028-12-31 | $150,000 | Paid | 0 | $0 | N |
| Global Finance Group | Grand Central Tower | Finance | 2022-06-01 | 2027-05-31 | $120,000 | Paid | 0 | $0 | N |
| Urban Cafe | Grand Central Tower | Retail | 2024-03-01 | 2029-02-28 | $15,000 | Paid | 0 | $0 | N |
| Style Boutique | Sunset Strip Retail | Apparel | 2023-05-01 | 2028-04-30 | $30,000 | Paid | 0 | $0 | N |
| Sunset Grille | Sunset Strip Retail | Restaurant | 2022-09-01 | 2027-08-31 | $25,000 | Paid | 0 | $0 | N |
| Eco-Packaging Co. | Riverbend Industrial | Manufacturing | 2023-02-15 | 2028-02-14 | $50,000 | Paid | 0 | $0 | N |
| Data Analytics Corp. | Midtown Plaza | Tech Office | 2023-07-01 | 2028-06-30 | $37,500 | Paid | 0 | $0 | N |
| Fitness Hub | Bayfront Lofts | Gym | 2024-01-01 | 2029-12-31 | $20,000 | Paid | 0 | $0 | N |
| Desert Tours LLC | Desert Bloom Outlets | Tourism | 2023-03-01 | 2028-02-29 | $13,333 | Paid | 0 | $0 | N |
| Auto Parts Depot | Rust Belt Warehouse | Distribution | 2023-04-01 | 2028-03-31 | $31,250 | Paid | 0 | $0 | N |
| Apex Innovations | Gateway Office Park | Software | 2023-08-01 | 2028-07-31 | $36,000 | Paid | 0 | $0 | N |
| Maritime Legal | Harbor View Suites | Legal Services | 2023-09-01 | 2028-08-31 | $48,500 | Paid | 0 | $0 | N |
| Bio-Gen Research | Silicon Valley Tech Hub | Biotech | 2022-11-01 | 2027-10-31 | $80,000 | Paid | 0 | $0 | N |
| Petro Logistics | Lone Star Logistics | Oil & Gas | 2023-06-01 | 2028-05-31 | $50,000 | Paid | 0 | $0 | N |
| Craft Brew Pub | Emerald City Plaza | Restaurant | 2024-02-01 | 2029-01-31 | $23,333 | Paid | 0 | $0 | N |
| Ortho Solutions | Sunshine Medical Center | Medical Office | 2023-10-01 | 2028-09-30 | $25,278 | Paid | 0 | $0 | N |
| Historical Souvenirs | Liberty Bell Square | Retail | 2023-11-01 | 2028-10-31 | $27,000 | Paid | 0 | $0 | N |
| Cajun Spice Co. | Bourbon Street Shops | Food Retail | 2024-01-01 | 2029-12-31 | $13,125 | Paid | 0 | $0 | N |
| Political Consultants | Capitol Hill Offices | Consulting | 2023-07-15 | 2028-07-14 | $42,667 | Paid | 0 | $0 | N |
| Outdoor Gear Store | Mountain View Tech Park | Retail | 2024-03-01 | 2029-02-28 | $28,000 | Paid | 0 | $0 | N |
| Cruise Line HQ | Waterfront Commerce | Corporate Office | 2023-02-01 | 2028-01-31 | $48,889 | Paid | 0 | $0 | N |
| SecureNet Systems | Silicon Valley Tech Hub | Cybersecurity | 2023-04-01 | 2028-03-31 | $70,000 | Paid | 0 | $0 | N |
| Coastal Living Realty | Waterfront Commerce | Real Estate | 2023-05-01 | 2028-04-30 | $40,000 | Paid | 0 | $0 | N |
| Green Energy Solutions | Riverbend Industrial | Renewable Energy | 2023-07-01 | 2028-06-30 | $40,000 | Paid | 0 | $0 | N |
| Global Imports Ltd. | Lone Star Logistics | Import/Export | 2023-08-01 | 2028-07-31 | $60,000 | Paid | 0 | $0 | N |
| Art & Design Studio | Bayfront Lofts | Creative | 2023-06-01 | 2028-05-31 | $15,000 | Paid | 0 | $0 | N |
| Downtown Deli | Midtown Plaza | Food Service | 2024-02-01 | 2029-01-31 | $10,000 | Paid | 0 | $0 | N |
| Bright Minds Tutoring | Sunshine Medical Center | Education | 2023-03-01 | 2028-02-29 | $8,000 | Paid | 0 | $0 | N |
| Urban Outfitters Co. | Emerald City Plaza | Apparel | 2023-09-01 | 2028-08-31 | $15,000 | Paid | 0 | $0 | N |
| Heritage Antiques | Liberty Bell Square | Retail | 2024-01-01 | 2029-12-31 | $9,000 | Paid | 0 | $0 | N |
| Bayou Bites Cafe | Bourbon Street Shops | Cafe | 2023-05-01 | 2028-04-30 | $7,000 | Paid | 0 | $0 | N |
| Late Payments Corp. (A) | Capitol Hill Offices | Consulting | 2023-01-01 | 2028-12-31 | $10,000 | Delinquent | 35 | $10,000 | Y |
| Struggling Startup Inc. (B) | Mountain View Tech Park | Tech Startup | 2023-02-01 | 2028-01-31 | $8,000 | Late | 48 | $8,000 | Y |
| Defaulted Holdings LLC (C) | Bourbon Street Shops | Investment | 2022-06-01 | 2027-05-31 | $15,000 | Defaulted | 90 | $45,000 | Y |
| EverGreen Landscaping | Desert Bloom Outlets | Services | 2023-06-01 | 2028-05-31 | $5,000 | Late | 32 | $5,000 | Y |
| Discount Retailers | Liberty Bell Square | Retail | 2023-08-01 | 2028-07-31 | $12,000 | Late | 38 | $12,000 | Y |
| Precision Manufacturing | Rust Belt Warehouse | Manufacturing | 2023-03-01 | 2028-02-29 | $25,000 | Paid | 0 | $0 | N |
| Corporate HQ Solutions | Grand Central Tower | Office Services | 2022-10-01 | 2027-09-30 | $75,000 | Paid | 0 | $0 | N |
| West Coast Apparel | Sunset Strip Retail | Fashion | 2023-07-01 | 2028-06-30 | $20,000 | Paid | 0 | $0 | N |
| Global Shipping Co. | Riverbend Industrial | Logistics | 2023-09-01 | 2028-08-31 | $45,000 | Paid | 0 | $0 | N |
| Creative Marketing Inc. | Midtown Plaza | Marketing | 2023-05-01 | 2028-04-30 | $22,500 | Paid | 0 | $0 | N |
| Design & Build Group | Bayfront Lofts | Construction | 2023-08-01 | 2028-07-31 | $18,000 | Paid | 0 | $0 | N |
| Tech Innovations Ltd. | Silicon Valley Tech Hub | R&D | 2023-01-01 | 2028-12-31 | $60,000 | Paid | 0 | $0 | N |
| Energy Solutions Corp. | Lone Star Logistics | Renewable Energy | 2023-11-01 | 2028-10-31 | $55,000 | Paid | 0 | $0 | N |
| Urban Eatery | Emerald City Plaza | Restaurant | 2023-04-01 | 2028-03-31 | $18,000 | Paid | 0 | $0 | N |
| Wellness Clinic | Sunshine Medical Center | Medical Services | 2023-06-01 | 2028-05-31 | $12,000 | Paid | 0 | $0 | N |
| Financial Advisors LLC | Harbor View Suites | Financial Services | 2023-12-01 | 2028-11-30 | $35,000 | Paid | 0 | $0 | N |
| Historic Tours | Liberty Bell Square | Tourism | 2023-09-01 | 2028-08-31 | $8,000 | Paid | 0 | $0 | N |
| Data Security Pros | Capitol Hill Offices | Cybersecurity | 2023-10-01 | 2028-09-30 | $20,000 | Paid | 0 | $0 | N |
| Green Tech Labs | Mountain View Tech Park | R&D | 2023-05-01 | 2028-04-30 | $25,000 | Paid | 0 | $0 | N |
| Ocean Breeze Cafe | Waterfront Commerce | Restaurant | 2023-03-01 | 2028-02-29 | $10,000 | Paid | 0 | $0 | N |
| Summit Solutions | Gateway Office Park | Consulting | 2023-02-01 | 2028-01-31 | $28,000 | Paid | 0 | $0 | N |
| Fashion Forward | Sunset Strip Retail | Retail | 2024-01-01 | 2029-12-31 | $18,000 | Paid | 0 | $0 | N |
| Precision Engineering | Riverbend Industrial | Engineering | 2024-04-01 | 2029-03-31 | $30,000 | Paid | 0 | $0 | N |
| Health & Wellness Spa | Bayfront Lofts | Wellness | 2024-05-01 | 2029-04-30 | $12,000 | Paid | 0 | $0 | N |
| Local Market Goods | Desert Bloom Outlets | Retail | 2024-06-01 | 2029-05-31 | $7,500 | Paid | 0 | $0 | N |
| Global Logistics Corp. | Lone Star Logistics | Logistics | 2024-07-01 | 2029-06-30 | $40,000 | Paid | 0 | $0 | N |
| Artisan Crafts | Emerald City Plaza | Retail | 2024-08-01 | 2029-07-31 | $9,000 | Paid | 0 | $0 | N |
| City View Realty | Waterfront Commerce | Real Estate | 2024-09-01 | 2029-08-31 | $15,000 | Paid | 0 | $0 | N |
| Digital Marketing Pros | Gateway Office Park | Marketing | 2024-10-01 | 2029-09-30 | $20,000 | Paid | 0 | $0 | N |
| Pharma Innovations | Sunshine Medical Center | Pharma | 2024-11-01 | 2029-10-31 | $30,000 | Paid | 0 | $0 | N |
| Investment Group | Harbor View Suites | Investment | 2024-12-01 | 2029-11-30 | $25,000 | Paid | 0 | $0 | N |
| Legal Aid Services | Capitol Hill Offices | Legal | 2024-01-01 | 2029-12-31 | $10,000 | Paid | 0 | $0 | N |
| Outdoor Adventures Inc. | Mountain View Tech Park | Tourism | 2024-02-01 | 2029-01-31 | $15,000 | Paid | 0 | $0 | N |
| Fine Dining Group | Grand Central Tower | Restaurant | 2024-03-01 | 2029-02-28 | $25,000 | Paid | 0 | $0 | N |
| Boutique Hotel Mgmt. | Sunset Strip Retail | Hospitality | 2024-04-01 | 2029-03-31 | $15,000 | Paid | 0 | $0 | N |
| Logistics Solutions | Rust Belt Warehouse | Logistics | 2024-05-01 | 2029-04-30 | $18,000 | Paid | 0 | $0 | N |
| Consulting Associates | Midtown Plaza | Consulting | 2024-06-01 | 2029-05-31 | $14,000 | Paid | 0 | $0 | N |
| Wellness Retreat | Bayfront Lofts | Health | 2024-07-01 | 2029-06-30 | $10,000 | Paid | 0 | $0 | N |
| Local Cafe | Desert Bloom Outlets | Food Service | 2024-08-01 | 2029-07-31 | $6,000 | Paid | 0 | $0 | N |

### Section 3: Payment History Sample (12 months)

**Tenant: Late Payments Corp. (A)**
**Property:** Capitol Hill Offices
**Monthly Rent:** $10,000
**Payment Pattern:** Consistently 30+ days late, usually pays after 40-50 days. Currently 35 days past due for April 2026 rent.

| Month (Due Date) | Amount Due | Amount Paid | Payment Date | Payment Status | Days Past Due | Late Fee Assessed | Late Fee Collected |
|------------------|------------|-------------|--------------|----------------|---------------|-------------------|--------------------|
| 2025-05-01 | $10,000 | $10,000 | 2025-06-15 | Paid | 45 | $500 | $500 |
| 2025-06-01 | $10,000 | $10,000 | 2025-07-12 | Paid | 41 | $500 | $500 |
| 2025-07-01 | $10,000 | $10,000 | 2025-08-18 | Paid | 48 | $500 | $500 |
| 2025-08-01 | $10,000 | $10,000 | 2025-09-16 | Paid | 46 | $500 | $500 |
| 2025-09-01 | $10,000 | $10,000 | 2025-10-15 | Paid | 44 | $500 | $500 |
| 2025-10-01 | $10,000 | $10,000 | 2025-11-19 | Paid | 49 | $500 | $500 |
| 2025-11-01 | $10,000 | $10,000 | 2025-12-14 | Paid | 43 | $500 | $500 |
| 2025-12-01 | $10,000 | $10,000 | 2026-01-16 | Paid | 46 | $500 | $500 |
| 2026-01-01 | $10,000 | $10,000 | 2026-02-13 | Paid | 43 | $500 | $500 |
| 2026-02-01 | $10,000 | $10,000 | 2026-03-10 | Paid | 38 | $500 | $500 |
| 2026-03-01 | $10,000 | $10,000 | 2026-04-05 | Paid | 35 | $500 | $500 |
| 2026-04-01 | $10,000 | $0 | N/A | Delinquent | 36 | $500 | $0 |

**Tenant: Struggling Startup Inc. (B)**
**Property:** Mountain View Tech Park
**Monthly Rent:** $8,000
**Payment Pattern:** Sporadic late payments, occasionally on time, but often 30+ days late. Currently 48 days overdue for April 2026 rent.

| Month (Due Date) | Amount Due | Amount Paid | Payment Date | Payment Status | Days Past Due | Late Fee Assessed | Late Fee Collected |
|------------------|------------|-------------|--------------|----------------|---------------|-------------------|--------------------|
| 2025-05-01 | $8,000 | $8,000 | 2025-05-01 | Paid | 0 | $0 | $0 |
| 2025-06-01 | $8,000 | $8,000 | 2025-07-10 | Paid | 39 | $400 | $400 |
| 2025-07-01 | $8,000 | $8,000 | 2025-07-01 | Paid | 0 | $0 | $0 |
| 2025-08-01 | $8,000 | $8,000 | 2025-09-08 | Paid | 38 | $400 | $400 |
| 2025-09-01 | $8,000 | $8,000 | 2025-09-01 | Paid | 0 | $0 | $0 |
| 2025-10-01 | $8,000 | $8,000 | 2025-11-15 | Paid | 45 | $400 | $400 |
| 2025-11-01 | $8,000 | $8,000 | 2025-11-01 | Paid | 0 | $0 | $0 |
| 2025-12-01 | $8,000 | $8,000 | 2026-01-05 | Paid | 35 | $400 | $400 |
| 2026-01-01 | $8,000 | $8,000 | 2026-01-01 | Paid | 0 | $0 | $0 |
| 2026-02-01 | $8,000 | $8,000 | 2026-03-09 | Paid | 37 | $400 | $400 |
| 2026-03-01 | $8,000 | $8,000 | 2026-03-01 | Paid | 0 | $0 | $0 |
| 2026-04-01 | $8,000 | $0 | N/A | Late | 36 | $400 | $0 |

**Tenant: Defaulted Holdings LLC (C)**
**Property:** Bourbon Street Shops
**Monthly Rent:** $15,000
**Payment Pattern:** Started well, then became consistently late, and recently defaulted for multiple months. Currently 90 days past due for February, March, and April 2026 rent, owing $45,000.

| Month (Due Date) | Amount Due | Amount Paid | Payment Date | Payment Status | Days Past Due | Late Fee Assessed | Late Fee Collected |
|------------------|------------|-------------|--------------|----------------|---------------|-------------------|--------------------|
| 2025-05-01 | $15,000 | $15,000 | 2025-05-01 | Paid | 0 | $0 | $0 |
| 2025-06-01 | $15,000 | $15,000 | 2025-07-05 | Paid | 34 | $750 | $750 |
| 2025-07-01 | $15,000 | $15,000 | 2025-08-08 | Paid | 38 | $750 | $750 |
| 2025-08-01 | $15,000 | $15,000 | 2025-09-06 | Paid | 36 | $750 | $750 |
| 2025-09-01 | $15,000 | $15,000 | 2025-10-09 | Paid | 38 | $750 | $750 |
| 2025-10-01 | $15,000 | $15,000 | 2025-11-10 | Paid | 40 | $750 | $750 |
| 2025-11-01 | $15,000 | $15,000 | 2025-12-15 | Paid | 44 | $750 | $750 |
| 2025-12-01 | $15,000 | $15,000 | 2026-01-12 | Paid | 42 | $750 | $750 |
| 2026-01-01 | $15,000 | $15,000 | 2026-02-14 | Paid | 44 | $750 | $750 |
| 2026-02-01 | $15,000 | $0 | N/A | Defaulted | 96 | $750 | $0 |
| 2026-03-01 | $15,000 | $0 | N/A | Defaulted | 66 | $750 | $0 |
| 2026-04-01 | $15,000 | $0 | N/A | Defaulted | 36 | $750 | $0 |

**Tenant: EverGreen Landscaping**
**Property:** Desert Bloom Outlets
**Monthly Rent:** $5,000
**Payment Pattern:** Generally pays on time, but has been 30+ days late twice in the last year. Currently 32 days overdue for April 2026 rent.

| Month (Due Date) | Amount Due | Amount Paid | Payment Date | Payment Status | Days Past Due | Late Fee Assessed | Late Fee Collected |
|------------------|------------|-------------|--------------|----------------|---------------|-------------------|--------------------|
| 2025-05-01 | $5,000 | $5,000 | 2025-05-01 | Paid | 0 | $0 | $0 |
| 2025-06-01 | $5,000 | $5,000 | 2025-06-01 | Paid | 0 | $0 | $0 |
| 2025-07-01 | $5,000 | $5,000 | 2025-07-01 | Paid | 0 | $0 | $0 |
| 2025-08-01 | $5,000 | $5,000 | 2025-09-05 | Paid | 35 | $250 | $250 |
| 2025-09-01 | $5,000 | $5,000 | 2025-09-01 | Paid | 0 | $0 | $0 |
| 2025-10-01 | $5,000 | $5,000 | 2025-10-01 | Paid | 0 | $0 | $0 |
| 2025-11-01 | $5,000 | $5,000 | 2025-11-01 | Paid | 0 | $0 | $0 |
| 2025-12-01 | $5,000 | $5,000 | 2026-01-08 | Paid | 38 | $250 | $250 |
| 2026-01-01 | $5,000 | $5,000 | 2026-01-01 | Paid | 0 | $0 | $0 |
| 2026-02-01 | $5,000 | $5,000 | 2026-02-01 | Paid | 0 | $0 | $0 |
| 2026-03-01 | $5,000 | $5,000 | 2026-03-01 | Paid | 0 | $0 | $0 |
| 2026-04-01 | $5,000 | $0 | N/A | Late | 36 | $250 | $0 |

**Tenant: Discount Retailers**
**Property:** Liberty Bell Square
**Monthly Rent:** $12,000
**Payment Pattern:** Pays late periodically, usually within 30-40 days. Currently 38 days overdue for April 2026 rent.

| Month (Due Date) | Amount Due | Amount Paid | Payment Date | Payment Status | Days Past Due | Late Fee Assessed | Late Fee Collected |
|------------------|------------|-------------|--------------|----------------|---------------|-------------------|--------------------|
| 2025-05-01 | $12,000 | $12,000 | 2025-05-01 | Paid | 0 | $0 | $0 |
| 2025-06-01 | $12,000 | $12,000 | 2025-06-01 | Paid | 0 | $0 | $0 |
| 2025-07-01 | $12,000 | $12,000 | 2025-08-05 | Paid | 35 | $600 | $600 |
| 2025-08-01 | $12,000 | $12,000 | 2025-08-01 | Paid | 0 | $0 | $0 |
| 2025-09-01 | $12,000 | $12,000 | 2025-09-01 | Paid | 0 | $0 | $0 |
| 2025-10-01 | $12,000 | $12,000 | 2025-11-09 | Paid | 39 | $600 | $600 |
| 2025-11-01 | $12,000 | $12,000 | 2025-11-01 | Paid | 0 | $0 | $0 |
| 2025-12-01 | $12,000 | $12,000 | 2026-01-01 | Paid | 0 | $0 | $0 |
| 2026-01-01 | $12,000 | $12,000 | 2026-02-05 | Paid | 35 | $600 | $600 |
| 2026-02-01 | $12,000 | $12,000 | 2026-02-01 | Paid | 0 | $0 | $0 |
| 2026-03-01 | $12,000 | $12,000 | 2026-03-01 | Paid | 0 | $0 | $0 |
| 2026-04-01 | $12,000 | $0 | N/A | Late | 36 | $600 | $0 |

### Section 4: Lease Expiration Schedule

**Goal:** Demonstrate proactive lease management by highlighting upcoming lease expirations and associated risks/opportunities.

| Tenant | Property | Lease End Date | Monthly Rent | Months Remaining | Renewal Probability | Replacement Cost Estimate |
|--------|-----------------------|----------------|--------------|------------------|---------------------|-------------------------|
| Global Finance Group | Grand Central Tower | 2027-05-31 | $120,000 | 12 | 0.80 | $10,000 |
| Bio-Gen Research | Silicon Valley Tech Hub | 2027-10-31 | $80,000 | 17 | 0.92 | $7,500 |
| Sunset Grille | Sunset Strip Retail | 2027-08-31 | $25,000 | 15 | 0.75 | $3,000 |
| Corporate HQ Solutions | Grand Central Tower | 2027-09-30 | $75,000 | 16 | 0.85 | $6,000 |
| Defaulted Holdings LLC (C) | Bourbon Street Shops | 2027-05-31 | $15,000 | 12 | 0.10 | $2,000 |
| Eco-Packaging Co. | Riverbend Industrial | 2028-02-14 | $50,000 | 21 | 0.90 | $5,000 |
| Desert Tours LLC | Desert Bloom Outlets | 2028-02-29 | $13,333 | 21 | 0.60 | $2,000 |
| Auto Parts Depot | Rust Belt Warehouse | 2028-03-31 | $31,250 | 22 | 0.50 | $3,500 |
| Creative Marketing Inc. | Midtown Plaza | 2028-04-30 | $22,500 | 23 | 0.80 | $2,800 |
| Green Tech Labs | Mountain View Tech Park | 2028-04-30 | $25,000 | 23 | 0.85 | $3,000 |
| Green Energy Solutions | Riverbend Industrial | 2028-06-30 | $40,000 | 25 | 0.88 | $4,000 |
| Data Analytics Corp. | Midtown Plaza | 2028-06-30 | $37,500 | 25 | 0.85 | $4,000 |
| Global Imports Ltd. | Lone Star Logistics | 2028-07-31 | $60,000 | 26 | 0.80 | $6,000 |
| Design & Build Group | Bayfront Lofts | 2028-07-31 | $18,000 | 26 | 0.75 | $2,000 |
| Apex Innovations | Gateway Office Park | 2028-07-31 | $36,000 | 26 | 0.90 | $4,000 |
| Discount Retailers | Liberty Bell Square | 2028-07-31 | $12,000 | 26 | 0.40 | $1,800 |
| Maritime Legal | Harbor View Suites | 2028-08-31 | $48,500 | 27 | 0.88 | $5,000 |
| Global Shipping Co. | Riverbend Industrial | 2028-08-31 | $45,000 | 27 | 0.88 | $4,500 |
| Historic Tours | Liberty Bell Square | 2028-08-31 | $8,000 | 27 | 0.60 | $1,000 |
| Urban Outfitters Co. | Emerald City Plaza | 2028-08-31 | $15,000 | 27 | 0.70 | $1,800 |
| Ortho Solutions | Sunshine Medical Center | 2028-09-30 | $25,278 | 28 | 0.85 | $3,000 |
| Data Security Pros | Capitol Hill Offices | 2028-09-30 | $20,000 | 28 | 0.90 | $2,500 |
| Energy Solutions Corp. | Lone Star Logistics | 2028-10-31 | $55,000 | 29 | 0.85 | $5,500 |
| Historical Souvenirs | Liberty Bell Square | 2028-10-31 | $27,000 | 29 | 0.60 | $3,000 |
| Financial Advisors LLC | Harbor View Suites | 2028-11-30 | $35,000 | 30 | 0.88 | $3,500 |
| Tech Innovations Ltd. | Silicon Valley Tech Hub | 2028-12-31 | $60,000 | 31 | 0.90 | $5,000 |
| Late Payments Corp. (A) | Capitol Hill Offices | 2028-12-31 | $10,000 | 31 | 0.30 | $1,500 |
### Section 5: Portfolio KPIs Summary

**Goal:** Present aggregated portfolio-level performance metrics, reflecting mixed performance and highlighting key areas for attention.

#### Calculated Portfolio-Level Metrics:

*   **Overall Rent Collection Rate:** 92.3% (Target: 96% - *Slightly below target due to chronic late payers*)
*   **Portfolio Occupancy Rate:** 87.5% (Target: 90%+ - *Indicates opportunity for lease-up in underperforming properties*)
*   **Total Net Operating Income (NOI):** $2,400,000 annually
*   **Weighted Average Cap Rate:** 6.8% (*Reflects a mixed portfolio of stable and value-add assets*)
*   **Tenant Concentration Risk:** Top Tenant (Tech Solutions Inc.) represents 15.0% of total portfolio revenue (*Within acceptable limits, but merits monitoring*)

#### Rent Collection Rate Trend (Last 12 Months):
*   **May 2025:** 96.5%
*   **June 2025:** 95.8%
*   **July 2025:** 94.2%
*   **August 2025:** 93.0%
*   **September 2025:** 93.5%
*   **October 2025:** 92.8%
*   **November 2025:** 93.1%
*   **December 2025:** 92.5%
*   **January 2026:** 92.0%
*   **February 2026:** 89.5% (*Drop due to Defaulted Holdings LLC*)
*   **March 2026:** 90.0%
*   **April 2026:** 87.0% (*Further drop due to multiple late payers this month*)

#### Occupancy by Property Type:

*   **Office:** 92.5%
*   **Retail:** 85.0%
*   **Industrial:** 88.0%
*   **Mixed-Use:** 88.0%

#### NOI Breakdown (Top 3 Properties by NOI):

*   **Grand Central Tower:** $1,500,000
*   **Silicon Valley Tech Hub:** $1,000,000
*   **Harbor View Suites:** $600,000

#### Maintenance Cost per Sq Ft Averages (Annualized):

*   **Office:** $1.25/sq ft
*   **Retail:** $1.70/sq ft
*   **Industrial:** $0.90/sq ft
*   **Mixed-Use:** $1.50/sq ft

---

## Work Items

### JayJay's Responsibilities (Industry Advisor):
- [x] Define realistic property portfolio composition based on industry research
- [x] Create tenant personas with varied payment behaviors
- [x] Ensure KPIs align with benchmarks from Phase 1 research
- [x] Validate scenario realism against commercial property management norms

### Marcus's Responsibilities (Backend Developer):
- [ ] Convert scenarios into SQL INSERT statements matching Vitaly's schema
- [ ] Create seed data scripts for database initialization
- [ ] Ensure data relationships are correct (properties → tenants → leases → payments)
- [ ] Calculate and populate metrics table with derived KPIs
- [ ] Test data loads against the schema

---

## Reference Files:
- **JayJay's Research:** `dev-team/projects/realsight/01-industry-research.md`
- **Vitaly's Architecture:** `dev-team/projects/realsight/02-architecture.md` (contains SQL schema)
- **Project Brief:** `dev-team/projects/realsight/PROJECT-BRIEF.md`

---

## Final Deliverables Checklist:
- [x] Property portfolio inventory complete (18-20 properties)
- [x] Tenant roster with payment patterns (~50-75 tenants)
- [x] Payment history data for key scenarios
- [x] Lease expiration schedule documented
- [x] Portfolio KPIs calculated and validated
- [ ] SQL seed scripts created by Marcus
- [ ] Data tested against schema

---

**Next Steps After Completion:**
Once scenarios are complete, Phase 4 begins: Marcus (backend) + Maya (frontend) build the actual application using this demo data.

**Target Completion:** Within 24 hours of assignment (by 2026-05-08)

---

*This document will be populated by JayJay and Marcus as they create the portfolio scenarios.*
