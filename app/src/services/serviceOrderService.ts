import { getDb, ServiceOrder, ServiceOperation } from "../db";

export const serviceOrderService = {
  async getServiceOrders(search: string = "", sortOrder: "ASC" | "DESC" = "DESC"): Promise<ServiceOrder[]> {
    const db = await getDb();
    let query = `
      SELECT so.*, v.plate as vehicle_plate, c.name as client_name
      FROM service_orders so
      JOIN vehicles v ON so.vehicle_id = v.id
      JOIN clients c ON v.client_id = c.id
      WHERE so.deleted_at IS NULL
    `;
    let params: any[] = [];
    if (search.trim() !== "") {
      query += " AND (v.plate LIKE ? OR c.name LIKE ? OR so.observations LIKE ?)";
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }
    query += ` ORDER BY so.created_at ${sortOrder}`;
    return await db.select<ServiceOrder[]>(query, params);
  },

  async getServiceOrderById(id: number): Promise<ServiceOrder | null> {
    const db = await getDb();
    const orders = await db.select<ServiceOrder[]>(
      `SELECT so.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model, c.name as client_name, c.phone as client_phone
       FROM service_orders so
       JOIN vehicles v ON so.vehicle_id = v.id
       JOIN clients c ON v.client_id = c.id
       WHERE so.id = ? AND so.deleted_at IS NULL`,
      [id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    order.operations = await this.getOperations(id);
    return order;
  },

  async createServiceOrder(
    vehicleId: number,
    mileage: number,
    hours: number,
    hourlyRate: number,
    observations: string | null,
    hideLaborInPdf: boolean,
    operations: ServiceOperation[],
    date: string
  ): Promise<void> {
    const db = await getDb();
    
    // Calculate total price
    const operationsTotal = operations.reduce((sum, op) => sum + op.price, 0);
    const labourTotal = hours * hourlyRate;
    const totalPrice = operationsTotal + labourTotal;

    // Insert Service Order
    const result: any = await db.execute(
      `INSERT INTO service_orders (vehicle_id, mileage, hours, hourly_rate, observations, total_price, hide_labor_in_pdf, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [vehicleId, mileage, hours, hourlyRate, observations, totalPrice, hideLaborInPdf ? 1 : 0, date]
    );

    const serviceOrderId = result.lastInsertId;

    // Insert Operations
    for (const op of operations) {
      await db.execute(
        "INSERT INTO service_operations (service_order_id, description, price, hide_price_in_pdf) VALUES (?, ?, ?, ?)",
        [serviceOrderId, op.description, op.price, op.hide_price_in_pdf ? 1 : 0]
      );
    }
  },

  async getVehicleHistory(vehicleId: number): Promise<ServiceOrder[]> {
    const db = await getDb();
    const orders = await db.select<ServiceOrder[]>(
      `SELECT * FROM service_orders 
       WHERE vehicle_id = ? AND deleted_at IS NULL 
       ORDER BY created_at DESC`,
      [vehicleId]
    );

    for (const order of orders) {
      order.operations = await this.getOperations(order.id);
    }

    return orders;
  },

  async getClientHistory(clientId: number): Promise<ServiceOrder[]> {
    const db = await getDb();
    const orders = await db.select<ServiceOrder[]>(
      `SELECT so.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model 
       FROM service_orders so
       JOIN vehicles v ON so.vehicle_id = v.id
       WHERE v.client_id = ? AND so.deleted_at IS NULL 
       ORDER BY so.created_at DESC`,
      [clientId]
    );

    for (const order of orders) {
      order.operations = await this.getOperations(order.id);
    }

    return orders;
  },

  async getOperations(serviceOrderId: number): Promise<ServiceOperation[]> {
    const db = await getDb();
    return await db.select<ServiceOperation[]>(
      "SELECT * FROM service_operations WHERE service_order_id = ?",
      [serviceOrderId]
    );
  },

  async deleteServiceOrder(id: number): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE service_orders SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
  },

  async updateLaborVisibility(orderId: number, hide: boolean): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE service_orders SET hide_labor_in_pdf = ? WHERE id = ?",
      [hide ? 1 : 0, orderId]
    );
  },

  async updateOperationVisibility(operationId: number, hide: boolean): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE service_operations SET hide_price_in_pdf = ? WHERE id = ?",
      [hide ? 1 : 0, operationId]
    );
  }
};
