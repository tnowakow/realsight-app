const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/tenants?property_id=X - Get tenants by property
router.get('/', async (req, res) => {
  try {
    const { property_id } = req.query;
    
    if (!property_id) {
      return res.status(400).json({ error: 'property_id query parameter is required' });
    }
    
    const tenants = await prisma.tenant.findMany({
      where: { property_id },
      include: {
        property: true,
        leases: true,
        payments: {
          orderBy: { time: 'desc' },
          take: 12 // Last 12 months of payment history
        }
      },
      orderBy: { business_name: 'asc' }
    });
    
    // Add current payment info to each tenant
    const tenantsWithCurrentPayment = tenants.map(tenant => {
      const currentPayment = tenant.payments[0] || null;
      
      return {
        ...tenant,
        lease: tenant.leases[0] || null,
        currentPayment,
        // Calculate payment status summary
        total_due: tenant.payments.reduce((sum, p) => sum + p.amount_due, 0),
        total_paid: tenant.payments.reduce((sum, p) => sum + p.amount_paid, 0),
        outstanding_balance: tenant.payments.reduce((sum, p) => sum + (p.amount_due - p.amount_paid), 0)
      };
    });
    
    res.json(tenantsWithCurrentPayment);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

// GET /api/tenants/:id - Get single tenant with full history
router.get('/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: {
        property: true,
        leases: true,
        payments: {
          orderBy: { time: 'desc' }
        }
      }
    });
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Add calculated fields
    const tenantWithMetrics = {
      ...tenant,
      lease: tenant.leases[0] || null,
      currentPayment: tenant.payments[0] || null,
      total_due: tenant.payments.reduce((sum, p) => sum + p.amount_due, 0),
      total_paid: tenant.payments.reduce((sum, p) => sum + p.amount_paid, 0),
      outstanding_balance: tenant.payments.reduce((sum, p) => sum + (p.amount_due - p.amount_paid), 0),
      payment_history_length: tenant.payments.length
    };
    
    res.json(tenantWithMetrics);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Failed to fetch tenant' });
  }
});

module.exports = router;
