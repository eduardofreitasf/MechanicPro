import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:mechanicpro.db');
    await initDb(dbInstance);
  }
  return dbInstance;
}

async function initDb(db: Database) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_client_name_active ON clients(name) WHERE deleted_at IS NULL;

    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      plate TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (client_id) REFERENCES clients (id)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_plate_active ON vehicles(plate) WHERE deleted_at IS NULL;

    CREATE TABLE IF NOT EXISTS service_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vehicle_id INTEGER NOT NULL,
      mileage INTEGER NOT NULL,
      hours REAL NOT NULL,
      hourly_rate REAL NOT NULL,
      observations TEXT,
      total_price REAL NOT NULL,
      hide_labor_in_pdf INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    );

    CREATE TABLE IF NOT EXISTS service_operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL,
      hide_price_in_pdf INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (service_order_id) REFERENCES service_orders (id)
    );
  `);

  // expenses table — idempotent, no ALTER needed (new table)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      description TEXT,
      cost        REAL    NOT NULL,
      receipt_no  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at  DATETIME
    )
  `);

  try {
    await db.execute(
      "ALTER TABLE service_operations ADD COLUMN hide_price_in_pdf INTEGER NOT NULL DEFAULT 0"
    );
  } catch {
    // column already exists
  }

  try {
    await db.execute(
      "ALTER TABLE service_orders ADD COLUMN hide_labor_in_pdf INTEGER NOT NULL DEFAULT 0"
    );
  } catch {
    // column already exists
  }
}

export interface Client {
  id: number;
  name: string;
  phone: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface Vehicle {
  id: number;
  client_id: number;
  plate: string;
  brand: string;
  model: string;
  year: number | null;
  created_at: string;
  deleted_at: string | null;
  client_name?: string;
}

export interface ServiceOrder {
  id: number;
  vehicle_id: number;
  mileage: number;
  hours: number;
  hourly_rate: number;
  observations: string | null;
  total_price: number;
  hide_labor_in_pdf?: boolean;
  created_at: string;
  deleted_at: string | null;
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_model?: string;
  client_name?: string;
  client_phone?: string | null;
  operations?: ServiceOperation[];
}

export interface ServiceOperation {
  id?: number;
  service_order_id?: number;
  description: string;
  price: number;
  hide_price_in_pdf?: boolean;
}

export interface Expense {
  id?: number;
  date: string;
  description?: string | null;
  cost: number;
  receipt_no?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}
