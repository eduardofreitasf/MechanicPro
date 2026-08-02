// ─────────────────────────────────────────────────────────────────────────────
// MechanicPro — Demo Data Seed Script
// Usage:  npm run seed
// Requires:  better-sqlite3   (installed automatically by the npm script)
// ─────────────────────────────────────────────────────────────────────────────

import path from "path";
import os from "os";
import fs from "fs";
import { createRequire } from "module";

// ── Resolve DB path ───────────────────────────────────────────────────────────
// Tauri v2 stores plugin-sql databases under:
//   Windows : %APPDATA%\<identifier>\<db-name>
//   macOS   : ~/Library/Application Support/<identifier>/<db-name>
//   Linux   : ~/.local/share/<identifier>/<db-name>

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
  console.error("   Launch MechanicPro at least once so the database is created, then run this script again.\n");
  process.exit(1);
}

console.log(`\n📂  Database found at:\n   ${dbPath}\n`);

// ── Load better-sqlite3 (install if needed via the npm script wrapper) ────────
const require = createRequire(import.meta.url);
let Database;
try {
  Database = require("better-sqlite3");
} catch {
  console.error("❌  better-sqlite3 is not installed. Run:  npm run seed   (it installs automatically)\n");
  process.exit(1);
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a YYYY-MM-DD string for `daysAgo` days before today */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

/** Returns an ISO datetime string for `daysAgo` days before today */
function isoAgo(n, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString().replace("T", " ").split(".")[0];
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Seed inside a transaction for speed ───────────────────────────────────────
const seed = db.transaction(() => {

  // ── 1. Clients ────────────────────────────────────────────────────────────
  const clientData = [
    { name: "João Silva",       phone: "912 345 678" },
    { name: "Maria Ferreira",   phone: "963 210 987" },
    { name: "Carlos Mendes",    phone: "935 678 901" },
    { name: "Ana Rodrigues",    phone: "916 789 012" },
    { name: "Pedro Costa",      phone: "968 456 321" },
    { name: "Rute Almeida",     phone: "924 321 765" },
    { name: "António Lopes",    phone: "911 234 567" },
    { name: "Sofia Martins",    phone: "969 876 543" },
    { name: "Luís Carvalho",    phone: "932 100 200" },
    { name: "Beatriz Nunes",    phone: "961 987 654" },
  ];

  const insertClient = db.prepare(
    "INSERT OR IGNORE INTO clients (name, phone) VALUES (?, ?)"
  );
  for (const c of clientData) insertClient.run(c.name, c.phone);

  const clients = db.prepare("SELECT id, name FROM clients WHERE deleted_at IS NULL").all();
  console.log(`✅  Clients:  ${clients.length} total`);

  // ── 2. Vehicles ───────────────────────────────────────────────────────────
  const vehicleData = [
    { plate: "AA-12-BB", brand: "Volkswagen", model: "Golf",      year: 2018, client: "João Silva"     },
    { plate: "CC-34-DD", brand: "Renault",    model: "Clio",      year: 2020, client: "Maria Ferreira" },
    { plate: "EE-56-FF", brand: "Seat",       model: "Ibiza",     year: 2017, client: "Carlos Mendes"  },
    { plate: "GG-78-HH", brand: "Opel",       model: "Astra",     year: 2015, client: "Ana Rodrigues"  },
    { plate: "II-90-JJ", brand: "Peugeot",    model: "308",       year: 2019, client: "Pedro Costa"    },
    { plate: "KK-11-LL", brand: "Ford",       model: "Focus",     year: 2016, client: "Rute Almeida"   },
    { plate: "MM-22-NN", brand: "Citroën",    model: "C3",        year: 2021, client: "António Lopes"  },
    { plate: "OO-33-PP", brand: "BMW",        model: "Série 3",   year: 2014, client: "Sofia Martins"  },
    { plate: "QQ-44-RR", brand: "Mercedes",   model: "Classe A",  year: 2022, client: "Luís Carvalho"  },
    { plate: "SS-55-TT", brand: "Toyota",     model: "Yaris",     year: 2020, client: "Beatriz Nunes"  },
    { plate: "UU-66-VV", brand: "Volkswagen", model: "Passat",    year: 2013, client: "João Silva"     },
    { plate: "WW-77-XX", brand: "Nissan",     model: "Qashqai",   year: 2019, client: "Carlos Mendes"  },
  ];

  const insertVehicle = db.prepare(
    "INSERT OR IGNORE INTO vehicles (client_id, plate, brand, model, year) VALUES (?, ?, ?, ?, ?)"
  );
  const clientByName = Object.fromEntries(clients.map(c => [c.name, c.id]));
  for (const v of vehicleData) {
    const cid = clientByName[v.client];
    if (cid) insertVehicle.run(cid, v.plate, v.brand, v.model, v.year);
  }

  const vehicles = db.prepare("SELECT id, plate FROM vehicles WHERE deleted_at IS NULL").all();
  console.log(`✅  Vehicles: ${vehicles.length} total`);

  // ── 3. Service Orders (spread across last ~8 months) ─────────────────────
  const operationSets = [
    [
      { desc: "Mudança de óleo e filtro",       price: 45.00 },
      { desc: "Filtro de ar",                   price: 18.00 },
    ],
    [
      { desc: "Pastilhas de travão dianteiras",  price: 85.00 },
      { desc: "Discos de travão dianteiros",     price: 120.00 },
      { desc: "Mão de obra — travões",           price: 60.00 },
    ],
    [
      { desc: "Revisão geral",                   price: 150.00 },
      { desc: "Correia de distribuição",         price: 220.00 },
    ],
    [
      { desc: "Diagnóstico eletrónico",          price: 30.00 },
      { desc: "Substituição de vela de ignição", price: 40.00 },
    ],
    [
      { desc: "Pneu dianteiro direito",          price: 95.00 },
      { desc: "Equilíbrio e alinhamento",        price: 35.00 },
    ],
    [
      { desc: "Amortecedor dianteiro esquerdo",  price: 180.00 },
      { desc: "Mão de obra — suspensão",         price: 70.00 },
    ],
    [
      { desc: "Bateria 70Ah",                    price: 110.00 },
      { desc: "Alternador recondicionado",       price: 200.00 },
    ],
    [
      { desc: "Mudança de óleo",                 price: 40.00 },
    ],
    [
      { desc: "Ar condicionado — carga gás",     price: 75.00 },
      { desc: "Filtro habitáculo",               price: 22.00 },
    ],
    [
      { desc: "Embraiagem completa",             price: 350.00 },
      { desc: "Mão de obra — embraiagem",        price: 150.00 },
    ],
    [
      { desc: "Limpeza de injetores",            price: 65.00 },
      { desc: "Filtro de combustível",           price: 25.00 },
    ],
    [
      { desc: "Caixa de velocidades — óleo",     price: 55.00 },
      { desc: "Revisão pré-IUC",                 price: 120.00 },
    ],
  ];

  // ~3–5 service orders per month for the last 8 months
  const insertOrder = db.prepare(
    "INSERT INTO service_orders (vehicle_id, mileage, hours, hourly_rate, observations, total_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );
  const insertOp = db.prepare(
    "INSERT INTO service_operations (service_order_id, description, price) VALUES (?, ?, ?)"
  );

  let orderCount = 0;
  for (let monthsBack = 8; monthsBack >= 0; monthsBack--) {
    const ordersThisMonth = rand(3, 6);
    for (let o = 0; o < ordersThisMonth; o++) {
      const vehicle = pick(vehicles);
      const ops = pick(operationSets);
      const mileage = rand(50000, 180000);
      const hours = parseFloat((rand(5, 30) / 10).toFixed(1)); // 0.5 – 3.0 h
      const hourlyRate = 45.00;
      const partsTotal = ops.reduce((s, op) => s + op.price, 0);
      const labourTotal = parseFloat((hours * hourlyRate).toFixed(2));
      const totalPrice = parseFloat((partsTotal + labourTotal).toFixed(2));

      // Place order somewhere in that month
      const dayOffset = monthsBack * 30 + rand(1, 28);
      const createdAt = isoAgo(dayOffset, rand(8, 17));

      const obs = pick([
        "Cliente informado. Revisão concluída.",
        "Peças encomendadas e montadas.",
        null,
        "Verificados todos os níveis.",
        "Trabalho concluído sem anomalias.",
      ]);

      const row = insertOrder.run(vehicle.id, mileage, hours, hourlyRate, obs, totalPrice, createdAt);
      const orderId = row.lastInsertRowid;
      for (const op of ops) insertOp.run(orderId, op.desc, op.price);
      orderCount++;
    }
  }
  console.log(`✅  Service orders: ${orderCount} total`);

  // ── 4. Expenses (spread across last ~8 months) ────────────────────────────
  const expenseTemplates = [
    { desc: "Compra de óleo motor 5W40 (12L)",         minCost: 60,  maxCost: 90  },
    { desc: "Material de limpeza e consumíveis",         minCost: 20,  maxCost: 50  },
    { desc: "Ferramentas — chaves combinadas",          minCost: 80,  maxCost: 200 },
    { desc: "Filtros de óleo (caixa de 10)",            minCost: 40,  maxCost: 70  },
    { desc: "Pastilhas de travão — stock",              minCost: 120, maxCost: 250 },
    { desc: "Água destilada e líquido de arrefec.",     minCost: 15,  maxCost: 35  },
    { desc: "Electricidade — fatura mensal",            minCost: 90,  maxCost: 180 },
    { desc: "Renda do espaço",                          minCost: 600, maxCost: 600 },
    { desc: "Seguro de responsabilidade civil",         minCost: 75,  maxCost: 75  },
    { desc: "Disco de rebarbadora",                     minCost: 12,  maxCost: 30  },
    { desc: "Luvas e equipamento de proteção",          minCost: 25,  maxCost: 60  },
    { desc: "Gás refrigerante R134a (1kg)",             minCost: 30,  maxCost: 50  },
    { desc: "Pneus — stock consumo",                    minCost: 200, maxCost: 450 },
    { desc: "Correia de distribuição — stock",          minCost: 90,  maxCost: 150 },
    { desc: "Bateria 70Ah — stock",                     minCost: 80,  maxCost: 120 },
    { desc: "Serviço de contabilidade (mensal)",        minCost: 100, maxCost: 100 },
    { desc: "Telefone e internet",                      minCost: 35,  maxCost: 55  },
    { desc: "Combustível — deslocações",                minCost: 40,  maxCost: 80  },
  ];

  const insertExpense = db.prepare(
    "INSERT INTO expenses (date, description, cost, receipt_no) VALUES (?, ?, ?, ?)"
  );

  // Fixed monthly costs (rent, accounting, insurance)
  const fixedExpenses = [
    { desc: "Renda do espaço",                  cost: 600.00, receiptPrefix: "RND" },
    { desc: "Serviço de contabilidade (mensal)", cost: 100.00, receiptPrefix: "CTB" },
    { desc: "Electricidade — fatura mensal",     cost: null,   receiptPrefix: "ELE" },  // randomised
    { desc: "Telefone e internet",               cost: 45.00,  receiptPrefix: "TEL" },
  ];

  let expenseCount = 0;

  for (let monthsBack = 8; monthsBack >= 0; monthsBack--) {
    // Fixed monthly expenses — always on the 1st of each month
    for (let f = 0; f < fixedExpenses.length; f++) {
      const fe = fixedExpenses[f];
      const cost = fe.cost ?? parseFloat((rand(90, 170)).toFixed(2));
      const dayOffset = monthsBack * 30 + 1;
      const date = daysAgo(dayOffset);
      const receiptNo = `${fe.receiptPrefix}-${date.substring(0, 7).replace("-", "")}`;
      insertExpense.run(date, fe.desc, cost, receiptNo);
      expenseCount++;
    }

    // Variable/ad-hoc expenses — 2–4 per month
    const adHoc = rand(2, 4);
    for (let a = 0; a < adHoc; a++) {
      const tmpl = pick(expenseTemplates.filter(t => !fixedExpenses.some(f => f.desc === t.desc)));
      const cost = parseFloat((rand(tmpl.minCost * 10, tmpl.maxCost * 10) / 10).toFixed(2));
      const dayOffset = monthsBack * 30 + rand(2, 28);
      const date = daysAgo(dayOffset);
      const receiptNo = rand(0, 1) === 1 ? `FAT-${date.replace(/-/g, "")}-${rand(100, 999)}` : null;
      insertExpense.run(date, tmpl.desc, cost, receiptNo);
      expenseCount++;
    }
  }

  console.log(`✅  Expenses:  ${expenseCount} total`);
});

seed();

console.log("\n🎉  Seed complete! Launch MechanicPro to see the demo data.\n");
db.close();
