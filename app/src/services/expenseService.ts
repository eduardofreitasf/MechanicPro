import { getDb, Expense } from "../db";

export interface MonthAnalytics {
  totalExpenses: number;
  totalRevenue: number;
  netResult: number;
  expenseCount: number;
  dailyBreakdown: { day: number; label: string; total: number; revenue: number }[];
  expenses: Expense[];
  topExpense: Expense | null;
}

export interface ExpenseAnalytics {
  totalExpenses: number;      // total expenses for the year
  totalRevenue: number;       // total revenue for the year
  netResult: number;          // revenue - expenses
  expenseCount: number;       // number of expense entries
  averagePerMonth: number;    // avg monthly expenses (months with data only)
  monthlyTrend: { month: string; despesas: number; receita: number }[];
}

function currentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;
  return { from, to };
}

function lastMonthRange(): { from: string; to: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-31`;
  return { from, to };
}

export const expenseService = {
  async getExpenses(opts: {
    search?: string;
    sortBy?: "date" | "cost";
    sortOrder?: "ASC" | "DESC";
    dateFrom?: string;
    dateTo?: string;
    costMin?: number;
    costMax?: number;
  } = {}): Promise<Expense[]> {
    const db = await getDb();
    const {
      search = "",
      sortBy = "date",
      sortOrder = "DESC",
      dateFrom,
      dateTo,
      costMin,
      costMax,
    } = opts;

    let query = "SELECT * FROM expenses WHERE deleted_at IS NULL";
    const params: any[] = [];

    if (search.trim()) {
      query += " AND (description LIKE ? OR receipt_no LIKE ?)";
      const s = `%${search.trim()}%`;
      params.push(s, s);
    }
    if (dateFrom) {
      query += " AND date >= ?";
      params.push(dateFrom);
    }
    if (dateTo) {
      query += " AND date <= ?";
      params.push(dateTo);
    }
    if (costMin !== undefined && costMin !== null && !isNaN(costMin)) {
      query += " AND cost >= ?";
      params.push(costMin);
    }
    if (costMax !== undefined && costMax !== null && !isNaN(costMax)) {
      query += " AND cost <= ?";
      params.push(costMax);
    }

    const col = sortBy === "cost" ? "cost" : "date";
    query += ` ORDER BY ${col} ${sortOrder}`;

    return await db.select<Expense[]>(query, params);
  },

  async createExpense(data: Pick<Expense, "date" | "cost" | "description" | "receipt_no">): Promise<void> {
    const db = await getDb();
    await db.execute(
      "INSERT INTO expenses (date, description, cost, receipt_no) VALUES (?, ?, ?, ?)",
      [data.date, data.description ?? null, data.cost, data.receipt_no ?? null]
    );
  },

  async deleteExpense(id: number): Promise<void> {
    const db = await getDb();
    await db.execute(
      "UPDATE expenses SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );
  },

  async getAnalytics(year: number): Promise<ExpenseAnalytics> {
    const db = await getDb();
    const yearStr = String(year);
    const from = `${yearStr}-01-01`;
    const to   = `${yearStr}-12-31`;

    // ── Annual expense totals ─────────────────────────────────────────────────
    const [expRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as cnt FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ?",
      [from, to]
    );

    // ── Annual revenue total ──────────────────────────────────────────────────
    const [revRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM service_orders WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?",
      [from, to + "T23:59:59"]
    );

    // ── Average monthly expenses (only months that had data) ──────────────────
    const [avgRow] = await db.select<any[]>(
      `SELECT COALESCE(AVG(monthly_total), 0) as avg_total FROM (
         SELECT SUM(cost) as monthly_total
         FROM expenses
         WHERE deleted_at IS NULL AND date >= ? AND date <= ?
         GROUP BY strftime('%Y-%m', date)
       )`,
      [from, to]
    );

    // ── Monthly trend: all 12 months of the chosen year ───────────────────────
    const expTrendRows = await db.select<any[]>(
      `SELECT strftime('%Y-%m', date) as month, SUM(cost) as total
       FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ?
       GROUP BY month`,
      [from, to]
    );
    const revTrendRows = await db.select<any[]>(
      `SELECT strftime('%Y-%m', created_at) as month, SUM(total_price) as total
       FROM service_orders WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?
       GROUP BY month`,
      [from, to + "T23:59:59"]
    );

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const key = `${yearStr}-${String(i + 1).padStart(2, "0")}`;
      const expFound = expTrendRows.find((r) => r.month === key);
      const revFound = revTrendRows.find((r) => r.month === key);
      return {
        month: monthNames[i],
        despesas: expFound ? expFound.total : 0,
        receita: revFound ? revFound.total : 0,
      };
    });

    return {
      totalExpenses: expRow.total,
      totalRevenue: revRow.total,
      netResult: revRow.total - expRow.total,
      expenseCount: expRow.cnt,
      averagePerMonth: avgRow.avg_total,
      monthlyTrend,
    };
  },

  async getMonthAnalytics(year: number, month: number): Promise<MonthAnalytics> {
    const db = await getDb();
    const mm = String(month).padStart(2, "0");
    const from = `${year}-${mm}-01`;
    // last day: use day 31 trick (SQLite date comparison)
    const to = `${year}-${mm}-31`;

    // Revenue from service_orders in this month
    const [revRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM service_orders WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?",
      [from, to + "T23:59:59"]
    );

    // Expense aggregates
    const [expRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as cnt FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ?",
      [from, to]
    );

    // All expenses this month
    const expenses = await db.select<Expense[]>(
      "SELECT * FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ? ORDER BY date ASC",
      [from, to]
    );

    // Top expense
    const topRow = await db.select<Expense[]>(
      "SELECT * FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ? ORDER BY cost DESC LIMIT 1",
      [from, to]
    );

    // Build daily breakdown — every day of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyExpenses = new Map<number, number>();
    for (const e of expenses) {
      const d = new Date(e.date).getUTCDate();
      dailyExpenses.set(d, (dailyExpenses.get(d) ?? 0) + e.cost);
    }

    // Daily revenue from service_orders (created_at stored as date string)
    const revRows = await db.select<any[]>(
      `SELECT CAST(strftime('%d', created_at) AS INTEGER) as day,
              COALESCE(SUM(total_price), 0) as rev
       FROM service_orders
       WHERE deleted_at IS NULL
         AND created_at >= ? AND created_at <= ?
       GROUP BY day`,
      [from, to + "T23:59:59"]
    );
    const dailyRevenue = new Map<number, number>();
    for (const r of revRows) {
      dailyRevenue.set(r.day, r.rev);
    }

    const dailyBreakdown = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        label: String(day),
        total: dailyExpenses.get(day) ?? 0,
        revenue: dailyRevenue.get(day) ?? 0,
      };
    });

    const totalExpenses = expRow.total;
    const totalRevenue = revRow.total;

    return {
      totalExpenses,
      totalRevenue,
      netResult: totalRevenue - totalExpenses,
      expenseCount: expRow.cnt,
      dailyBreakdown,
      expenses,
      topExpense: topRow[0] ?? null,
    };
  },
};
