
const axios = require('axios');

// Sotkanet API integraatio - päivitetyt indikaattorit
const SOTKANET_BASE_URL = 'https://sotkanet.fi/api/2';
const PSHVA_CODE = 'HVA16';

// KPI-indikaattorit osa-alueittain - uudet Sotkanet ID:t
const INDICATORS = {
  avoterveydenhuolto: {
    hoitotakuu_3kk: 3176,
    hoitotakuu_7pv: 2676,
    kayntimaara_kaikki: 1552,
    kayntimaara_avosairaanhoito: 4123,
    digipalvelut_asioinut: 5549,
    digipalvelut_korvasi: 5534,
    digipalvelut_esteet: 5543,
  },
  leikkaustoiminta: {
    odotusaika_mediaani: 5083,
    hoitojakso_pituus: 2989,
    odotusaika_yli6kk: 3336,
    hoitopaivat_18_64: 3000,
  },
  paivystys: {
    paivystys_perusterveydenhuolto: 5081,
    paivystys_erikoissairaanhoito: 5077,
    palanneet_48h_aikuiset: 5104,
    palanneet_48h_lapset: 5244,
  },
  tutkimus: {
    hankkeet: 3200,
    palaute: 3210,
    julkaisut: 3220,
  }
};

// Päivitetyt tavoitearvot
const TARGETS = {
  avoterveydenhuolto: {
    hoitotakuu_3kk: 5, hoitotakuu_7pv: 7, kayntimaara_kaikki: 3000, kayntimaara_avosairaanhoito: 2800,
    digipalvelut_asioinut: 80, digipalvelut_korvasi: 75, digipalvelut_esteet: 15
  },
  leikkaustoiminta: {
    odotusaika_mediaani: 60, hoitojakso_pituus: 7, odotusaika_yli6kk: 50, hoitopaivat_18_64: 200
  },
  paivystys: {
    paivystys_perusterveydenhuolto: 400, paivystys_erikoissairaanhoito: 400,
    palanneet_48h_aikuiset: 8, palanneet_48h_lapset: 8
  },
  tutkimus: { hankkeet: 25, palaute: 4.0, julkaisut: 20 }
};

async function getKPIData(area, region = 'all') {
  try {
    if (area === 'overview') {
      return await getOverviewData(region);
    }
    
    if (area === 'costs') {
      return await getCostData(region);
    }

    const indicators = INDICATORS[area];
    if (!indicators) {
      throw new Error(`Unknown area: ${area}`);
    }

    const targets = TARGETS[area];
    const currentYear = new Date().getFullYear() - 1;
    
    // Simuloidaan älykkäät analyysit
    const metrics = {};
    
    for (const [key, indicatorId] of Object.entries(indicators)) {
      const value = await fetchSotkanetData(indicatorId, currentYear) || getSimulatedValue(area, key);
      const target = targets[key];
      const trend = value >= target ? 'up' : 'down';
      
      metrics[key] = {
        value,
        target,
        trend,
        analysis: generateAnalysis(key, value, target),
        recommendations: generateRecommendations(key, value, target)
      };
    }

    return {
      area,
      region,
      metrics,
      timestamp: new Date().toISOString(),
      dataSource: 'sotkanet'
    };
  } catch (error) {
    console.error('Error in getKPIData:', error);
    return getSimulatedKPIData(area, region);
  }
}

async function fetchSotkanetData(indicatorId, year) {
  try {
    const response = await axios.get(`${SOTKANET_BASE_URL}/data`, {
      params: {
        indicator: indicatorId,
        year: year,
        regions: PSHVA_CODE, // KORJAUS: String eikä array
        genders: 'total'
      },
      timeout: 5000
    });
    
    return response.data[0]?.absolute_value || null;
  } catch (error) {
    console.log(`Sotkanet fetch failed for indicator ${indicatorId}, using simulated data`);
    return null;
  }
}

function generateAnalysis(metric, value, target) {
  const performance = (value / target) * 100;
  
  if (performance >= 100) {
    return `${metric} on tavoitteessa. Suorituskyky: ${performance.toFixed(1)}%`;
  } else if (performance >= 90) {
    return `${metric} lähellä tavoitetta. Pieni panostus riittää tavoitteen saavuttamiseen.`;
  } else if (performance >= 75) {
    return `${metric} alle tavoitteen. Keskitason toimenpiteitä tarvitaan.`;
  } else {
    return `${metric} merkittävästi alle tavoitteen. Kiireellisiä toimenpiteitä tarvitaan.`;
  }
}

function generateRecommendations(metric, value, target) {
  const gap = target - value;
  const recommendations = [];
  
  if (gap > 0) {
    switch (metric) {
      case 'hoitotakuu':
        recommendations.push('Lisää resursseja kiireellisimpiin hoitojonoihin');
        recommendations.push('Optimoi ajanvarausjärjestelmää');
        break;
      case 'kayntimaara':
        recommendations.push('Tehosta digitaalisia palveluja');
        recommendations.push('Lisää etävastaanottoja');
        break;
      case 'odotusaika':
        recommendations.push('Lisähenkilöstöä ruuhka-aikoihin');
        recommendations.push('Paranna triagejärjestelmää');
        break;
      default:
        recommendations.push('Analysoi toimintaprosesseja');
        recommendations.push('Benchmarkaa parhaita käytäntöjä');
    }
  } else {
    recommendations.push('Ylläpidä hyvä suoritustaso');
    recommendations.push('Jaa parhaat käytännöt muille yksiköille');
  }
  
  return recommendations;
}

async function getTrendData(area, region, period) {
  const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
  const baseValue = getSimulatedValue(area, Object.keys(INDICATORS[area] || {})[0]);
  
  return months.map((month, index) => {
    const seasonalVariation = Math.sin((index / 12) * 2 * Math.PI) * (baseValue * 0.1);
    const noise = (Math.random() - 0.5) * (baseValue * 0.05);
    const current = Math.round(baseValue + seasonalVariation + noise);
    
    return {
      month,
      current,
      target: baseValue,
      costs: Math.round(current * 150),
      predictions: {
        nextMonth: Math.round(current * 1.02),
        confidence: 0.85
      }
    };
  });
}

async function getComparisonData(areas, period) {
  const locations = ['kuopio', 'iisalmi', 'varkaus'];
  const comparison = {};
  
  for (const location of locations) {
    comparison[location] = {};
    
    if (areas && areas.includes('emergency')) {
      comparison[location].emergency = {
        odotusaika: getSimulatedValue('paivystys', 'odotusaika') + (Math.random() * 10),
        kayntimaara: getSimulatedValue('paivystys', 'kayntimaara') + (Math.random() * 100),
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    }
  }
  
  return comparison;
}

async function getOverviewData(region) {
  const overview = {};
  
  for (const [area, indicators] of Object.entries(INDICATORS)) {
    overview[area] = {};
    
    for (const [key, indicatorId] of Object.entries(indicators)) {
      const value = getSimulatedValue(area, key);
      const target = TARGETS[area][key];
      
      overview[area][key] = {
        value,
        target,
        status: value >= target ? 'good' : 'warning',
        trend: Math.random() > 0.5 ? 'up' : 'down'
      };
    }
  }
  
  return overview;
}

async function getCostData(region, period) {
  const months = ['Tam', 'Hel', 'Maa', 'Huh', 'Tou', 'Kes', 'Hei', 'Elo', 'Syy', 'Lok', 'Mar', 'Jou'];
  
  return months.map(month => ({
    month,
    total: Math.round(2000000 + (Math.random() * 500000)),
    avoterveydenhuolto: Math.round(800000 + (Math.random() * 200000)),
    leikkaustoiminta: Math.round(600000 + (Math.random() * 150000)),
    paivystys: Math.round(400000 + (Math.random() * 100000)),
    tutkimus: Math.round(200000 + (Math.random() * 50000))
  }));
}

function getSimulatedValue(area, key) {
  const simulatedData = {
    avoterveydenhuolto: {
      hoitotakuu_3kk: 8.5, hoitotakuu_7pv: 12.3, kayntimaara_kaikki: 2947, kayntimaara_avosairaanhoito: 2156,
      digipalvelut_asioinut: 67.3, digipalvelut_korvasi: 68.9, digipalvelut_esteet: 23.7
    },
    leikkaustoiminta: {
      odotusaika_mediaani: 67.2, hoitojakso_pituus: 8.5, odotusaika_yli6kk: 62.1, hoitopaivat_18_64: 187
    },
    paivystys: {
      paivystys_perusterveydenhuolto: 427, paivystys_erikoissairaanhoito: 465,
      palanneet_48h_aikuiset: 6.8, palanneet_48h_lapset: 5.2
    },
    tutkimus: { hankkeet: 23, palaute: 4.2, julkaisut: 18 }
  };
  
  return simulatedData[area]?.[key] || 100;
}

function getSimulatedKPIData(area, region) {
  const metrics = {};
  const indicators = INDICATORS[area] || {};
  const targets = TARGETS[area] || {};
  
  for (const key of Object.keys(indicators)) {
    const value = getSimulatedValue(area, key);
    const target = targets[key] || 100;
    
    metrics[key] = {
      value,
      target,
      trend: value >= target ? 'up' : 'down',
      analysis: generateAnalysis(key, value, target),
      recommendations: generateRecommendations(key, value, target)
    };
  }
  
  return {
    area,
    region,
    metrics,
    timestamp: new Date().toISOString(),
    dataSource: 'simulated'
  };
}

module.exports = {
  getKPIData,
  getTrendData,
  getComparisonData
};
