const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/insurance.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db = null;

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS customer (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name  VARCHAR(100) NOT NULL,
    phone      VARCHAR(30),
    email      VARCHAR(150),
    created_at DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS policy (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id       INTEGER NOT NULL REFERENCES customer(id) ON DELETE CASCADE,
    policy_number     VARCHAR(50) NOT NULL UNIQUE,
    policy_type       VARCHAR(50) NOT NULL,
    expiration_date   DATE NOT NULL,
    follow_up_status  TEXT NOT NULL DEFAULT 'PENDING',
    renewed_at        DATETIME,
    created_at        DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at        DATETIME NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS policy_activity (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_id     INTEGER NOT NULL REFERENCES policy(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    notes         TEXT,
    created_at    DATETIME NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_policy_customer   ON policy(customer_id);
  CREATE INDEX IF NOT EXISTS idx_policy_expiration ON policy(expiration_date);
  CREATE INDEX IF NOT EXISTS idx_activity_policy   ON policy_activity(policy_id);
`;

async function init() {
  if (db) return db;
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
    db.run(SCHEMA);
    persist();
  }
  return db;
}

function persist() {
  if (!db) return;
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

// Helper: run a SELECT query, return array of plain objects
function query(sql, params = []) {
  const result = db.exec(sql, params);
  if (!result.length) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Track last insert rowid manually (export() resets last_insert_rowid to 0)
let _lastId = null;

// Helper: run INSERT/UPDATE/DELETE
function run(sql, params = []) {
  db.run(sql, params);
  // Capture lastId BEFORE export() resets it
  const r = db.exec('SELECT last_insert_rowid() as id');
  _lastId = r.length ? r[0].values[0][0] : null;
  persist();
  return db;
}

// Helper: get last inserted row id
function lastId() {
  return _lastId;
}

module.exports = { init, query, run, lastId, persist };
