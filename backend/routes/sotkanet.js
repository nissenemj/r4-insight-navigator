const express = require('express');
const axios = require('axios');
const router = express.Router();

const SOTKANET_BASE_URL = 'https://sotkanet.fi/rest/1.1';
const PSHVA_REGION_ID = 974; // Pohjois-Savon hyvinvointialueen ID

// Helper function to log API calls with more detail
function logApiCall(url, params, method = 'GET') {
  console.log(`\n========== SOTKANET API CALL ==========`);
  console.log(`[${new Date().toISOString()}] ${method} ${url}`);
  console.log('Parameters:', JSON.stringify(params, null, 2));
  console.log('Full URL with params:', url + '?' + new URLSearchParams(params).toString());
  console.log('=========================================\n');
}

// Enhanced error logging
function logError(error, context) {
  console.log(`\n========== ERROR in ${context} ==========`);
  console.log('Error message:', error.message);
  console.log('Error code:', error.code);
  if (error.response) {
    console.log('Response status:', error.response.status);
    console.log('Response headers:', error.response.headers);
    console.log('Response data:', error.response.data);
  }
  if (error.request) {
    console.log('Request details:', {
      method: error.request.method,
      url: error.request.url,
      headers: error.request.headers
    });
  }
  console.log('Stack trace:', error.stack);
  console.log('==========================================\n');
}

// Test endpoint to verify Sotkanet connectivity
router.get('/health', async (req, res) => {
  try {
    console.log('Testing Sotkanet API connectivity...');
    const testUrl = `${SOTKANET_BASE_URL}/regions`;
    
    console.log(`Testing connection to: ${testUrl}`);
    
    const response = await axios.get(testUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'R4-Insight-Navigator/1.0'
      }
    });
    
    console.log(`Sotkanet health check successful: ${response.status}`);
    
    res.json({
      status: 'OK',
      sotkanetConnection: 'Connected',
      responseStatus: response.status,
      dataReceived: response.data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logError(error, 'Sotkanet health check');
    res.status(500).json({
      status: 'ERROR',
      sotkanetConnection: 'Failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

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
    
    console.log(`✅ Sotkanet regions response successful`);
    console.log(`Status: ${response.status}`);
    console.log(`Received ${response.data.length} regions`);
    
    // Filter to show relevant regions
    const relevantRegions = response.data.filter(region => 
      region.category === 'HYVINVOINTIALUE' || region.code == PSHVA_REGION_ID
    );
    
    console.log(`Filtered to ${relevantRegions.length} relevant regions`);
    
    res.json(relevantRegions);
  } catch (error) {
    logError(error, 'fetching regions');
    res.status(500).json({ 
      error: 'Failed to fetch regions from Sotkanet',
      details: error.message,
      url: `${SOTKANET_BASE_URL}/regions`
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
    
    console.log(`✅ Sotkanet indicators response successful`);
    console.log(`Status: ${response.status}`);
    console.log(`Received ${response.data.length} indicators`);
    
    // Filter to healthcare-related indicators only
    const healthcareIndicators = response.data.filter(indicator => 
      indicator.organization && 
      (indicator.organization.includes('THL') || 
       indicator.organization.includes('Terveyden ja hyvinvoinnin laitos'))
    );
    
    console.log(`Filtered to ${healthcareIndicators.length} healthcare indicators`);
    
    res.json(healthcareIndicators);
  } catch (error) {
    logError(error, 'fetching indicators');
    res.status(500).json({ 
      error: 'Failed to fetch indicators from Sotkanet',
      details: error.message,
      url: `${SOTKANET_BASE_URL}/indicators`
    });
  }
});

// Hae yksittäinen indikaattori
router.get('/data/:indicator', async (req, res) => {
  try {
    const { indicator } = req.params;
    const { region = PSHVA_REGION_ID, year = 2023, gender = 'total' } = req.query;
    
    console.log(`\n🔍 Fetching indicator ${indicator} for region ${region}, year ${year}`);
    
    // Use the correct Sotkanet API endpoint format
    const url = `${SOTKANET_BASE_URL}/json`;
    const params = {
      indicator: indicator,
      years: year, // Note: 'years' not 'year'
      region: region,
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
    
    console.log(`✅ Sotkanet data response successful`);
    console.log(`Status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    if (response.data.length === 0) {
      console.log(`⚠️  No data found for indicator ${indicator}, region ${region}, year ${year}`);
      console.log('Trying alternative parameters...');
      
      // Try with different year
      const altParams = { ...params, years: 2022 };
      console.log('Trying with year 2022...');
      logApiCall(url, altParams);
      
      const altResponse = await axios.get(url, {
        params: altParams,
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'R4-Insight-Navigator/1.0'
        }
      });
      
      if (altResponse.data.length > 0) {
        console.log(`✅ Found ${altResponse.data.length} data points with year 2022`);
        return res.json(altResponse.data);
      }
    } else {
      console.log('Sample data point:', response.data[0]);
    }
    
    res.json(response.data);
  } catch (error) {
    logError(error, `fetching indicator ${req.params.indicator}`);
    res.status(500).json({ 
      error: 'Failed to fetch indicator data from Sotkanet',
      details: error.message,
      requestedIndicator: req.params.indicator,
      requestedParams: req.query
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
    
    console.log(`\n🔍 Fetching multiple indicators ${indicators} for region ${region}, year ${year}`);
    
    const url = `${SOTKANET_BASE_URL}/json`;
    const params = {
      indicator: indicators, // Can be comma-separated list
      years: year,
      region: region,
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
    
    console.log(`✅ Sotkanet multiple data response successful`);
    console.log(`Status: ${response.status}`);
    console.log(`Received ${response.data.length} data points`);
    
    if (response.data.length === 0) {
      console.log(`⚠️  No data found for indicators ${indicators}, region ${region}, year ${year}`);
      console.log('Trying with different years...');
      
      // Try with previous years
      for (const tryYear of [2022, 2021, 2020]) {
        console.log(`Trying with year ${tryYear}...`);
        const altParams = { ...params, years: tryYear };
        
        try {
          const altResponse = await axios.get(url, {
            params: altParams,
            timeout: 10000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'R4-Insight-Navigator/1.0'
            }
          });
          
          if (altResponse.data.length > 0) {
            console.log(`✅ Found ${altResponse.data.length} data points with year ${tryYear}`);
            return res.json(altResponse.data);
          }
        } catch (yearError) {
          console.log(`❌ Failed with year ${tryYear}:`, yearError.message);
        }
      }
    }
    
    res.json(response.data);
  } catch (error) {
    logError(error, 'fetching multiple indicators');
    res.status(500).json({ 
      error: 'Failed to fetch multiple indicators from Sotkanet',
      details: error.message,
      requestedParams: req.query
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
      region: region,
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
    
    console.log(`✅ Sotkanet area data response successful`);
    console.log(`Status: ${response.status}`);
    console.log(`Received ${response.data.length} data points for area ${area}`);
    
    if (response.data.length === 0) {
      console.log(`⚠️  No data found for area ${area}, region ${region}, year ${year}`);
    }
    
    res.json(response.data);
  } catch (error) {
    logError(error, 'fetching area data');
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
            region: region,
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
