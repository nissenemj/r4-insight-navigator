
const express = require('express');
const router = express.Router();
const { getActiveAlerts, createAlert } = require('../services/alertService');

// GET /api/alerts - Hae aktiiviset hälytykset
router.get('/', async (req, res) => {
  try {
    const { region, severity } = req.query;
    const alerts = await getActiveAlerts(region, severity);
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts - Luo uusi hälytys (järjestelmäkäyttöön)
router.post('/', async (req, res) => {
  try {
    const alertData = req.body;
    const alert = await createAlert(alertData);
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = router;
