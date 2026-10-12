const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const streakRoutes = require('./routes/streakRoutes');

function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  app.use('/api/auth', authRoutes);
  app.use('/api/daily-streak', streakRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Not found.' });
  });

  // Final safety-net error handler — never leak internals to the client.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[unhandled]', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  });

  return app;
}

module.exports = createApp;
