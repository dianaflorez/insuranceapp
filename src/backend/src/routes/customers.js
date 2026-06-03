const { Router } = require('express');
const db = require('../db/database');

const router = Router();

router.get('/', (req, res) => {
  const customers = db.query(`
    SELECT c.*, COUNT(p.id) as policy_count
    FROM customer c
    LEFT JOIN policy p ON p.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.last_name, c.first_name
  `);
  res.json(customers);
});

router.get('/:id', (req, res) => {
  const customer = db.query('SELECT * FROM customer WHERE id = ?', [req.params.id])[0];
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

router.post('/', (req, res) => {
  const { first_name, last_name, phone, email } = req.body;
  if (!first_name || !last_name)
    return res.status(400).json({ error: 'first_name and last_name are required' });

  db.run(
    'INSERT INTO customer (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
    [first_name.trim(), last_name.trim(), phone?.trim() || null, email?.trim() || null]
  );
  const id = db.lastId();
  res.status(201).json(db.query('SELECT * FROM customer WHERE id = ?', [id])[0]);
});

router.put('/:id', (req, res) => {
  const { first_name, last_name, phone, email } = req.body;
  const c = db.query('SELECT * FROM customer WHERE id = ?', [req.params.id])[0];
  if (!c) return res.status(404).json({ error: 'Customer not found' });

  db.run(
    `UPDATE customer SET first_name=?, last_name=?, phone=?, email=?, updated_at=datetime('now') WHERE id=?`,
    [first_name||c.first_name, last_name||c.last_name, phone??c.phone, email??c.email, req.params.id]
  );
  res.json(db.query('SELECT * FROM customer WHERE id = ?', [req.params.id])[0]);
});

module.exports = router;
