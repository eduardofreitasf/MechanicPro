import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { pt } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import {
  Search, Plus, Trash2, Receipt, BarChart3, List,
  ArrowUpDown, Calendar, TrendingDown, TrendingUp, Hash, AlertCircle,
  SlidersHorizontal, ChevronLeft, ChevronRight, Star, CalendarDays,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, LineChart, Line, ReferenceLine, Cell,
} from "recharts";
import { expenseService, ExpenseAnalytics, MonthAnalytics } from "../services/expenseService";
import { Expense } from "../db";
import { ConfirmModal } from "../components/ConfirmModal";

type Tab = "list" | "analytics" | "monthly";
type SortBy = "date" | "cost";
type SortOrder = "ASC" | "DESC";

const PT_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// ─── Add Expense Modal ───────────────────────────────────────────────────────

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

registerLocale("pt", pt);

function AddExpenseModal({ isOpen, onClose, onSuccess }: AddExpenseModalProps) {
  const [date, setDate] = useState<Date | null>(new Date());
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setDate(new Date());
    setDescription("");
    setCost("");
    setReceiptNo("");
    setError(null);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) { setError("A data é obrigatória."); return; }
    const parsedCost = parseFloat(cost);
    if (isNaN(parsedCost) || parsedCost < 0) { setError("Introduza um custo válido."); return; }
    const isoDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    setSaving(true);
    try {
      await expenseService.createExpense({
        date: isoDate,
        description: description.trim() || null,
        cost: parsedCost,
        receipt_no: receiptNo.trim() || null,
      });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao guardar despesa.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "460px" }}>
        <header className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ backgroundColor: "#ede9fe", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Receipt size={20} color="#7c3aed" />
            </div>
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Nova Despesa</h2>
          </div>
        </header>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "20px 0" }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--danger)", background: "#fee2e2", padding: "10px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="form-group">
            <label>Data <span style={{ color: "var(--danger)" }}>*</span></label>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
              dateFormat="dd/MM/yyyy"
              locale="pt"
              className="form-input"
              placeholderText="DD/MM/AAAA"
              maxDate={new Date()}
              showYearDropdown
              dropdownMode="select"
              required
            />
          </div>

          <div className="form-group">
            <label>Custo (€) <span style={{ color: "var(--danger)" }}>*</span></label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              placeholder="0.00"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Descrição <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Compra de óleo, ferramenta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nº Recibo <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: FAT-2024-001"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
            />
          </div>
        </form>

        <footer className="modal-footer" style={{ borderTop: "none", paddingTop: 0 }}>
          <button className="btn-secondary" onClick={handleClose} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button className="btn" onClick={handleSubmit} disabled={saving} style={{ flex: 1 }}>
            {saving ? "A guardar..." : "Guardar"}
          </button>
        </footer>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, icon, color, sub }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{
        width: "48px", height: "48px", borderRadius: "12px",
        backgroundColor: `${color}20`, color,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{title}</div>
        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
        {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Month Picker ─────────────────────────────────────────────────────────────

interface MonthPickerProps {
  year: number;
  month: number; // 1-based
  onChange: (year: number, month: number) => void;
}

function MonthPicker({ year, month, onChange }: MonthPickerProps) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const go = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    // Don't allow future months
    if (y > now.getFullYear() || (y === now.getFullYear() && m > now.getMonth() + 1)) return;
    onChange(y, m);
  };

  // Build list of all months up to current
  const options: { label: string; y: number; m: number }[] = [];
  const start = new Date(now.getFullYear() - 3, now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
    options.push({ label: `${PT_MONTHS[d.getMonth()]} ${d.getFullYear()}`, y: d.getFullYear(), m: d.getMonth() + 1 });
  }
  options.reverse(); // most recent first

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "12px",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "10px 16px", width: "fit-content"
    }}>
      <button
        onClick={() => go(-1)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", display: "flex", alignItems: "center",
          padding: "4px", borderRadius: "6px", transition: "all 0.15s",
        }}
        title="Mês anterior"
      >
        <ChevronLeft size={20} />
      </button>

      <select
        value={`${year}-${String(month).padStart(2, "0")}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split("-").map(Number);
          onChange(y, m);
        }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "1rem", fontWeight: 700, color: "var(--text)",
          outline: "none", textAlign: "center", minWidth: "160px",
          fontFamily: "inherit",
        }}
      >
        {options.map((o) => (
          <option key={`${o.y}-${o.m}`} value={`${o.y}-${String(o.m).padStart(2, "0")}`}>
            {o.label}
          </option>
        ))}
      </select>

      <button
        onClick={() => go(+1)}
        disabled={isCurrentMonth}
        style={{
          background: "none", border: "none",
          cursor: isCurrentMonth ? "not-allowed" : "pointer",
          color: isCurrentMonth ? "var(--border)" : "var(--text-muted)",
          display: "flex", alignItems: "center",
          padding: "4px", borderRadius: "6px", transition: "all 0.15s",
        }}
        title="Mês seguinte"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ─── Custom Tooltip for day chart ─────────────────────────────────────────────

function DayTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "10px", padding: "10px 14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontSize: "0.875rem"
    }}>
      <div style={{ fontWeight: 700, marginBottom: "4px" }}>Dia {label}</div>
      <div style={{ color: "#dc2626", fontWeight: 600 }}>{Number(payload[0].value).toFixed(2)} €</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("list");

  // List state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [costMin, setCostMin] = useState("");
  const [costMax, setCostMax] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasAdvancedFilters = !!(dateFrom || dateTo || costMin || costMax);

  // Analytics state
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Monthly tab state
  const now = new Date();
  const [monthYear, setMonthYear] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const [monthData, setMonthData] = useState<MonthAnalytics | null>(null);
  const [monthLoading, setMonthLoading] = useState(false);

  const fetchExpenses = async () => {
    const result = await expenseService.getExpenses({
      search,
      sortBy,
      sortOrder,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      costMin: costMin ? parseFloat(costMin) : undefined,
      costMax: costMax ? parseFloat(costMax) : undefined,
    });
    setExpenses(result);
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    const result = await expenseService.getAnalytics();
    setAnalytics(result);
    setAnalyticsLoading(false);
  };

  const fetchMonthData = async (year: number, month: number) => {
    setMonthLoading(true);
    const result = await expenseService.getMonthAnalytics(year, month);
    setMonthData(result);
    setMonthLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [search, sortBy, sortOrder, dateFrom, dateTo, costMin, costMax]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "monthly") fetchMonthData(monthYear.year, monthYear.month);
  }, [activeTab, monthYear]);

  const handleDelete = async () => {
    if (deleteId === null) return;
    await expenseService.deleteExpense(deleteId);
    setDeleteId(null);
    fetchExpenses();
    if (activeTab === "analytics") fetchAnalytics();
    if (activeTab === "monthly") fetchMonthData(monthYear.year, monthYear.month);
  };

  const fmt = (v: number) => v.toFixed(2) + " €";

  // Tab definitions
  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: "list", icon: <List size={16} />, label: "Lista" },
    { id: "analytics", icon: <BarChart3 size={16} />, label: "Análise" },
    { id: "monthly", icon: <CalendarDays size={16} />, label: "Mensal" },
  ];

  return (
    <>
      {/* ── Header ── */}
      <header className="header">
        <div>
          <h1>Despesas</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Registo e análise das despesas da oficina.</p>
        </div>
        <div className="header-actions">
          <button className="btn" onClick={() => setIsAddOpen(true)}>
            <Plus size={18} /> Nova Despesa
          </button>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {tabs.map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: "0.9rem", transition: "all 0.15s",
              background: activeTab === id ? "var(--primary)" : "transparent",
              color: activeTab === id ? "#fff" : "var(--text-muted)",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* ══════════════════ LIST TAB ══════════════════ */}
      {activeTab === "list" && (
        <>
          {/* Filters toolbar */}
          <div className="card" style={{ padding: "16px 20px", marginBottom: "16px" }}>
            {/* Primary row: always visible */}
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <Search className="input-icon" size={18} />
                <input
                  type="text"
                  className="input"
                  placeholder="Pesquisar descrição ou nº recibo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="input-group">
                <ArrowUpDown className="input-icon" size={18} />
                <select
                  className="input select-compact"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, ord] = e.target.value.split("-") as [SortBy, SortOrder];
                    setSortBy(by);
                    setSortOrder(ord);
                  }}
                >
                  <option value="date-DESC">Data ↓</option>
                  <option value="date-ASC">Data ↑</option>
                  <option value="cost-DESC">Custo ↓</option>
                  <option value="cost-ASC">Custo ↑</option>
                </select>
              </div>

              {/* Filters toggle */}
              <button
                className={filtersOpen || hasAdvancedFilters ? "btn" : "btn-secondary"}
                style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative", padding: "8px 16px", flexShrink: 0 }}
                onClick={() => setFiltersOpen((o) => !o)}
              >
                <SlidersHorizontal size={16} />
                Filtros
                {hasAdvancedFilters && (
                  <span style={{
                    position: "absolute", top: "-5px", right: "-5px",
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: "#dc2626", border: "2px solid var(--surface)"
                  }} />
                )}
              </button>
            </div>

            {/* Secondary row: advanced filters (collapsible) */}
            {filtersOpen && (
              <div style={{
                display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-end",
                marginTop: "16px", paddingTop: "16px",
                borderTop: "1px solid var(--border)"
              }}>
                {/* Date range */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={13} /> Período
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input type="date" className="input" style={{ padding: "8px 10px", fontSize: "0.85rem" }} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    <span style={{ color: "var(--text-muted)" }}>→</span>
                    <input type="date" className="input" style={{ padding: "8px 10px", fontSize: "0.85rem" }} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                  </div>
                </div>

                {/* Cost range */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>Custo (€)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <input type="number" min="0" step="0.01" className="input" style={{ padding: "8px 10px", fontSize: "0.85rem", width: "100px" }} placeholder="Mín" value={costMin} onChange={(e) => setCostMin(e.target.value)} />
                    <span style={{ color: "var(--text-muted)" }}>–</span>
                    <input type="number" min="0" step="0.01" className="input" style={{ padding: "8px 10px", fontSize: "0.85rem", width: "100px" }} placeholder="Máx" value={costMax} onChange={(e) => setCostMax(e.target.value)} />
                  </div>
                </div>

                {hasAdvancedFilters && (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: "0.8rem", padding: "8px 14px", alignSelf: "flex-end" }}
                    onClick={() => { setDateFrom(""); setDateTo(""); setCostMin(""); setCostMax(""); }}
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card">
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Nº Recibo</th>
                    <th style={{ textAlign: "right" }}>Custo</th>
                    <th className="actions-cell">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((exp) => (
                    <tr key={exp.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{new Date(exp.date).toLocaleDateString("pt-PT")}</td>
                      <td style={{ color: exp.description ? "var(--text)" : "var(--text-muted)" }}>
                        {exp.description || "—"}
                      </td>
                      <td style={{ color: exp.receipt_no ? "var(--text)" : "var(--text-muted)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                        {exp.receipt_no || "—"}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                        {exp.cost.toFixed(2)} €
                      </td>
                      <td className="actions-cell">
                        <button className="btn danger" onClick={() => setDeleteId(exp.id!)}>
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expenses.length === 0 && (
              <div className="empty-state">
                <Receipt size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
                <p>Nenhuma despesa encontrada. Registe uma para começar.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════════ ANALYTICS TAB ══════════════════ */}
      {activeTab === "analytics" && (
        analyticsLoading || !analytics ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>A carregar...</div>
        ) : (
          (() => {
            const trendData = analytics.monthlyTrend.map((item) => ({
              ...item,
              lucro: item.receita - item.despesas,
            }));

            return (
              <div className="page-stack">
                {/* Expense KPIs */}
                <div className="grid-stats">
                  <StatCard
                    title="Despesa este mês"
                    value={fmt(analytics.totalThisMonth)}
                    icon={<TrendingDown size={22} />}
                    color="#dc2626"
                  />
                  <StatCard
                    title="Nº total de despesas"
                    value={String(analytics.totalCount)}
                    icon={<Hash size={22} />}
                    color="#10b981"
                  />
                  <StatCard
                    title="Despesa Média mensal"
                    value={fmt(analytics.averagePerMonth)}
                    icon={<BarChart3 size={22} />}
                    color="#6366f1"
                  />
                  <StatCard
                    title="Resultado líquido"
                    value={fmt(Math.abs(analytics.netThisMonth))}
                    sub={analytics.netThisMonth >= 0 ? "▲ Lucro" : "▼ Prejuízo"}
                    icon={analytics.netThisMonth >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                    color={analytics.netThisMonth >= 0 ? "#10b981" : "#dc2626"}
                  />
                </div>

                {/* Chart 1: Receita vs Despesas */}
                <div className="card" style={{ padding: "24px" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                    <BarChart3 size={20} color="#6366f1" /> Receita vs Despesas — últimos 12 meses
                  </h3>
                  <div style={{ height: "320px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.monthlyTrend} margin={{ left: 10 }} barGap={4} barCategoryGap="30%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                        <Tooltip
                          formatter={(v: number, name: string) => [
                            `${v.toFixed(2)} €`,
                            name === "receita" ? "Receita" : "Despesas",
                          ]}
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 16px rgba(0,0,0,0.08)" }}
                        />
                        <Legend
                          formatter={(value) => value === "receita" ? "Receita" : "Despesas"}
                          wrapperStyle={{ fontSize: "0.85rem", paddingTop: "12px" }}
                        />
                        <Bar dataKey="receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={16} />
                        <Bar dataKey="despesas" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Resultado Líquido Mensal Line Chart */}
                <div className="card" style={{ padding: "24px" }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                    <TrendingUp size={20} color="#10b981" /> Resultado Líquido Mensal — últimos 12 meses
                  </h3>
                  <div style={{ height: "320px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData} margin={{ left: 10, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} dy={8} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                        <Tooltip
                          formatter={(v: number) => [`${v.toFixed(2)} €`, "Resultado Líquido"]}
                          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 16px rgba(0,0,0,0.08)" }}
                        />
                        <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                        <Legend
                          formatter={() => "Lucro / Prejuízo"}
                          wrapperStyle={{ fontSize: "0.85rem", paddingTop: "12px" }}
                        />
                        <Line type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            );
          })()
        )
      )}

      {/* ══════════════════ MONTHLY TAB ══════════════════ */}
      {activeTab === "monthly" && (
        <div className="page-stack">
          {/* Month Picker row */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <MonthPicker
              year={monthYear.year}
              month={monthYear.month}
              onChange={(y, m) => setMonthYear({ year: y, month: m })}
            />
          </div>

          {monthLoading || !monthData ? (
            <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)" }}>A carregar...</div>
          ) : (
            <>
              {/* KPI Cards */}
              <div className="grid-stats">
                <StatCard
                  title="Total Despesas"
                  value={fmt(monthData.totalExpenses)}
                  icon={<TrendingDown size={22} />}
                  color="#dc2626"
                  sub={`${monthData.expenseCount} entr${monthData.expenseCount === 1 ? "ada" : "adas"}`}
                />
                <StatCard
                  title="Total Receita"
                  value={fmt(monthData.totalRevenue)}
                  icon={<TrendingUp size={22} />}
                  color="#10b981"
                />
                <StatCard
                  title="Resultado Líquido"
                  value={fmt(Math.abs(monthData.netResult))}
                  sub={monthData.netResult >= 0 ? "▲ Lucro" : "▼ Prejuízo"}
                  icon={monthData.netResult >= 0 ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                  color={monthData.netResult >= 0 ? "#10b981" : "#dc2626"}
                />
                <StatCard
                  title="Nº de Despesas"
                  value={String(monthData.expenseCount)}
                  icon={<Hash size={22} />}
                  color="#6366f1"
                />
              </div>

              {/* Top Expense callout */}
              {monthData.topExpense && (
                <div className="card" style={{
                  padding: "20px 24px",
                  background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
                  border: "1px solid #fed7aa",
                  display: "flex", alignItems: "center", gap: "16px"
                }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: "#f97316", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0,
                  }}>
                    <Star size={20} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#9a3412", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                      Maior Despesa do Mês
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#431407", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {monthData.topExpense.description || "Sem descrição"}
                    </div>
                    {monthData.topExpense.receipt_no && (
                      <div style={{ fontSize: "0.8rem", color: "#9a3412", fontFamily: "monospace", marginTop: "2px" }}>
                        {monthData.topExpense.receipt_no}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#c2410c", flexShrink: 0 }}>
                    {monthData.topExpense.cost.toFixed(2)} €
                  </div>
                </div>
              )}

              {/* Day-by-day Bar Chart */}
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                  <CalendarDays size={20} color="#6366f1" />
                  Despesas por Dia — {PT_MONTHS[monthYear.month - 1]} {monthYear.year}
                </h3>
                {monthData.totalExpenses === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                    <Receipt size={36} style={{ opacity: 0.2, marginBottom: "12px" }} />
                    <p>Sem despesas registadas neste mês.</p>
                  </div>
                ) : (
                  <div style={{ height: "280px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthData.dailyBreakdown} margin={{ left: 10 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 10 }}
                          dy={8}
                          interval={1}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 11 }}
                          tickFormatter={(v) => `${v}€`}
                        />
                        <Tooltip content={<DayTooltip />} />
                        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                          {monthData.dailyBreakdown.map((entry) => (
                            <Cell
                              key={`cell-${entry.day}`}
                              fill={entry.total > 0 ? "#dc2626" : "#f1f5f9"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Expense list for the month */}
              <div className="card">
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Receipt size={18} color="var(--primary)" />
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>
                    Despesas de {PT_MONTHS[monthYear.month - 1]} {monthYear.year}
                  </h3>
                  <span style={{
                    marginLeft: "auto", background: "var(--primary)", color: "#fff",
                    borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
                    padding: "2px 10px"
                  }}>
                    {monthData.expenseCount}
                  </span>
                </div>

                {monthData.expenses.length === 0 ? (
                  <div className="empty-state">
                    <Receipt size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
                    <p>Nenhuma despesa registada neste mês.</p>
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Data</th>
                          <th>Descrição</th>
                          <th>Nº Recibo</th>
                          <th style={{ textAlign: "right" }}>Custo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthData.expenses.map((exp) => (
                          <tr key={exp.id}>
                            <td style={{ whiteSpace: "nowrap" }}>{new Date(exp.date).toLocaleDateString("pt-PT")}</td>
                            <td style={{ color: exp.description ? "var(--text)" : "var(--text-muted)" }}>
                              {exp.description || "—"}
                            </td>
                            <td style={{ color: exp.receipt_no ? "var(--text)" : "var(--text-muted)", fontFamily: "monospace", fontSize: "0.9rem" }}>
                              {exp.receipt_no || "—"}
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "#dc2626" }}>
                              {exp.cost.toFixed(2)} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {/* Total row */}
                    <div style={{
                      display: "flex", justifyContent: "flex-end", alignItems: "center",
                      padding: "12px 24px", borderTop: "2px solid var(--border)",
                      gap: "12px"
                    }}>
                      <span style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.85rem" }}>TOTAL</span>
                      <span style={{ fontWeight: 900, fontSize: "1.1rem", color: "#dc2626" }}>
                        {monthData.totalExpenses.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          fetchExpenses();
          if (activeTab === "analytics") fetchAnalytics();
          if (activeTab === "monthly") fetchMonthData(monthYear.year, monthYear.month);
        }}
      />
      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Eliminar Despesa"
        message="Tem a certeza que deseja eliminar esta despesa? Esta ação não pode ser revertida."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
}
