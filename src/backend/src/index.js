const express = require('express');
const cors    = require('cors');
const db      = require('./db/database');
const customersRouter  = require('./routes/customers');
const policiesRouter   = require('./routes/policies');
const activitiesRouter = require('./routes/activities');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/customers', customersRouter);
app.use('/api/policies',  policiesRouter);
app.use('/api/policies',  activitiesRouter);
app.get('/api/health', (_, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize DB then start server
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Insurance API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});

module.exports = app;
