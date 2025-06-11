
const express = require('express');
const cors = require('cors');
const kpiRoutes = require('./routes/kpi');
const alertRoutes = require('./routes/alerts');
const regionRoutes = require('./routes/regions');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/kpi', kpiRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/regions', regionRoutes);

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
});
