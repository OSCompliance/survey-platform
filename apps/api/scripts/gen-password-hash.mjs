// Dev utility: generates a (salt, hash) pair using the same PBKDF2-SHA256
// parameters as src/lib/crypto.ts, so seed.sql can ship working local
// credentials without hardcoding a hash whose derivation isn't reproducible.
// Usage: node scripts/gen-password-hash.mjs <password>
import { randomBytes, pbkdf2Sync } from 'node:crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/gen-password-hash.mjs <password>');
  process.exit(1);
}

const ITERATIONS = 210_000;
const salt = randomBytes(16).toString('hex');
const hash = pbkdf2Sync(password, Buffer.from(salt, 'hex'), ITERATIONS, 32, 'sha256').toString('hex');

console.log(JSON.stringify({ salt, hash }, null, 2));
