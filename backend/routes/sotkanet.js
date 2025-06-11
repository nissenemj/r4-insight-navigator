
const express = require('express');
const axios = require('axios');
const router = express.Router();

const SOTKANET_BASE_URL = 'https://sotkanet.fi/rest/1.1';
const PSHVA_REGION_ID = 974; // Pohjois-Savon hyvinvointialueen ID

// Hae kaikki alueet
router.get('/regions', async (req, res) => {
  try {
    console.log('Fetching regions from Sotkanet API...');
    const url = `${SOTKANET_BASE_URL}/regions`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sotkanet regions response status: ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching regions:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch regions from Sotkanet',
      details: error.message 
    });
  }
});

// Hae kaikki indikaattorit
router.get('/indicators', async (req, res) => {
  try {
    console.log('Fetching indicators from Sotkanet API...');
    const url = `${SOTKANET_BASE_URL}/indicators`;
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sotkanet indicators response status: ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching indicators:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch indicators from Sotkanet',
      details: error.message 
    });
  }
});

// Hae yksittäinen indikaattori
router.get('/data/:indicator', async (req, res) => {
  try {
    const { indicator } = req.params;
    const { region = PSHVA_REGION_ID, year = 2023, gender = 'total' } = req.query;
    
    console.log(`Fetching indicator ${indicator} for region ${region}, year ${year}`);
    
    // Korjattu 'years' parametri (monikko)
    const url = `${SOTKANET_BASE_URL}/json?indicator=${indicator}&years=${year}&regions=${region}&genders=${gender}`;
    console.log(`Sotkanet URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sotkanet data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching indicator data:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch indicator data from Sotkanet',
      details: error.message 
    });
  }
});

// Hae useita indikaattoreita kerralla
router.get('/multiple', async (req, res) => {
  try {
    const { indicators, region = PSHVA_REGION_ID, year = 2023, gender = 'total' } = req.query;
    
    if (!indicators) {
      return res.status(400).json({ error: 'indicators parameter is required' });
    }
    
    console.log(`Fetching multiple indicators ${indicators} for region ${region}, year ${year}`);
    
    // Korjattu 'years' parametri (monikko)
    const url = `${SOTKANET_BASE_URL}/json?indicator=${indicators}&years=${year}&regions=${region}&genders=${gender}`;
    console.log(`Sotkanet URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sotkanet multiple data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching multiple indicators:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch multiple indicators from Sotkanet',
      details: error.message 
    });
  }
});

// Hae osa-alueen kaikki indikaattorit
router.get('/area/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const { region = PSHVA_REGION_ID, year = 2023 } = req.query;
    
    // Määritä indikaattorit osa-alueen mukaan
    const areaIndicators = {
      avoterveydenhuolto: [2230, 1820, 4420],
      leikkaustoiminta: [2150, 1840, 2160],
      paivystys: [2170, 1782, 2180],
      tutkimus: [3200, 3210, 3220]
    };
    
    const indicators = areaIndicators[area];
    if (!indicators) {
      return res.status(400).json({ error: `Unknown area: ${area}` });
    }
    
    console.log(`Fetching area ${area} indicators ${indicators.join(',')} for region ${region}, year ${year}`);
    
    const indicatorsParam = indicators.join(',');
    const url = `${SOTKANET_BASE_URL}/json?indicator=${indicatorsParam}&years=${year}&regions=${region}&genders=total`;
    console.log(`Sotkanet URL: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Sotkanet area data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points for area ${area}`);
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching area data:', error.message);
    res.status(500).json({ 
      error: `Failed to fetch area data from Sotkanet`,
      details: error.message 
    });
  }
});

module.exports = router;
