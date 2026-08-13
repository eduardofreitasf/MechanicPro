import { getDb } from "../db";

export interface DashboardStats {
  clientsCount: number;
  vehiclesCount: number;
  servicesCount: number;
  totalRevenue: number;
  averageTicket: number;
  monthlyRevenue: { month: string; revenue: number }[];
  brandsData: { brand: string; count: number }[];
  recentServices: { id: number; plate: string; client: string; total: number; date: string }[];
  topClients: { name: string; count: number }[];
  topVehicles: { plate: string; brand: string; model: string; count: number }[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const db = await getDb();

    // Get basic counts
    const clients = await db.select<any[]>("SELECT COUNT(*) as count FROM clients WHERE deleted_at IS NULL");
    const vehicles = await db.select<any[]>("SELECT COUNT(*) as count FROM vehicles WHERE deleted_at IS NULL");
    const services = await db.select<any[]>("SELECT COUNT(*) as count FROM service_orders WHERE deleted_at IS NULL AND is_draft = 0");
    const revenue = await db.select<any[]>("SELECT SUM(total_price) as total FROM service_orders WHERE deleted_at IS NULL AND is_draft = 0");

    // Get revenue by month (last 6 months)
    const monthlyData = await db.select<any[]>(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        SUM(total_price) as revenue
      FROM service_orders
      WHERE deleted_at IS NULL AND is_draft = 0
      GROUP BY month
      ORDER BY month DESC
      LIMIT 6
    `);

    // Get most common brands
    const brandsData = await db.select<any[]>(`
      SELECT v.brand, COUNT(*) as count
      FROM service_orders so
      JOIN vehicles v ON so.vehicle_id = v.id
      WHERE so.deleted_at IS NULL AND so.is_draft = 0
      GROUP BY v.brand
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get top clients
    const topClients = await db.select<any[]>(`
      SELECT c.name, COUNT(*) as count
      FROM service_orders so
      JOIN vehicles v ON so.vehicle_id = v.id
      JOIN clients c ON v.client_id = c.id
      WHERE so.deleted_at IS NULL AND so.is_draft = 0
      GROUP BY c.id
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get top vehicles
    const topVehicles = await db.select<any[]>(`
      SELECT v.plate, v.brand, v.model, COUNT(*) as count
      FROM service_orders so
      JOIN vehicles v ON so.vehicle_id = v.id
      WHERE so.deleted_at IS NULL AND so.is_draft = 0
      GROUP BY v.id
      ORDER BY count DESC
      LIMIT 5
    `);

    // Get recent services
    const recentServices = await db.select<any[]>(`
      SELECT so.id, v.plate, c.name as client, so.total_price as total, so.created_at as date
      FROM service_orders so
      JOIN vehicles v ON so.vehicle_id = v.id
      JOIN clients c ON v.client_id = c.id
      WHERE so.deleted_at IS NULL AND so.is_draft = 0
      ORDER BY so.created_at DESC
      LIMIT 5
    `);

    // Format months for display (e.g., "Jan", "Feb")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthly = monthlyData.reverse().map(item => {
      const [year, month] = item.month.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        revenue: item.revenue || 0
      };
    });

    const totalRevenue = revenue[0].total || 0;
    const servicesCount = services[0].count || 0;

    return {
      clientsCount: clients[0].count || 0,
      vehiclesCount: vehicles[0].count || 0,
      servicesCount,
      totalRevenue,
      averageTicket: servicesCount > 0 ? totalRevenue / servicesCount : 0,
      monthlyRevenue: formattedMonthly,
      brandsData: brandsData.map(b => ({ brand: b.brand, count: b.count })),
      recentServices: recentServices.map(s => ({
        id: s.id,
        plate: s.plate,
        client: s.client,
        total: s.total,
        date: s.date
      })),
      topClients: topClients.map(c => ({ name: c.name, count: c.count })),
      topVehicles: topVehicles.map(v => ({ plate: v.plate, brand: v.brand, model: v.model, count: v.count }))
    };
  }
};


