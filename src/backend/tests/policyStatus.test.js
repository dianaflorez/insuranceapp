/**
 * Tests for calculatePolicyStatus — the most critical business logic.
 * The 30-day boundary is where the business either retains or loses a client.
 */
const { calculatePolicyStatus, daysUntilExpiration } = require('../src/models/policyStatus');

let passed = 0, failed = 0;

function test(name, fn) {
  try { fn(); console.log(`  ✅ ${name}`); passed++; }
  catch(e) { console.error(`  ❌ ${name}\n     ${e.message}`); failed++; }
}

function assertEqual(actual, expected) {
  if (actual !== expected) throw new Error(`Expected "${expected}", got "${actual}"`);
}

const TODAY = new Date('2026-06-01');

console.log('\n📋 Policy Status Calculation\n');

test('expires in 31 days → ACTIVE',               () => assertEqual(calculatePolicyStatus('2026-07-02', TODAY), 'ACTIVE'));
test('expires in 30 days → EXPIRING_SOON',         () => assertEqual(calculatePolicyStatus('2026-07-01', TODAY), 'EXPIRING_SOON'));
test('expires today → EXPIRING_SOON',              () => assertEqual(calculatePolicyStatus('2026-06-01', TODAY), 'EXPIRING_SOON'));
test('expires in 4 days → EXPIRING_SOON',          () => assertEqual(calculatePolicyStatus('2026-06-05', TODAY), 'EXPIRING_SOON'));
test('expired yesterday → EXPIRED_RENEWABLE',      () => assertEqual(calculatePolicyStatus('2026-05-31', TODAY), 'EXPIRED_RENEWABLE'));
test('expired 12 days ago → EXPIRED_RENEWABLE',    () => assertEqual(calculatePolicyStatus('2026-05-20', TODAY), 'EXPIRED_RENEWABLE'));
test('expired exactly 30 days ago → EXPIRED_RENEWABLE', () => assertEqual(calculatePolicyStatus('2026-05-02', TODAY), 'EXPIRED_RENEWABLE'));
test('expired 31 days ago → LOST',                 () => assertEqual(calculatePolicyStatus('2026-05-01', TODAY), 'LOST'));
test('expired 50 days ago → LOST',                 () => assertEqual(calculatePolicyStatus('2026-04-12', TODAY), 'LOST'));

console.log('\n📋 Critical boundary: day 30 vs 31\n');
test('Day 30: still EXPIRED_RENEWABLE (recoverable)', () => assertEqual(calculatePolicyStatus('2026-05-02', TODAY), 'EXPIRED_RENEWABLE'));
test('Day 31: LOST (opportunity gone)',               () => assertEqual(calculatePolicyStatus('2026-05-01', TODAY), 'LOST'));

console.log('\n📋 Days Until Expiration\n');
test('+4 days from now',      () => assertEqual(daysUntilExpiration('2026-06-05', TODAY),  4));
test('expired 12 days ago',   () => assertEqual(daysUntilExpiration('2026-05-20', TODAY), -12));
test('expires today = 0',     () => assertEqual(daysUntilExpiration('2026-06-01', TODAY),  0));

console.log(`\n${'─'.repeat(40)}`);
console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
