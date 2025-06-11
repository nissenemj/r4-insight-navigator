
const express = require('express');
const router = express.Router();
const { getKPIData, getTrendData, getComparisonData } = require('../services/kpiService');

// GET /api/kpi/overview - Yleiskatsaus KPI-mittareista
router.get('/overview', async (req, res) => {
  try {
    const { region = 'all' } = req.query;
    const data = await getKPIData('overview', region);
    res.json(data);
  } catch (error) {
    console.error('Error fetching KPI overview:', error);
    res.status(500).json({ error: 'Failed to fetch KPI data' });
  }
});

// GET /api/kpi/:area - KPI-mittarit tietylle osa-alueelle
router.get('/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const { region = 'all' } = req.query;
    const data = await getKPIData(area, region);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching KPI data for ${req.params.area}:`, error);
    res.status(500).json({ error: 'Failed to fetch KPI data' });
  }
});

// GET /api/kpi/comparison - Vertailutiedot toimipisteiden välillä
router.get('/comparison', async (req, res) => {
  try {
    const { areas, period = '6months' } = req.query;
    const data = await getComparisonData(areas, period);
    res.json(data);
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    res.status(500).json({ error: 'Failed to fetch comparison data' });
  }
});

// GET /api/kpi/trends/:area - Trenditiedot tietylle osa-alueelle
router.get('/trends/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const { region = 'all', period = '12months' } = req.query;
    const data = await getTrendData(area, region, period);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching trend data for ${req.params.area}:`, error);
    res.status(500).json({ error: 'Failed to fetch trend data' });
  }
});

// GET /api/kpi/costs - Kustannustiedot
router.get('/costs', async (req, res) => {
  try {
    const { region = 'all', period = '12months' } = req.query;
    const data = await getKPIData('costs', region, period);
    res.json(data);
  } catch (error) {
    console.error('Error fetching cost data:', error);
    res.status(500).json({ error: 'Failed to fetch cost data' });
  }
});

module.exports = router;
