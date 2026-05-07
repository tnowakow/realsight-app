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
    const { property_id } = req.query;
    if (!property_id) return res.status(400).json({ error: 'property_id is required' });

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

// ─── Static frontend (SPA fallback) ────────────────────────────────────────
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(publicDir, 'index.html'));
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 RealSight backend running on port ${port}`);
});
