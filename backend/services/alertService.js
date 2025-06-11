
const alerts = [
  {
    id: 1,
    type: 'warning',
    title: 'Hoitotakuu vaarassa',
    description: 'Leikkaustoiminnan jonotusajat ylittävät tavoitteen Kuopiossa',
    location: 'kuopio',
    severity: 'high',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    area: 'leikkaustoiminta',
    metric: 'jonotusaika',
    currentValue: 42,
    targetValue: 30,
    rootCause: 'Henkilöstövaje ortopediassa',
    recommendations: [
      'Lisäresurssi viikonloppuihin',
      'Ulkoisten palvelujen hyödyntäminen',
      'Kiireettömien leikkausten uudelleenjärjestely'
    ]
  },
  {
    id: 2,
    type: 'success',
    title: 'Digipalvelut tavoitteessa',
    description: 'Digitaalisten palvelujen käyttöaste saavutti 80% tavoitteen Iisalmessa',
    location: 'iisalmi',
    severity: 'low',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    area: 'avoterveydenhuolto',
    metric: 'digipalvelut',
    currentValue: 81,
    targetValue: 80
  },
  {
    id: 3,
    type: 'info',
    title: 'Päivystyksen ruuhka',
    description: 'Odotusajat hieman koholla iltapäivän aikana Varkauden päivystyksessä',
    location: 'varkaus',
    severity: 'medium',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    area: 'paivystys',
    metric: 'odotusaika',
    currentValue: 28,
    targetValue: 20,
    rootCause: 'Iltapäivän potilasmäärän kasvu',
    recommendations: [
      'Lisähenkilöstöä klo 14-18 välille',
      'Triagen tehostaminen',
      'Ei-kiireellisten ohjaus terveyskeskukseen'
    ]
  }
];

async function getActiveAlerts(region, severity) {
  let filteredAlerts = [...alerts];
  
  if (region && region !== 'all') {
    filteredAlerts = filteredAlerts.filter(alert => alert.location === region);
  }
  
  if (severity) {
    filteredAlerts = filteredAlerts.filter(alert => alert.severity === severity);
  }
  
  // Simuloi älykkäitä hälytyksiä järjestelmän analyysien perusteella
  return filteredAlerts.map(alert => ({
    ...alert,
    aiGenerated: true,
    confidence: 0.85,
    estimatedImpact: calculateImpact(alert),
    actionPlan: generateActionPlan(alert)
  }));
}

async function createAlert(alertData) {
  const newAlert = {
    id: alerts.length + 1,
    ...alertData,
    timestamp: new Date(),
    aiGenerated: false
  };
  
  alerts.push(newAlert);
  return newAlert;
}

function calculateImpact(alert) {
  const impacts = {
    high: 'Merkittävä vaikutus potilasturvallisuuteen ja kustannuksiin',
    medium: 'Kohtalainen vaikutus palvelun laatuun',
    low: 'Vähäinen vaikutus, seurantaa suositellaan'
  };
  
  return impacts[alert.severity] || impacts.medium;
}

function generateActionPlan(alert) {
  return {
    immediate: alert.recommendations?.slice(0, 1) || ['Tilanneen seuranta'],
    shortTerm: alert.recommendations?.slice(1, 2) || ['Prosessien tarkistus'],
    longTerm: alert.recommendations?.slice(2) || ['Pitkän aikavälin optimointi'],
    owner: 'Määritettävä vastuuhenkilö',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 päivää
  };
}

module.exports = {
  getActiveAlerts,
  createAlert
};
