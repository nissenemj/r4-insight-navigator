
const express = require('express');
const cors = require('cors');
const kpiRoutes = require('./routes/kpi');
const alertRoutes = require('./routes/alerts');
const regionRoutes = require('./routes/regions');
const sotkanetRoutes = require('./routes/sotkanet');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  next();
});

// Routes
app.use('/api/kpi', kpiRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/sotkanet', sotkanetRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'R4 Insight Navigator Backend',
    sotkanetConnection: 'Ready to fetch real data from THL Sotkanet API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'R4 Insight Navigator Backend',
    version: '1.0.0',
    description: 'Backend API for R4 healthcare data dashboard',
    endpoints: {
      health: '/api/health',
      sotkanet: {
        regions: '/api/sotkanet/regions',
        indicators: '/api/sotkanet/indicators',
        data: '/api/sotkanet/data/{indicator}?region={region}&year={year}',
        multiple: '/api/sotkanet/multiple?indicators={indicators}&region={region}&year={year}',
        area: '/api/sotkanet/area/{area}?region={region}&year={year}',
        test: '/api/sotkanet/test/{indicator}'
      },
      kpi: '/api/kpi/{area}',
      alerts: '/api/alerts',
      regions: '/api/regions'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`R4 Backend server running on port ${PORT}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log(`Available routes:`);
  console.log(`- GET /api/health`);
  console.log(`- GET /api/sotkanet/*`);
  console.log(`- GET /api/kpi/*`);
  console.log(`- GET /api/alerts`);
  console.log(`- GET /api/regions`);
  console.log(`\nSotkanet integration ready - fetching real THL data`);
  console.log(`Region ID 974 (Pohjois-Savon hyvinvointialue) configured`);
});
