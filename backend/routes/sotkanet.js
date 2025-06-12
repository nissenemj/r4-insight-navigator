
const express = require('express');
const axios = require('axios');
const router = express.Router();

const SOTKANET_BASE_URL = 'https://sotkanet.fi/rest/1.1';
const PSHVA_REGION_ID = 974; // Pohjois-Savon hyvinvointialueen ID

// Helper function to log API calls
function logApiCall(url, params) {
  console.log(`[${new Date().toISOString()}] Sotkanet API call: ${url}`);
  console.log('Parameters:', params);
}

// Hae kaikki alueet
router.get('/regions', async (req, res) => {
  try {
    console.log('Fetching regions from Sotkanet API...');
    const url = `${SOTKANET_BASE_URL}/regions`;
    logApiCall(url, {});
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet regions response status: ${response.status}`);
    console.log(`Received ${response.data.length} regions`);
    
    // Filter to show relevant regions
    const relevantRegions = response.data.filter(region => 
      region.category === 'HYVINVOINTIALUE' || region.code == PSHVA_REGION_ID
    );
    
    res.json(relevantRegions);
  } catch (error) {
    console.error('Error fetching regions:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
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
    logApiCall(url, {});
    
    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet indicators response status: ${response.status}`);
    console.log(`Received ${response.data.length} indicators`);
    
    // Filter to healthcare-related indicators only
    const healthcareIndicators = response.data.filter(indicator => 
      indicator.organization && 
      (indicator.organization.includes('THL') || 
       indicator.organization.includes('Terveyden ja hyvinvoinnin laitos'))
    );
    
    res.json(healthcareIndicators);
  } catch (error) {
    console.error('Error fetching indicators:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
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
    
    // Use the correct Sotkanet API endpoint format
    const url = `${SOTKANET_BASE_URL}/json`;
    const params = {
      indicator: indicator,
      years: year, // Note: 'years' not 'year'
      regions: region,
      genders: gender
    };
    
    logApiCall(url, params);
    
    const response = await axios.get(url, {
      params: params,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    if (response.data.length === 0) {
      console.log(`No data found for indicator ${indicator}, region ${region}, year ${year}`);
    } else {
      console.log('Sample data point:', response.data[0]);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching indicator data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch indicator data from Sotkanet',
      details: error.message,
      requestedIndicator: req.params.indicator
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
    
    const url = `${SOTKANET_BASE_URL}/json`;
    const params = {
      indicator: indicators, // Can be comma-separated list
      years: year,
      regions: region,
      genders: gender
    };
    
    logApiCall(url, params);
    
    const response = await axios.get(url, {
      params: params,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet multiple data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    if (response.data.length === 0) {
      console.log(`No data found for indicators ${indicators}, region ${region}, year ${year}`);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching multiple indicators:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
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
      return res.status(400).json({ error: `Unknown area: ${area}. Available areas: ${Object.keys(areaIndicators).join(', ')}` });
    }
    
    console.log(`Fetching area ${area} indicators ${indicators.join(',')} for region ${region}, year ${year}`);
    
    const indicatorsParam = indicators.join(',');
    const url = `${SOTKANET_BASE_URL}/json`;
    const params = {
      indicator: indicatorsParam,
      years: year,
      regions: region,
      genders: 'total'
    };
    
    logApiCall(url, params);
    
    const response = await axios.get(url, {
      params: params,
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet area data response status: ${response.status}`);
    console.log(`Received ${response.data.length} data points for area ${area}`);
    
    if (response.data.length === 0) {
      console.log(`No data found for area ${area}, region ${region}, year ${year}`);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching area data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: `Failed to fetch area data from Sotkanet`,
      details: error.message,
      area: req.params.area
    });
  }
});

// Test endpoint to verify specific indicators work
router.get('/test/:indicator', async (req, res) => {
  try {
    const { indicator } = req.params;
    
    console.log(`Testing indicator ${indicator} with multiple year and region combinations`);
    
    const testYears = [2021, 2022, 2023];
    const testRegions = [PSHVA_REGION_ID, 'total']; // Try both specific region and total
    
    const results = [];
    
    for (const year of testYears) {
      for (const region of testRegions) {
        try {
          const url = `${SOTKANET_BASE_URL}/json`;
          const params = {
            indicator: indicator,
            years: year,
            regions: region,
            genders: 'total'
          };
          
          console.log(`Testing: indicator=${indicator}, year=${year}, region=${region}`);
          
          const response = await axios.get(url, {
            params: params,
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'R4-Insight-Navigator/1.0'
            }
          });
          
          if (response.data.length > 0) {
            results.push({
              year,
              region,
              dataPoints: response.data.length,
              sample: response.data[0]
            });
          }
        } catch (testError) {
          console.log(`Test failed for year=${year}, region=${region}: ${testError.message}`);
        }
      }
    }
    
    res.json({
      indicator: indicator,
      testsRun: testYears.length * testRegions.length,
      successfulResults: results.length,
      results: results
    });
    
  } catch (error) {
    console.error('Error in test endpoint:', error.message);
    res.status(500).json({ 
      error: 'Test failed',
      details: error.message 
    });
  }
});

module.exports = router;
