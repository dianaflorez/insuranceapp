const { Router } = require('express');
const db = require('../db/database');
const { ACTIVITY_TYPES } = require('../models/policyStatus');

const router = Router();

router.get('/:id/activities', (req, res) => {
  const policy = db.query('SELECT id FROM policy WHERE id = ?', [req.params.id])[0];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  res.json(db.query(
    'SELECT * FROM policy_activity WHERE policy_id = ? ORDER BY created_at DESC',
    [req.params.id]
  ));
});

router.post('/:id/activities', (req, res) => {
  const { activity_type, notes } = req.body;
  if (!activity_type) return res.status(400).json({ error: 'activity_type is required' });
  if (!ACTIVITY_TYPES.includes(activity_type))
    return res.status(400).json({ error: `activity_type must be one of: ${ACTIVITY_TYPES.join(', ')}` });

  const policy = db.query('SELECT id FROM policy WHERE id = ?', [req.params.id])[0];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  db.run(
    'INSERT INTO policy_activity (policy_id, activity_type, notes) VALUES (?, ?, ?)',
    [req.params.id, activity_type, notes?.trim() || null]
  );
  const id = db.lastId();
  db.run(`UPDATE policy SET updated_at=datetime('now') WHERE id=?`, [req.params.id]);

  res.status(201).json(db.query('SELECT * FROM policy_activity WHERE id = ?', [id])[0]);
});

module.exports = router;
