const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/portfolios - Get all portfolios
router.get('/', async (req, res) => {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: {
        _count: {
          select: { properties: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    // Add property count to response
    const portfolioList = portfolios.map(p => ({
      ...p,
      property_count: p._count.properties
    }));
    
    res.json(portfolioList);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({ error: 'Failed to fetch portfolios' });
  }
});

// GET /api/portfolios/:id - Get single portfolio with properties
router.get('/:id', async (req, res) => {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: req.params.id },
      include: {
        properties: {
          include: {
            _count: { select: { tenants: true } },
            tenants: {
              include: {
                leases: true,
                payments: true
              }
            }
          }
        },
        metrics: true
      }
    });
    
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
    
    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

module.exports = router;
