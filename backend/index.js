const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Health ────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Portfolios ────────────────────────────────────────────────────────────
app.get('/api/portfolios', async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: { _count: { select: { properties: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(portfolios.map(p => ({ ...p, property_count: p._count.properties })));
  } catch (err) {
    console.error('GET /api/portfolios error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

app.get('/api/portfolios/:id', async (req, res) => {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: req.params.id },
      include: { properties: true, metrics: true }
    });
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' });
    res.json(portfolio);
  } catch (err) {
    console.error('GET /api/portfolios/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// ─── Properties ────────────────────────────────────────────────────────────
app.get('/api/properties', async (req, res) => {
  try {
    const { portfolio_id } = req.query;
    if (!portfolio_id) return res.status(400).json({ error: 'portfolio_id is required' });

    const properties = await prisma.property.findMany({
      where: { portfolio_id },
      include: {
        _count: { select: { tenants: true } }
      },
      orderBy: { name: 'asc' }
    });
    res.json(properties.map(p => ({ ...p, tenant_count: p._count.tenants })));
  } catch (err) {
    console.error('GET /api/properties error:', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// NOTE: /api/properties/performance MUST be registered before /api/properties/:id
// or Express will match 'performance' as an :id param and return 404.
app.get('/api/properties/performance', async (req, res) => {
  try {
    const { portfolio_id } = req.query;
    if (!portfolio_id) return res.status(400).json({ error: 'portfolio_id is required' });

    const properties = await prisma.property.findMany({
      where: { portfolio_id },
      include: {
        tenants: {
          include: {
            leases: true,
            payments: { orderBy: { time: 'desc' } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const result = properties.map(prop => {
      const tenants = prop.tenants;
      const occupiedUnits = tenants.filter(t => t.leases.length > 0).length;
      const occupancyRate = prop.unit_count > 0 ? (occupiedUnits / prop.unit_count) * 100 : 0;

      // Current month = from the 1st of this month
      const cutoff = new Date();
      cutoff.setDate(1); cutoff.setHours(0, 0, 0, 0);

      let totalDue = 0, totalPaid = 0, problemCount = 0;
      let totalDaysPastDue = 0, lateTenantCount = 0;

      tenants.forEach(t => {
        const lease = t.leases[0];
        // Most recent payment regardless of month (seed data uses monthStart dates)
        const currentPmt = t.payments[0];
        if (lease) totalDue += lease.monthly_rent;
        if (currentPmt) {
          totalPaid += currentPmt.amount_paid;
          if (currentPmt.days_past_due > 0) { totalDaysPastDue += currentPmt.days_past_due; lateTenantCount++; }
          if (['partial', 'delinquent', 'defaulted'].includes(currentPmt.payment_status)) problemCount++;
        }
      });

      // 6-month revenue sparkline
      const monthlyRevenue = [];
      for (let mo = 5; mo >= 0; mo--) {
        const mStart = new Date(); mStart.setDate(1); mStart.setHours(0, 0, 0, 0); mStart.setMonth(mStart.getMonth() - mo - 1);
        const mEnd   = new Date(); mEnd.setDate(1);   mEnd.setHours(0, 0, 0, 0);   mEnd.setMonth(mEnd.getMonth() - mo);
        const pmts = tenants.flatMap(t => t.payments.filter(p => new Date(p.time) >= mStart && new Date(p.time) < mEnd));
        monthlyRevenue.push(pmts.reduce((s, p) => s + p.amount_paid, 0));
      }

      const collectionRate  = totalDue > 0 ? (totalPaid / totalDue) * 100 : 100;
      const revenuePerSqft  = prop.total_square_feet > 0 ? totalPaid / prop.total_square_feet : 0;
      const estimatedNoi    = totalPaid * 0.65;

      return {
        id: prop.id, name: prop.name, property_type: prop.property_type,
        city: prop.city, state: prop.state,
        total_square_feet: prop.total_square_feet, unit_count: prop.unit_count,
        occupied_units: occupiedUnits,
        occupancy_rate: parseFloat(occupancyRate.toFixed(1)),
        total_due: totalDue, total_paid: totalPaid,
        collection_rate: parseFloat(collectionRate.toFixed(1)),
        outstanding: Math.max(0, totalDue - totalPaid),
        revenue_per_sqft: parseFloat(revenuePerSqft.toFixed(2)),
        estimated_noi: parseFloat(estimatedNoi.toFixed(0)),
        problem_tenants: problemCount,
        avg_days_past_due: lateTenantCount > 0 ? parseFloat((totalDaysPastDue / lateTenantCount).toFixed(1)) : 0,
        tenant_count: tenants.length,
        monthly_revenue_trend: monthlyRevenue
      };
    });

    res.json(result);
  } catch (err) {
    console.error('GET /api/properties/performance error:', err);
    res.status(500).json({ error: 'Failed to fetch property performance' });
  }
});

app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { tenants: { include: { leases: true, payments: true } } }
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    console.error('GET /api/properties/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ─── Tenants ───────────────────────────────────────────────────────────────
app.get('/api/tenants', async (req, res) => {
  try {
    const { property_id, portfolio_id } = req.query;
    if (!property_id && !portfolio_id) return res.status(400).json({ error: 'property_id or portfolio_id is required' });

    // Portfolio-wide: fetch all tenants across all properties
    if (portfolio_id && !property_id) {
      const properties = await prisma.property.findMany({ where: { portfolio_id }, select: { id: true } });
      const propertyIds = properties.map(p => p.id);
      const tenants = await prisma.tenant.findMany({
        where: { property_id: { in: propertyIds } },
        include: { leases: true, payments: { orderBy: { time: 'desc' }, take: 12 } },
        orderBy: { business_name: 'asc' }
      });
      const enriched = tenants.map(t => {
        const lease = t.leases[0] || null;
        const currentPayment = t.payments[0] || null;
        return { ...t, lease, currentPayment,
          outstanding_balance: t.payments.reduce((s, p) => s + Math.max(0, p.amount_due - p.amount_paid), 0),
          total_paid: t.payments.reduce((s, p) => s + p.amount_paid, 0),
          total_due: t.payments.reduce((s, p) => s + p.amount_due, 0)
        };
      });
      return res.json(enriched);
    }

    const tenants = await prisma.tenant.findMany({
      where: { property_id },
      include: {
        leases: true,
        payments: { orderBy: { time: 'desc' }, take: 12 }
      },
      orderBy: { business_name: 'asc' }
    });

    // Attach computed fields expected by frontend calculations
    const enriched = tenants.map(t => {
      const lease = t.leases[0] || null;
      const currentPayment = t.payments[0] || null;
      const outstanding = t.payments.reduce((sum, p) => sum + Math.max(0, p.amount_due - p.amount_paid), 0);
      return {
        ...t,
        lease,
        currentPayment,
        outstanding_balance: outstanding,
        total_paid: t.payments.reduce((sum, p) => sum + p.amount_paid, 0),
        total_due: t.payments.reduce((sum, p) => sum + p.amount_due, 0)
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error('GET /api/tenants error:', err);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

app.get('/api/tenants/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: { leases: true, payments: { orderBy: { time: 'desc' } } }
    });
    if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
    const lease = tenant.leases[0] || null;
    const currentPayment = tenant.payments[0] || null;
    res.json({ ...tenant, lease, currentPayment });
  } catch (err) {
    console.error('GET /api/tenants/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

// ─── Metrics (trend data for Portfolio Performance tab) ───────────────────
app.get('/api/metrics', async (req, res) => {
  try {
    const { portfolio_id } = req.query;
    if (!portfolio_id) return res.status(400).json({ error: 'portfolio_id is required' });
    const metrics = await prisma.metric.findMany({
      where: { portfolio_id },
      orderBy: { metric_date: 'asc' }
    });
    res.json(metrics);
  } catch (err) {
    console.error('GET /api/metrics error:', err);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// ─── Static frontend (SPA fallback) ────────────────────────────────────────
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('/{*path}', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 RealSight backend running on port ${port}`);
});
