
const express = require('express');
const router = express.Router();
const { getRegions } = require('../services/regionService');

// GET /api/regions - Hae saatavilla olevat toimipisteet
router.get('/', async (req, res) => {
  try {
    const regions = await getRegions();
    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ error: 'Failed to fetch regions' });
  }
});

module.exports = router;
