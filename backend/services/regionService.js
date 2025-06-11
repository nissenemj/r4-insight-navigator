
const regions = [
  {
    id: 'kuopio',
    name: 'Kuopio',
    code: 'KUO',
    type: 'hospital',
    coordinates: { lat: 62.8924, lng: 27.6780 },
    services: ['avoterveydenhuolto', 'leikkaustoiminta', 'paivystys', 'tutkimus'],
    capacity: {
      beds: 450,
      operatingRooms: 12,
      staff: 850
    }
  },
  {
    id: 'iisalmi',
    name: 'Iisalmi',
    code: 'IIS',
    type: 'hospital',
    coordinates: { lat: 63.5587, lng: 27.1907 },
    services: ['avoterveydenhuolto', 'paivystys'],
    capacity: {
      beds: 120,
      operatingRooms: 3,
      staff: 280
    }
  },
  {
    id: 'varkaus',
    name: 'Varkaus',
    code: 'VAR',
    type: 'hospital',
    coordinates: { lat: 62.3147, lng: 27.8706 },
    services: ['avoterveydenhuolto', 'paivystys', 'leikkaustoiminta'],
    capacity: {
      beds: 85,
      operatingRooms: 2,
      staff: 180
    }
  },
  {
    id: 'all',
    name: 'Kaikki toimipisteet',
    code: 'ALL',
    type: 'aggregate',
    services: ['avoterveydenhuolto', 'leikkaustoiminta', 'paivystys', 'tutkimus'],
    capacity: {
      beds: 655,
      operatingRooms: 17,
      staff: 1310
    }
  }
];

async function getRegions() {
  return regions.map(region => ({
    ...region,
    status: 'active',
    lastUpdated: new Date().toISOString(),
    performance: calculateRegionPerformance(region.id)
  }));
}

function calculateRegionPerformance(regionId) {
  // Simuloidaan toimipisteen yleinen suorituskyky
  const performances = {
    kuopio: { overall: 85, trend: 'up' },
    iisalmi: { overall: 78, trend: 'down' },
    varkaus: { overall: 82, trend: 'up' },
    all: { overall: 82, trend: 'stable' }
  };
  
  return performances[regionId] || { overall: 80, trend: 'stable' };
}

module.exports = {
  getRegions
};
