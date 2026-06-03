const { Router } = require('express');
const db = require('../db/database');
const {
  calculatePolicyStatus, daysUntilExpiration,
  FOLLOW_UP_STATUSES, POLICY_TYPES, POLICY_STATUS_PRIORITY,
} = require('../models/policyStatus');

const router = Router();

function enrich(p) {
  return {
    ...p,
    policy_status: calculatePolicyStatus(p.expiration_date),
    days_until_expiration: daysUntilExpiration(p.expiration_date),
  };
}

function getFullPolicy(id) {
  return db.query(`
    SELECT p.*, c.first_name, c.last_name, c.phone, c.email
    FROM policy p JOIN customer c ON c.id = p.customer_id
    WHERE p.id = ?
  `, [id])[0];
}

// GET /api/policies
router.get('/', (req, res) => {
  const { status, follow_up_status, customer_id, search } = req.query;

  let sql = `
    SELECT p.*, c.first_name, c.last_name, c.phone, c.email
    FROM policy p JOIN customer c ON c.id = p.customer_id
    WHERE 1=1
  `;
  const params = [];

  if (customer_id)      { sql += ' AND p.customer_id = ?';         params.push(customer_id); }
  if (follow_up_status) { sql += ' AND p.follow_up_status = ?';    params.push(follow_up_status); }
  if (search) {
    sql += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR p.policy_number LIKE ?)';
    const s = `%${search}%`;
    params.push(s, s, s);
  }
  sql += ' ORDER BY p.expiration_date ASC';

  let policies = db.query(sql, params).map(enrich);

  if (status) policies = policies.filter(p => p.policy_status === status);

  // Attach last activity
  policies = policies.map(p => {
    const la = db.query(
      'SELECT * FROM policy_activity WHERE policy_id = ? ORDER BY created_at DESC LIMIT 1',
      [p.id]
    )[0] || null;
    return { ...p, last_activity: la };
  });

  policies.sort((a, b) => {
    const pa = POLICY_STATUS_PRIORITY[a.policy_status] ?? 99;
    const pb = POLICY_STATUS_PRIORITY[b.policy_status] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.days_until_expiration - b.days_until_expiration;
  });

  res.json(policies);
});

// GET /api/policies/:id
router.get('/:id', (req, res) => {
  const policy = getFullPolicy(req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  const activities = db.query(
    'SELECT * FROM policy_activity WHERE policy_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json({ ...enrich(policy), activities });
});

// POST /api/policies
router.post('/', (req, res) => {
  const { customer_id, policy_number, policy_type, expiration_date } = req.body;
  if (!customer_id || !policy_number || !policy_type || !expiration_date)
    return res.status(400).json({ error: 'customer_id, policy_number, policy_type and expiration_date are required' });
  if (!POLICY_TYPES.includes(policy_type))
    return res.status(400).json({ error: `policy_type must be one of: ${POLICY_TYPES.join(', ')}` });

  const customer = db.query('SELECT id FROM customer WHERE id = ?', [customer_id])[0];
  if (!customer) return res.status(404).json({ error: 'Customer not found' });

  try {
    db.run(
      'INSERT INTO policy (customer_id, policy_number, policy_type, expiration_date) VALUES (?, ?, ?, ?)',
      [customer_id, policy_number.trim(), policy_type, expiration_date]
    );
    const id = db.lastId();
    res.status(201).json(enrich(getFullPolicy(id)));
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Policy number already exists' });
    throw e;
  }
});

// PATCH /api/policies/:id/follow-up
router.patch('/:id/follow-up', (req, res) => {
  const { follow_up_status } = req.body;
  if (!FOLLOW_UP_STATUSES.includes(follow_up_status))
    return res.status(400).json({ error: `Invalid follow_up_status` });

  const policy = db.query('SELECT id FROM policy WHERE id = ?', [req.params.id])[0];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  db.run(`UPDATE policy SET follow_up_status=?, updated_at=datetime('now') WHERE id=?`,
    [follow_up_status, req.params.id]);
  res.json(enrich(getFullPolicy(req.params.id)));
});

// PATCH /api/policies/:id/renew
router.patch('/:id/renew', (req, res) => {
  const { expiration_date } = req.body;
  if (!expiration_date) return res.status(400).json({ error: 'expiration_date is required' });

  const policy = db.query('SELECT id FROM policy WHERE id = ?', [req.params.id])[0];
  if (!policy) return res.status(404).json({ error: 'Policy not found' });

  db.run(
    `UPDATE policy SET expiration_date=?, renewed_at=datetime('now'), follow_up_status='COMPLETED', updated_at=datetime('now') WHERE id=?`,
    [expiration_date, req.params.id]
  );
  res.json(enrich(getFullPolicy(req.params.id)));
});

module.exports = router;
