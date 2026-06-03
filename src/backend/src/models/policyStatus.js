/**
 * Policy status is CALCULATED, never persisted.
 *
 * ACTIVE            → expires more than 30 days from now
 * EXPIRING_SOON     → expires within the next 30 days (including today)
 * EXPIRED_RENEWABLE → expired 1–30 days ago (critical 30-day window)
 * LOST              → expired more than 30 days ago
 */
function calculatePolicyStatus(expirationDate, today = new Date()) {
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const expiry  = new Date(expirationDate);
  const expiryMs = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  const diffDays = Math.round((expiryMs - todayMs) / 86_400_000);

  if (diffDays > 30)   return 'ACTIVE';
  if (diffDays >= 0)   return 'EXPIRING_SOON';
  if (diffDays >= -30) return 'EXPIRED_RENEWABLE';
  return 'LOST';
}

function daysUntilExpiration(expirationDate, today = new Date()) {
  const todayMs  = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const expiry   = new Date(expirationDate);
  const expiryMs = Date.UTC(expiry.getFullYear(), expiry.getMonth(), expiry.getDate());
  return Math.round((expiryMs - todayMs) / 86_400_000);
}

const POLICY_STATUS_PRIORITY = {
  EXPIRING_SOON:     1,
  EXPIRED_RENEWABLE: 2,
  ACTIVE:            3,
  LOST:              4,
};

const FOLLOW_UP_STATUSES = ['PENDING','ATTEMPTED','CONTACTED','WAITING_RESPONSE','COMPLETED'];
const POLICY_TYPES       = ['AUTO','HOME','LIFE','HEALTH','OTHER'];
const ACTIVITY_TYPES     = ['CALL','WHATSAPP','EMAIL','NOTE','MEETING'];

module.exports = {
  calculatePolicyStatus, daysUntilExpiration,
  POLICY_STATUS_PRIORITY, FOLLOW_UP_STATUSES, POLICY_TYPES, ACTIVITY_TYPES,
};
