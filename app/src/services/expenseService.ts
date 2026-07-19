import { getDb, Expense } from "../db";

export interface ExpenseAnalytics {
  totalThisMonth: number;
  totalLastMonth: number;
  averagePerMonth: number;
  countThisMonth: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  netThisMonth: number;
  netLastMonth: number;
  expenseRatioThisMonth: number | null; // null when no revenue
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

  async getAnalytics(): Promise<ExpenseAnalytics> {
    const db = await getDb();
    const { from: cmFrom, to: cmTo } = currentMonthRange();
    const { from: lmFrom, to: lmTo } = lastMonthRange();

    // ── Expenses ──────────────────────────────────────────────────────────────
    const [thisMonthExpRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(cost), 0) as total, COUNT(*) as cnt FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ?",
      [cmFrom, cmTo]
    );
    const [lastMonthExpRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(cost), 0) as total FROM expenses WHERE deleted_at IS NULL AND date >= ? AND date <= ?",
      [lmFrom, lmTo]
    );
    const [avgRow] = await db.select<any[]>(`
      SELECT COALESCE(AVG(monthly_total), 0) as avg_total FROM (
        SELECT SUM(cost) as monthly_total
        FROM expenses
        WHERE deleted_at IS NULL
        GROUP BY strftime('%Y-%m', date)
      )
    `);

    // ── Revenue (from service_orders) ─────────────────────────────────────────
    // service_orders.created_at is stored as ISO string; strftime comparison works fine
    const [thisMonthRevRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM service_orders WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?",
      [cmFrom, cmTo + "T23:59:59"]
    );
    const [lastMonthRevRow] = await db.select<any[]>(
      "SELECT COALESCE(SUM(total_price), 0) as total FROM service_orders WHERE deleted_at IS NULL AND created_at >= ? AND created_at <= ?",
      [lmFrom, lmTo + "T23:59:59"]
    );

    // ── Monthly trend (last 12 months, expenses + revenue) ───────────────────
    const expTrendRows = await db.select<any[]>(`
      SELECT strftime('%Y-%m', date) as month, SUM(cost) as total
      FROM expenses
      WHERE deleted_at IS NULL
      GROUP BY month
    `);
    const revTrendRows = await db.select<any[]>(`
      SELECT strftime('%Y-%m', created_at) as month, SUM(total_price) as total
      FROM service_orders
      WHERE deleted_at IS NULL
      GROUP BY month
    `);

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const now = new Date();
    const last12: { month: string; despesas: number; receita: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const expFound = expTrendRows.find((r) => r.month === key);
      const revFound = revTrendRows.find((r) => r.month === key);
      last12.push({
        month: `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`,
        despesas: expFound ? expFound.total : 0,
        receita: revFound ? revFound.total : 0,
      });
    }

    // ── Derived values ────────────────────────────────────────────────────────
    const totalExp = thisMonthExpRow.total;
    const totalRev = thisMonthRevRow.total;
    const lastExp = lastMonthExpRow.total;
    const lastRev = lastMonthRevRow.total;

    return {
      totalThisMonth: totalExp,
      totalLastMonth: lastExp,
      averagePerMonth: avgRow.avg_total,
      countThisMonth: thisMonthExpRow.cnt,
      revenueThisMonth: totalRev,
      revenueLastMonth: lastRev,
      netThisMonth: totalRev - totalExp,
      netLastMonth: lastRev - lastExp,
      expenseRatioThisMonth: totalRev > 0 ? (totalExp / totalRev) * 100 : null,
      monthlyTrend: last12,
    };
  },
};
