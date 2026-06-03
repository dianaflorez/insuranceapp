const db = require('./database');

async function seed() {
  await db.init();

  db.run('DELETE FROM policy_activity');
  db.run('DELETE FROM policy');
  db.run('DELETE FROM customer');

  function insertCustomer(first_name, last_name, phone, email) {
    db.run('INSERT INTO customer (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
      [first_name, last_name, phone || null, email || null]);
    return db.lastId();
  }

  const c1 = insertCustomer('Juan',      'Pérez',      '3001234567', 'juan.perez@gmail.com');
  const c2 = insertCustomer('Ana',       'Rodríguez',  '3109876543', 'ana.rodriguez@hotmail.com');
  const c3 = insertCustomer('Carlos',    'López',      '3205551234', null);
  const c4 = insertCustomer('Mariana',   'Torres',     '3154449988', 'mariana.t@gmail.com');
  const c5 = insertCustomer('Felipe',    'Gómez',      '3006667788', null);
  const c6 = insertCustomer('Sofía',     'Hernández',  '3127778899', 'sofia.h@outlook.com');
  const c7 = insertCustomer('Andrés',    'Martínez',   '3001112233', null);
  const c8 = insertCustomer('Valentina', 'Castro',     '3184445566', 'vale.castro@gmail.com');

  const today = new Date();
  function dateOffset(days) {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
  function daysAgo(n) {
    return new Date(today.getTime() - n * 86400000).toISOString().replace('T', ' ').substring(0, 19);
  }

  function insertPolicy(customer_id, policy_number, policy_type, expiration_date, follow_up_status, renewed_at) {
    db.run(
      'INSERT INTO policy (customer_id, policy_number, policy_type, expiration_date, follow_up_status, renewed_at) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, policy_number, policy_type, expiration_date, follow_up_status, renewed_at || null]
    );
    return db.lastId();
  }

  const p1  = insertPolicy(c1, 'POL-AUTO-001',   'AUTO',   dateOffset(4),   'WAITING_RESPONSE', null);
  const p2  = insertPolicy(c1, 'POL-HOME-001',   'HOME',   dateOffset(15),  'PENDING',          null);
  const p3  = insertPolicy(c1, 'POL-LIFE-001',   'LIFE',   dateOffset(90),  'PENDING',          null);
  const p4  = insertPolicy(c2, 'POL-LIFE-002',   'LIFE',   dateOffset(-12), 'CONTACTED',        null);
  const p5  = insertPolicy(c2, 'POL-AUTO-002',   'AUTO',   dateOffset(45),  'PENDING',          null);
  const p6  = insertPolicy(c3, 'POL-AUTO-003',   'AUTO',   dateOffset(-50), 'ATTEMPTED',        null);
  const p7  = insertPolicy(c4, 'POL-HOME-002',   'HOME',   dateOffset(1),   'PENDING',          null);
  const p8  = insertPolicy(c4, 'POL-AUTO-004',   'AUTO',   dateOffset(-5),  'WAITING_RESPONSE', null);
  const p9  = insertPolicy(c5, 'POL-AUTO-005',   'AUTO',   dateOffset(180), 'COMPLETED',        daysAgo(5));
  const p10 = insertPolicy(c6, 'POL-HEALTH-001', 'HEALTH', dateOffset(28),  'ATTEMPTED',        null);
  const p11 = insertPolicy(c7, 'POL-AUTO-006',   'AUTO',   dateOffset(60),  'PENDING',          null);
  const p12 = insertPolicy(c8, 'POL-AUTO-007',   'AUTO',   dateOffset(-25), 'CONTACTED',        null);

  function insertActivity(policy_id, activity_type, notes, created_at) {
    db.run(
      'INSERT INTO policy_activity (policy_id, activity_type, notes, created_at) VALUES (?, ?, ?, ?)',
      [policy_id, activity_type, notes, created_at]
    );
  }

  insertActivity(p1,  'CALL',     'Cliente solicita cotización para renovar',        daysAgo(3));
  insertActivity(p1,  'WHATSAPP', 'Cotización enviada por WhatsApp',                 daysAgo(1));
  insertActivity(p4,  'CALL',     'Cliente revisando opciones con otra empresa',     daysAgo(8));
  insertActivity(p4,  'EMAIL',    'Se envió propuesta comparativa por email',        daysAgo(5));
  insertActivity(p6,  'CALL',     'No respondió la llamada',                         daysAgo(45));
  insertActivity(p6,  'WHATSAPP', 'Mensaje enviado, sin respuesta',                  daysAgo(40));
  insertActivity(p7,  'CALL',     'Se intentó contactar, buzón de voz',             daysAgo(2));
  insertActivity(p8,  'WHATSAPP', 'Cliente dice que está evaluando opciones',        daysAgo(3));
  insertActivity(p8,  'CALL',     'Segunda llamada, cliente comprometido a responder', daysAgo(1));
  insertActivity(p10, 'CALL',     'Primera llamada, cliente interesado',             daysAgo(5));
  insertActivity(p12, 'CALL',     'Contactado, necesita hablar con cónyuge',        daysAgo(20));
  insertActivity(p12, 'WHATSAPP', 'Recordatorio enviado, ventana casi cerrada',     daysAgo(10));
  insertActivity(p12, 'CALL',     'Segunda llamada, sin respuesta',                 daysAgo(3));

  console.log('✅ Seed completed — 8 customers, 12 policies, 13 activities');
}

seed().catch(e => { console.error(e); process.exit(1); });
