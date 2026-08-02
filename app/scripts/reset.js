// ─────────────────────────────────────────────────────────────────────────────
// MechanicPro — Reset Script
// Clears all data from the database so seed.js can start fresh.
// Usage:  npm run seed:reset
// ─────────────────────────────────────────────────────────────────────────────

import path from "path";
import os from "os";
import fs from "fs";
import { createRequire } from "module";

const APP_IDENTIFIER = "com.asus.mechanicpro";
const DB_NAME = "mechanicpro.db";

function getDbPath() {
  const platform = process.platform;
  let base;
  if (platform === "win32") {
    base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
  } else if (platform === "darwin") {
    base = path.join(os.homedir(), "Library", "Application Support");
  } else {
    base = process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share");
  }
  return path.join(base, APP_IDENTIFIER, DB_NAME);
}

const dbPath = getDbPath();

if (!fs.existsSync(dbPath)) {
  console.error(`\n❌  Database not found at:\n   ${dbPath}\n`);
  process.exit(1);
}

const require = createRequire(import.meta.url);
let Database;
try {
  Database = require("better-sqlite3");
} catch {
  console.error("❌  better-sqlite3 not installed. Run npm run seed instead.\n");
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = OFF");

console.log("\n🗑️   Clearing all data...\n");

db.transaction(() => {
  db.prepare("DELETE FROM service_operations").run();
  db.prepare("DELETE FROM service_orders").run();
  db.prepare("DELETE FROM expenses").run();
  db.prepare("DELETE FROM vehicles").run();
  db.prepare("DELETE FROM clients").run();
  // Reset auto-increment counters
  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('clients','vehicles','service_orders','service_operations','expenses')").run();
})();

console.log("✅  All tables cleared.\n");
db.close();
