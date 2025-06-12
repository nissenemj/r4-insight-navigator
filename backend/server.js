
const express = require('express');
const cors = require('cors');
const kpiRoutes = require('./routes/kpi');
const alertRoutes = require('./routes/alerts');
const regionRoutes = require('./routes/regions');
const sotkanetRoutes = require('./routes/sotkanet');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false
}));

app.use(express.json());

// Enhanced logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n📥 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`Origin: ${req.get('Origin') || 'none'}`);
  console.log(`User-Agent: ${req.get('User-Agent') || 'none'}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`📤 Response ${res.statusCode} for ${req.method} ${req.path}`);
    if (res.statusCode >= 400) {
      console.log('Error response:', data);
    }
    originalSend.call(this, data);
  };
  
  next();
});

// Routes
app.use('/api/kpi', kpiRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/regions', regionRoutes);
app.use('/api/sotkanet', sotkanetRoutes);

// Enhanced health check
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'R4 Insight Navigator Backend',
    version: '1.0.0',
    sotkanetConnection: 'Ready to fetch real data from THL Sotkanet API',
    environment: {
      nodeVersion: process.version,
      port: PORT,
      uptime: process.uptime()
    }
  });
});

// Enhanced root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint accessed');
  res.json({
    name: 'R4 Insight Navigator Backend',
    version: '1.0.0',
    description: 'Backend API for R4 healthcare data dashboard',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      sotkanet: {
        health: '/api/sotkanet/health',
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

// Enhanced error handling
app.use((err, req, res, next) => {
  console.error(`❌ Unhandled error on ${req.method} ${req.path}:`, err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❓ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    availableRoutes: [
      '/api/health',
      '/api/sotkanet/*',
      '/api/kpi/*',
      '/api/alerts',
      '/api/regions'
    ]
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 R4 Backend server starting...`);
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Listening on 0.0.0.0:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`\n📋 Available routes:`);
  console.log(`   GET /api/health - Server health check`);
  console.log(`   GET /api/sotkanet/health - Sotkanet connectivity test`);
  console.log(`   GET /api/sotkanet/* - Sotkanet data endpoints`);
  console.log(`   GET /api/kpi/* - KPI data endpoints`);
  console.log(`   GET /api/alerts - Alert endpoints`);
  console.log(`   GET /api/regions - Region endpoints`);
  console.log(`\n🔗 Sotkanet integration ready - fetching real THL data`);
  console.log(`📍 Region ID 974 (Pohjois-Savon hyvinvointialue) configured`);
  console.log(`\n✅ Backend ready for connections!\n`);
});
