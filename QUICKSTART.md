# RealSight Frontend — Quick Start Guide

**For:** Tom Nowakowski  
**From:** Maya (Frontend Developer)  
**Date:** 2026-05-07  

---

## 🎯 What's Ready

I've built the RealSight frontend UI based on your scenarios. Here's what you can see right now:

### ✅ Working Features

1. **Dashboard Overview** — KPI cards showing rent collection rate, occupancy, outstanding debt
2. **Tenant Financials Table** — The priority feature! Shows all tenants with payment status, days past due, amounts owed
3. **Portfolio Selector** — Choose between different property portfolios
4. **Property Drill-Down** — Filter tenants by specific properties within a portfolio
5. **Priority Alerts** — Visual warnings for problem tenants (delinquent, defaulted accounts)

### 🎨 What It Looks Like

- Dark theme professional dashboard (similar to Dentsight but with emerald/teal branding)
- Color-coded tenant statuses: Green ✓ = Paid, Yellow ⚠️ = Late, Red 🔴 = Defaulted
- Problem tenants highlighted with red/orange row backgrounds for instant visibility

---

## 🚀 How to Run It

### Option 1: Quick Preview (Recommended)

```bash
cd dev-team/projects/realsight/frontend

# Install dependencies (one-time)
npm install

# Start the dev server
npm run dev
```

Then open: **http://localhost:5173**

### Option 2: If You Already Have Dentsight Running

The RealSight frontend is in a separate folder, so you can run both simultaneously:

- Dentsight: `dev-team/projects/dentsight/frontend` → port 5173
- RealSight: `dev-team/projects/realsight/frontend` → port 5174 (if 5173 is taken)

---

## 📊 What You'll See

### On the Overview Page:

1. **KPI Cards** at the top showing:
   - Rent Collection Rate: 87.5% (target: 92%)
   - Portfolio Occupancy: 94.2%
   - Total Outstanding Debt: $18,600
   - Average Days Past Due: 12 days

2. **Priority Alerts** section highlighting:
   - 🔴 CRITICAL: Fitness First Gym — 92 days past due, $6,200 owed
   - 🟠 WARNING: Fashion Forward Boutique — 45 days delinquent, $3,800 owed
   - 🔵 NOTICE: Quick Stop Grocery — partial payment received

3. **Quick Stats** showing total properties (4), active tenants (8), monthly revenue ($65K)

### On the Tenant Financials Tab:

A sortable data table with columns:
- Tenant Name + business type
- Property location
- Monthly rent amount
- Amount currently owed
- Payment status badge
- Days past due (with color coding)
- "View Details" action button

**Click column headers to sort** — try sorting by "Days Past Due" to see problem tenants at the top!

---

## 🧪 Test Scenarios Included

The mock data includes realistic tenant scenarios based on your research:

| Scenario | Tenant | Issue | Visual Indicator |
|----------|--------|-------|------------------|
| **Critical Default** | Fitness First Gym | 92 days past due, $6,200 | Red row + "Defaulted" badge + ⚠️ icon |
| **Delinquent Account** | Fashion Forward Boutique | 45 days, $3,800 | Orange row + "Delinquent" badge |
| **Partial Payment** | Quick Stop Grocery | Paid 50%, 10 days late | Blue status badge |
| **Late Payment** | Downtown Coffee Co. | 15 days, full amount owed | Yellow warning badge |
| **Healthy Tenants** | TechStart, Metro Medical, etc. | All paid on time | Green "Paid" badges |

---

## 🔌 Next Steps — Backend Integration

### For Marcus (Backend Developer):

The frontend is using mock data right now. Once your API endpoints are ready, Maya will swap in real data calls. Here's what the API needs to return:

#### Priority Endpoint #1: Tenant Financials
```
GET /api/tenants?property_id=p1

Expected Response:
[
  {
    "id": "t1",
    "business_name": "TechStart Solutions",
    "business_type": "Technology",
    "monthly_rent": 8500,
    "amount_paid": 8500,
    "payment_status": "paid",
    "days_past_due": 0
  },
  // ... more tenants
]
```

#### Priority Endpoint #2: KPI Data
```
GET /api/kpi/portfolio-overview?portfolio_id=1

Expected Response:
{
  "rentCollectionRate": 87.5,
  "portfolioOccupancy": 94.2,
  "totalOutstandingDebt": 18600,
  "avgDaysPastDue": 12
}
```

See `FRONTEND-SPRINT-SUMMARY.md` for the full API contract.

---

## 📁 File Locations

| What | Where |
|------|-------|
| Main App | `frontend/src/App.tsx` |
| Tenant Table Component | `frontend/src/components/TenantFinancialsTable.tsx` |
| KPI Cards | `frontend/src/components/RealEstateKPICards.tsx` |
| Portfolio Selector | `frontend/src/components/PortfolioPropertySelector.tsx` |
| State Management | `frontend/src/store/useRealSightStore.ts` |
| Full Sprint Summary | `FRONTEND-SPRINT-SUMMARY.md` |

---

## 💡 Tips for Reviewing

1. **Start with Tenant Financials tab** — This is the core feature you asked for
2. **Try the portfolio selector** — Click to see different portfolios (Midwest Commercial, Great Lakes Retail)
3. **Sort the tenant table** — Click "Days Past Due" header to see problem tenants first
4. **Check mobile view** — Resize browser to see mobile menu (works on phone too!)

---

## 🐛 Known Limitations

- All data is currently mocked (not connected to real backend)
- Charts/visualizations coming in Phase 2
- Authentication/login not implemented yet
- Some tabs are placeholders (Portfolio Performance, Acquisition Targets)

---

## ✅ Sprint Complete!

**Status:** Frontend Phase 1 — DONE  
**Time Spent:** ~6 hours  
**Components Built:** 4 major components + state management  
**Ready For:** Backend integration with Marcus's API  

---

**Questions?** Just ask. I'm here to help wire this up once the backend is ready! 🤙

— Maya
