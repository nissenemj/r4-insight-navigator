
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
    service: 'R4 Insight Navigator Backend'
  });
});

app.listen(PORT, () => {
  console.log(`R4 Backend server running on port ${PORT}`);
  console.log(`Available routes:`);
  console.log(`- GET /api/health`);
  console.log(`- GET /api/kpi/*`);
  console.log(`- GET /api/alerts`);
  console.log(`- GET /api/regions`);
  console.log(`- GET /api/sotkanet/*`);
});
