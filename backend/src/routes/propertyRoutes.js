const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/properties?portfolio_id=X - Get properties by portfolio
router.get('/', async (req, res) => {
  try {
    const { portfolio_id } = req.query;
    
    if (!portfolio_id) {
      return res.status(400).json({ error: 'portfolio_id query parameter is required' });
    }
    
    const properties = await prisma.property.findMany({
      where: { portfolio_id },
      include: {
        _count: { select: { tenants: true, leases: true, payments: true } },
        tenants: {
          include: {
            leases: true,
            payments: {
              orderBy: { time: 'desc' },
              take: 1 // Most recent payment
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/properties/:id - Get single property with full details
router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: {
        portfolio: true,
        tenants: {
          include: {
            leases: true,
            payments: {
              orderBy: { time: 'desc' }
            }
          }
        },
        _count: { select: { tenants: true, leases: true, payments: true } }
      }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

module.exports = router;
