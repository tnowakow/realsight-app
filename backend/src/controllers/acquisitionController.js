/**
 * Acquisition Controller
 * Handles API endpoints for the Acquisition & Divestment feature
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get the acquisition pipeline - list of potential targets with scores
 */
const getPipeline = async (req, res) => {
  try {
    const acquisitions = await prisma.acquisitionTarget.findMany({
      include: {
        scores: true,
        property: {
          select: {
            name: true,
            city: true,
            state: true,
          }
        }
      }
      // REMOVED: The orderBy clause was causing a server crash.
      // Sorting will be handled in the application code below.
    });
    
    // Manually attach property details and the relevant score to the top level for easier frontend access
    const result = acquisitions.map(acq => ({
      ...acq,
      property_name: acq.property.name,
      address: `${acq.property.city}, ${acq.property.state}`,
      market: acq.property.city,
      // Use the composite score from the first (and likely only) score record
      acquisition_score: acq.scores[0]?.composite_score || 0, 
    }));
    
    // Now, sort the results reliably in application code
    result.sort((a, b) => b.acquisition_score - a.acquisition_score);

    res.json(result);
  } catch (err) {
    console.error('GET /api/acquisitions/pipeline error:', err);
    res.status(500).json({ error: 'Failed to fetch acquisition pipeline' });
  }
};

/**
 * Get detailed information for a specific acquisition target
 */
const getTargetDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const target = await prisma.acquisitionTarget.findUnique({
      where: { id },
      include: {
        scores: true,
        property: true // Include related property data
      }
    });
    
    if (!target) return res.status(404).json({ error: 'Acquisition target not found' });
    
    res.json(target);
  } catch (err) {
    console.error('GET /api/acquisitions/:id error:', err);
    res.status(500).json({ error: 'Failed to fetch acquisition target details' });
  }
};

/**
 * Calculate and score a new acquisition target
 */
const scoreTarget = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // For now, return placeholder response - actual scoring logic will be implemented later
    const result = {
      status: 'success',
      message: 'Scoring logic would be implemented here',
      targetId: propertyId,
      compositeScore: 0,
      breakdown: {
        financials: 0,
        valueAdd: 0,
        marketLocation: 0,
        propertyCharacteristics: 0
      }
    };
    
    res.json(result);
  } catch (err) {
    console.error('POST /api/acquisitions/score error:', err);
    res.status(500).json({ error: 'Failed to score acquisition target' });
  }
};

module.exports = {
  getPipeline,
  getTargetDetails,
  scoreTarget
};