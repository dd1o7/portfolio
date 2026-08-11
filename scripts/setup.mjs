#!/usr/bin/env node
/**
 * Generates the secrets the admin dashboard needs.
 *
 *   pnpm setup                 → generates a strong password for you
 *   pnpm setup "my password"   → uses the password you give it
 *
 * Prints everything you need to paste into Vercel. Nothing is stored anywhere
 * by this script, so if you lose the password you just run it again.
 */

import { randomBytes, scryptSync } from "node:crypto";
import { writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const SCRYPT_KEYLEN = 64;

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/** Readable but still strong — avoids characters that are easy to misread. */
function generatePassword() {
  const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(20);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

const given = process.argv[2];
const password = given || generatePassword();
const passwordHash = hashPassword(password);
const authSecret = randomBytes(32).toString("hex");

const bar = "─".repeat(72);

console.log(`\n${bar}`);
console.log("  YOUR ADMIN PASSWORD");
console.log(bar);
console.log(`\n    ${password}\n`);
console.log("  Save this in your password manager now. It is not stored anywhere");
console.log("  and cannot be recovered — but you can always re-run this script");
console.log("  to set a new one.");

console.log(`\n${bar}`);
console.log("  ENVIRONMENT VARIABLES");
console.log(bar);
console.log("\n  Add these in Vercel:  Project → Settings → Environment Variables");
console.log("  (Add each one to all three environments.)\n");
console.log(`  ADMIN_PASSWORD_HASH   ${passwordHash}`);
console.log(`  AUTH_SECRET           ${authSecret}`);
console.log(`  GITHUB_TOKEN          <your fine-grained token — see below>`);
console.log(`  GITHUB_REPO           <your-username>/<your-repo>`);

console.log(`\n${bar}`);
console.log("  CREATING THE GITHUB TOKEN");
console.log(bar);
console.log(`
  1. Go to  https://github.com/settings/personal-access-tokens/new
  2. Token name:        portfolio-admin
  3. Expiration:        No expiration
  4. Repository access: "Only select repositories" → pick your portfolio repo
  5. Permissions → Repository permissions → Contents → Read and write
  6. Generate, then copy the token (shown once) into GITHUB_TOKEN above

  Give it nothing else. Scoped this way, the token can only change files in
  that one repository — and every change is a git commit you can revert.
`);

// A local .env.local so the admin works on your machine too.
const envPath = path.join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  console.log(`${bar}`);
  console.log("  .env.local already exists — not overwriting it.");
  console.log("  Copy the values above into it by hand if you want to update them.");
  console.log(`${bar}\n`);
} else {
  writeFileSync(
    envPath,
    [
      "# Local admin settings. Never commit this file — .gitignore already excludes it.",
      `ADMIN_PASSWORD_HASH=${passwordHash}`,
      `AUTH_SECRET=${authSecret}`,
      "GITHUB_TOKEN=",
      "GITHUB_REPO=",
      "",
    ].join("\n"),
  );
  console.log(`${bar}`);
  console.log("  Wrote .env.local for local development.");
  console.log("  Fill in GITHUB_TOKEN and GITHUB_REPO there to use /admin locally.");
  console.log(`${bar}\n`);
}
