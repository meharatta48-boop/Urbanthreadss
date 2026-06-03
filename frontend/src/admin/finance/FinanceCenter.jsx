import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  FiDollarSign, FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown,
  FiFileText, FiPieChart, FiPercent, FiCalendar, FiArrowRight
} from "react-icons/fi";

export default function FinanceCenter() {
  const [activeTab, setActiveTab] = useState("profit");
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Expense Form State
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "misc",
    date: new Date().toISOString().slice(0, 10),
    notes: ""
  });

  const loadExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      if (res.data.success) {
        setExpenses(res.data.expenses || []);
      }
    } catch {
      toast.error("Failed to load expenses");
    }
  };

  const loadProfitAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stats/profit-analytics");
      if (res.data.success) {
        setAnalytics(res.data.data || null);
      }
    } catch {
      toast.error("Failed to load profit analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "profit") {
      loadProfitAnalytics();
    }
    if (activeTab === "expenses") {
      loadExpenses();
    }
  }, [activeTab]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) {
      return toast.warning("Please fill all required fields");
    }
    setSaving(true);
    try {
      const res = await api.post("/expenses", form);
      if (res.data.success) {
        toast.success("Expense logged successfully!");
        setForm({
          title: "",
          amount: "",
          category: "misc",
          date: new Date().toISOString().slice(0, 10),
          notes: ""
        });
        loadExpenses();
      }
    } catch {
      toast.error("Failed to log expense");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense record?")) return;
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        toast.success("Expense deleted");
        loadExpenses();
      }
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  // Dynamic calculations based on analytics + expenses
  const expenseTotal = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const revenue = analytics?.totalRevenue || 0;
  const netProfit = (analytics?.totalProfit || 0) - expenseTotal;
  const marginPct = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-linear-to-r from-amber-950/20 to-slate-900/10 border border-amber-900/20 p-6 rounded-2xl">
        <p className="text-[10px] font-bold tracking-wider text-amber-400 uppercase mb-0.5">Finance Ledger</p>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-(--text-primary)">Finance Center</h2>
        <p className="text-(--text-muted) text-xs mt-1">Audit profit margins, track marketing/inventory expenses, and review automated tax reports.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 border-b border-(--border)">
        {[
          { id: "profit", label: "Profit & Loss", icon: <FiPieChart /> },
          { id: "expenses", label: "Expense Tracker", icon: <FiDollarSign /> },
          { id: "tax", label: "Tax Reports", icon: <FiPercent /> }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === t.id
                ? "border-(--gold) text-(--gold) bg-(--gold)/5"
                : "border-transparent text-(--text-muted) hover:text-(--text-primary)"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-(--bg-card) border border-(--border) p-6 rounded-2xl"
        >
          {/* TAB 1: P&L Summary */}
          {activeTab === "profit" && (
            <div className="space-y-6">
              {loading ? (
                <div className="p-12 text-center text-xs text-(--text-muted)">Generating profit ledger...</div>
              ) : (
                <>
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">Gross Revenue</span>
                        <FiTrendingUp className="text-[#4ade80]" />
                      </div>
                      <p className="text-xl font-bold font-mono text-(--text-primary) mt-3">Rs. {revenue.toLocaleString()}</p>
                      <p className="text-[9px] text-(--text-muted) mt-1">Delivered orders only</p>
                    </div>

                    <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">Total Expenses</span>
                        <FiTrendingDown className="text-red-400" />
                      </div>
                      <p className="text-xl font-bold font-mono text-(--text-primary) mt-3">Rs. {(analytics?.totalCost || 0).toLocaleString()}</p>
                      <p className="text-[9px] text-(--text-muted) mt-1">Manufacturing costs, shipping cost, etc.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-wider text-(--text-muted) uppercase">Net Margin</span>
                        <span className="text-xs text-(--gold) font-bold">{marginPct}%</span>
                      </div>
                      <p className="text-xl font-bold font-mono text-(--gold) mt-3">Rs. {netProfit.toLocaleString()}</p>
                      <p className="text-[9px] text-(--text-muted) mt-1">Net profit after inventory and coupon cost</p>
                    </div>
                  </div>

                  {/* Goal Progress */}
                  {analytics?.goalStatus && (
                    <div className="bg-(--bg-elevated)/40 border border-(--border) p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                        <span className="font-bold text-(--text-primary)">Business Goal: {analytics.goalStatus.title}</span>
                        <span className="text-(--gold) font-mono font-bold">{analytics.goalStatus.progressPct}% achieved</span>
                      </div>
                      <div className="w-full h-2 bg-(--bg-deep) rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-(--gold) to-(--gold-light)" style={{ width: `${analytics.goalStatus.progressPct}%` }} />
                      </div>
                      <p className="text-[10px] text-(--text-muted)">
                        Target: Rs. {analytics.goalStatus.targetProfit.toLocaleString()} | Achieved: Rs. {analytics.goalStatus.achievedProfit.toLocaleString()} | Days remaining: {analytics.goalStatus.remainingDays}
                      </p>
                    </div>
                  )}

                  {/* Monthly Trend List */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Delivered orders monthly summary</h4>
                    {analytics?.last6Months?.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-(--bg-elevated) border border-(--border) flex justify-between items-center text-xs">
                        <span className="font-bold text-(--text-primary)">{m.month}</span>
                        <div className="flex gap-4 font-mono">
                          <span className="text-(--text-muted)">Revenue: Rs. {m.revenue.toLocaleString()}</span>
                          <span className="text-(--gold) font-bold">Profit: Rs. {m.profit.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 2: Expense Log */}
          {activeTab === "expenses" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <form onSubmit={handleCreateExpense} className="lg:col-span-1 space-y-4 bg-(--bg-elevated)/30 p-4 rounded-xl border border-(--border)/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary) border-b border-(--border)/50 pb-2">Log Expense</h4>
                  
                  <div>
                    <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Expense Title *</label>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Facebook Ads campaign"
                      className="lux-input w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Amount (Rs) *</label>
                      <input
                        required
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder="15000"
                        className="lux-input w-full"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="lux-input w-full"
                      >
                        <option value="ads">Ads / Marketing</option>
                        <option value="inventory">Inventory</option>
                        <option value="shipping">Shipping</option>
                        <option value="tax">Tax</option>
                        <option value="salary">Salary</option>
                        <option value="misc">Miscellaneous</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Date *</label>
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="lux-input w-full"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-(--text-muted) uppercase font-bold block mb-1">Notes</label>
                    <textarea
                      rows={2}
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Optional notes"
                      className="lux-input w-full"
                    />
                  </div>

                  <button type="submit" disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                    <FiPlus /> {saving ? "Logging..." : "Log Expense"}
                  </button>
                </form>

                {/* List */}
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-(--text-primary)">Expense ledger</h4>
                    <span className="text-xs text-red-400 font-bold font-mono">Total Overhead: Rs. {expenseTotal.toLocaleString()}</span>
                  </div>
                  {expenses.length === 0 ? (
                    <div className="p-12 text-center text-xs text-(--text-muted) border border-dashed border-(--border) rounded-xl">No overhead expenses logged.</div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {expenses.map((e) => (
                        <div key={e._id} className="p-3.5 rounded-xl bg-(--bg-elevated) border border-(--border) flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-(--text-primary)">{e.title}</p>
                            <p className="text-[10px] text-(--text-muted) mt-0.5">
                              <span className="capitalize text-(--gold) font-semibold">{e.category}</span> · {new Date(e.date).toLocaleDateString()}
                            </p>
                            {e.notes && <p className="text-[10px] text-(--text-muted) italic mt-1 font-light">"{e.notes}"</p>}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-(--text-primary)">Rs. {e.amount.toLocaleString()}</span>
                            <button onClick={() => handleDeleteExpense(e._id)} className="text-red-400 hover:text-red-300">
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Tax Reports */}
          {activeTab === "tax" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-(--text-primary)">Automated Sales Tax Estimate (Pakistan)</h4>
                <p className="text-xs text-(--text-muted) mt-0.5">Estimated calculations based on standard FBR retail sales tax (estimated at 17%).</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-(--bg-elevated) border border-(--border) space-y-3">
                  <h5 className="text-xs font-bold text-(--text-primary)">Quarterly Estimate</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-(--text-muted)">Total Sales Billing:</span>
                      <span className="font-mono text-(--text-primary)">Rs. {revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b border-(--border)/40 pb-2">
                      <span className="text-(--text-muted)">Estimated Shipping Service (not taxed):</span>
                      <span className="font-mono text-(--text-primary)">Rs. {((analytics?.last6Months?.reduce((s, m) => s + m.orders, 0) || 0) * 250).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-(--gold) pt-2">
                      <span>FBR Estimated Sales Tax Due (17%):</span>
                      <span className="font-mono">Rs. {Math.round(revenue * 0.17).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-yellow-950/10 border border-yellow-700/20 text-xs text-yellow-400 space-y-2 flex flex-col justify-center">
                  <p className="font-bold flex items-center gap-1.5"><FiCalendar /> Tax compliance recommendation:</p>
                  <p className="leading-relaxed font-light">
                    Ensure all your product sales invoicing reports are exported regularly. Expenses logged under the "Tax" category are deductible from final profit estimations. Consult your corporate CPA for tax filing inside Pakistan.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
