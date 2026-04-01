import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDownUp,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_KEY = "dvd_admin_logged_in";
const STATUSES = ["New", "In Progress", "Ready", "Delivered"];
const PAYMENT_METHODS = [
  "Cash",
  "Zelle",
  "Apple Pay",
  "Venmo",
  "Card",
  "Other",
];

interface CartItem {
  shirtType: string;
  shirtColor: string;
  vinylColor: string;
  sizes: Array<[string, bigint]>;
  category: string;
}

interface Order {
  id: bigint;
  status: string;
  name: string;
  email: string;
  phone: string;
  cartItems: CartItem[];
  notes: string;
  submittedAt: bigint;
}

interface LogoRequest {
  id: bigint;
  name: string;
  email: string;
  phone: string;
  description: string;
  imageUrl: string;
  status: string;
  submittedAt: bigint;
}

interface OrderFinancials {
  totalPaid: bigint;
  depositPaid: bigint;
  paymentMethod: string;
  dateDelivered: bigint;
  costPerShirt: bigint;
  pricePerShirt: bigint;
  designNotes: string;
}

interface FinancialsForm {
  pricePerShirt: string;
  totalPaid: string;
  depositPaid: string;
  costPerShirt: string;
  paymentMethod: string;
  dateDelivered: string;
  designNotes: string;
}

type SortField = "date" | "name" | "phone" | "totalPaid";
type SortDir = "asc" | "desc";

function statusColor(s: string): React.CSSProperties {
  if (s === "New")
    return {
      backgroundColor: "#EEF2FF",
      color: "#3B5BDB",
      border: "1px solid #3B5BDB",
    };
  if (s === "In Progress")
    return {
      backgroundColor: "#FFF5EE",
      color: "#E56020",
      border: "1px solid #E56020",
    };
  if (s === "Ready")
    return {
      backgroundColor: "#F0FFF4",
      color: "#22863a",
      border: "1px solid #22863a",
    };
  if (s === "Delivered")
    return {
      backgroundColor: "#F3F4F6",
      color: "#6B7280",
      border: "1px solid #9CA3AF",
    };
  return {};
}

function formatDate(ns: bigint) {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseCartNotes(notes: string): string {
  if (notes.includes("\n\nNotes:")) {
    return notes.split("\n\nNotes:")[1]?.trim() ?? "";
  }
  return notes.startsWith("Item") ? "" : notes;
}

function getTotalShirts(order: Order): number {
  return order.cartItems.reduce((sum, ci) => {
    return sum + ci.sizes.reduce((s, [, q]) => s + Number(q), 0);
  }, 0);
}

function defaultFinancialsForm(): FinancialsForm {
  return {
    pricePerShirt: "",
    totalPaid: "",
    depositPaid: "",
    costPerShirt: "",
    paymentMethod: "Cash",
    dateDelivered: "",
    designNotes: "",
  };
}

function financialsToForm(f: OrderFinancials): FinancialsForm {
  let dateStr = "";
  if (f.dateDelivered > 0n) {
    const ms = Number(f.dateDelivered / 1_000_000n);
    const d = new Date(ms);
    dateStr = d.toISOString().slice(0, 10);
  }
  return {
    pricePerShirt: Number(f.pricePerShirt).toString(),
    totalPaid: Number(f.totalPaid).toString(),
    depositPaid: Number(f.depositPaid).toString(),
    costPerShirt: Number(f.costPerShirt).toString(),
    paymentMethod: f.paymentMethod || "Cash",
    dateDelivered: dateStr,
    designNotes: f.designNotes,
  };
}

function formToFinancials(form: FinancialsForm): OrderFinancials {
  const dateNs = form.dateDelivered
    ? BigInt(new Date(form.dateDelivered).getTime()) * 1_000_000n
    : 0n;
  return {
    pricePerShirt: BigInt(
      Math.round(Number.parseFloat(form.pricePerShirt) || 0),
    ),
    totalPaid: BigInt(Math.round(Number.parseFloat(form.totalPaid) || 0)),
    depositPaid: BigInt(Math.round(Number.parseFloat(form.depositPaid) || 0)),
    costPerShirt: BigInt(Math.round(Number.parseFloat(form.costPerShirt) || 0)),
    paymentMethod: form.paymentMethod,
    dateDelivered: dateNs,
    designNotes: form.designNotes,
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [activeTab, setActiveTab] = useState<"orders" | "logo" | "expenses">(
    "orders",
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [financialsMap, setFinancialsMap] = useState<
    Map<string, OrderFinancials>
  >(new Map());
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<bigint | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<bigint | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Per-order financials form state
  const [formsMap, setFormsMap] = useState<Map<string, FinancialsForm>>(
    new Map(),
  );
  const [savingFinancials, setSavingFinancials] = useState<Set<string>>(
    new Set(),
  );
  const [savedFinancials, setSavedFinancials] = useState<Set<string>>(
    new Set(),
  );

  const [logoRequests, setLogoRequests] = useState<LogoRequest[]>([]);
  const [logoLoading, setLogoLoading] = useState(true);
  const [updatingLogo, setUpdatingLogo] = useState<bigint | null>(null);
  const [expandedLogos, setExpandedLogos] = useState<Set<string>>(new Set());

  // Expenses
  const [expenses, setExpenses] = useState<
    Array<{
      id: bigint;
      date: bigint;
      category: string;
      description: string;
      amount: bigint;
      vendor: string;
      createdAt: bigint;
    }>
  >([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Shirts/Blanks",
    description: "",
    amount: "",
    vendor: "",
  });
  const [addingExpense, setAddingExpense] = useState(false);
  const [expenseFilterCategory, setExpenseFilterCategory] = useState("All");
  const [expenseFilterFrom, setExpenseFilterFrom] = useState("");
  const [expenseFilterTo, setExpenseFilterTo] = useState("");
  const [expenseSearch, setExpenseSearch] = useState("");

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPayment, setFilterPayment] = useState("All");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Sort
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) !== "true") {
      navigate({ to: "/admin", replace: true });
    }
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    if (!actor) return;
    setOrdersLoading(true);
    try {
      const [data, financialsData] = await Promise.all([
        actor.getOrders(),
        (actor as any).getAllOrderFinancials(),
      ]);
      setOrders(
        [...data]
          .map((o) => (o.status === "Pending" ? { ...o, status: "New" } : o))
          .sort((a, b) => Number(b.submittedAt - a.submittedAt)),
      );
      const map = new Map<string, OrderFinancials>();
      for (const [id, f] of financialsData) {
        map.set(id.toString(), f);
      }
      setFinancialsMap(map);
      // Initialize forms from loaded financials
      const fMap = new Map<string, FinancialsForm>();
      for (const [id, f] of financialsData) {
        fMap.set(id.toString(), financialsToForm(f));
      }
      setFormsMap(fMap);
      setOrdersError(null);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setOrdersError(
        err instanceof Error
          ? err.message
          : "Failed to load orders. Please refresh.",
      );
    } finally {
      setOrdersLoading(false);
    }
  }, [actor]);

  const fetchLogoRequests = useCallback(async () => {
    if (!actor) return;
    setLogoLoading(true);
    try {
      const data = await actor.getLogoRequests();
      setLogoRequests(
        [...data]
          .map((o) => (o.status === "Pending" ? { ...o, status: "New" } : o))
          .sort((a, b) => Number(b.submittedAt - a.submittedAt)),
      );
    } catch (err) {
      console.error("Failed to fetch logo requests:", err);
    } finally {
      setLogoLoading(false);
    }
  }, [actor]);

  const fetchExpenses = useCallback(async () => {
    if (!actor) return;
    setExpensesLoading(true);
    try {
      const data = await (actor as any).getExpenses();
      setExpenses([...data].sort((a, b) => Number(b.date - a.date)));
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    } finally {
      setExpensesLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      fetchOrders();
      fetchLogoRequests();
      fetchExpenses();
    }
  }, [actor, isFetching, fetchOrders, fetchLogoRequests, fetchExpenses]);

  // Auto-poll orders every 30 seconds
  useEffect(() => {
    if (!actor) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [actor, fetchOrders]);

  const logout = () => {
    localStorage.removeItem(ADMIN_KEY);
    navigate({ to: "/admin", replace: true });
  };

  const updateOrderStatus = async (id: bigint, status: string) => {
    if (!actor) return;
    setUpdatingOrder(id);
    try {
      await actor.updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleDeleteOrder = async (id: bigint) => {
    if (!actor) return;
    setDeletingOrder(id);
    try {
      await (actor as any).deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setDeletingOrder(null);
      setDeleteConfirm(null);
    }
  };

  const updateLogoStatus = async (id: bigint, status: string) => {
    if (!actor) return;
    setUpdatingLogo(id);
    try {
      await actor.updateLogoRequestStatus(id, status);
      setLogoRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } finally {
      setUpdatingLogo(null);
    }
  };

  const toggleOrder = (id: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // Init form if not yet
    if (!formsMap.has(id)) {
      setFormsMap((prev) => {
        const next = new Map(prev);
        const f = financialsMap.get(id);
        next.set(id, f ? financialsToForm(f) : defaultFinancialsForm());
        return next;
      });
    }
  };

  const toggleLogo = (id: string) => {
    setExpandedLogos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const refreshAll = () => {
    fetchOrders();
    fetchLogoRequests();
    fetchExpenses();
  };

  const getForm = (id: string): FinancialsForm =>
    formsMap.get(id) ?? defaultFinancialsForm();

  const setFormField = (
    id: string,
    field: keyof FinancialsForm,
    value: string,
  ) => {
    setFormsMap((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? defaultFinancialsForm();
      next.set(id, { ...current, [field]: value });
      return next;
    });
  };

  const saveFinancials = async (order: Order) => {
    if (!actor) return;
    const id = order.id.toString();
    const form = getForm(id);
    const totalShirts = getTotalShirts(order);

    // Auto-calc totalPaid if empty
    let totalPaidVal = form.totalPaid;
    if (!totalPaidVal && form.pricePerShirt) {
      totalPaidVal = (
        Number.parseFloat(form.pricePerShirt) * totalShirts
      ).toString();
    }
    const finalForm = { ...form, totalPaid: totalPaidVal };

    setSavingFinancials((prev) => new Set(prev).add(id));
    try {
      await (actor as any).updateOrderFinancials(
        order.id,
        formToFinancials(finalForm),
      );
      setFinancialsMap((prev) => {
        const next = new Map(prev);
        next.set(id, formToFinancials(finalForm));
        return next;
      });
      setSavedFinancials((prev) => new Set(prev).add(id));
      setTimeout(() => {
        setSavedFinancials((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    } finally {
      setSavingFinancials((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Filtered + sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (o) =>
          o.name.toLowerCase().includes(q) || o.phone.toLowerCase().includes(q),
      );
    }

    if (filterStatus !== "All") {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (filterPayment !== "All") {
      result = result.filter((o) => {
        const f = financialsMap.get(o.id.toString());
        return f?.paymentMethod === filterPayment;
      });
    }

    if (filterDateFrom) {
      const from = new Date(filterDateFrom).getTime();
      result = result.filter((o) => Number(o.submittedAt / 1_000_000n) >= from);
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo).getTime() + 86400000;
      result = result.filter((o) => Number(o.submittedAt / 1_000_000n) <= to);
    }

    result.sort((a, b) => {
      let av = 0;
      let bv = 0;
      let as = "";
      let bs = "";
      if (sortField === "date") {
        av = Number(a.submittedAt);
        bv = Number(b.submittedAt);
        return sortDir === "desc" ? bv - av : av - bv;
      }
      if (sortField === "name") {
        as = a.name.toLowerCase();
        bs = b.name.toLowerCase();
        return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
      }
      if (sortField === "phone") {
        as = a.phone.toLowerCase();
        bs = b.phone.toLowerCase();
        return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
      }
      if (sortField === "totalPaid") {
        const fa = financialsMap.get(a.id.toString());
        const fb = financialsMap.get(b.id.toString());
        av = fa ? Number(fa.totalPaid) : 0;
        bv = fb ? Number(fb.totalPaid) : 0;
        return sortDir === "desc" ? bv - av : av - bv;
      }
      return 0;
    });

    return result;
  }, [
    orders,
    financialsMap,
    searchText,
    filterStatus,
    filterPayment,
    filterDateFrom,
    filterDateTo,
    sortField,
    sortDir,
  ]);

  // Summary stats (based on filtered orders)
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalProfit = 0;
    for (const o of filteredOrders) {
      const f = financialsMap.get(o.id.toString());
      if (!f) continue;
      const totalShirts = getTotalShirts(o);
      totalRevenue += Number(f.totalPaid);
      const profit =
        (Number(f.pricePerShirt) - Number(f.costPerShirt)) * totalShirts;
      totalProfit += profit;
    }
    return {
      totalRevenue,
      totalProfit,
      taxSetAside: totalProfit * 0.25,
      count: filteredOrders.length,
    };
  }, [filteredOrders, financialsMap]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterStatus("All");
    setFilterPayment("All");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasFilters =
    searchText ||
    filterStatus !== "All" ||
    filterPayment !== "All" ||
    filterDateFrom ||
    filterDateTo;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F7F4EF" }}>
      <header style={{ backgroundColor: "#1D1160" }} className="shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-black uppercase text-white text-lg tracking-widest">
              Desert Valley Designs
            </h1>
            <p className="text-white/50 text-xs uppercase tracking-wider">
              Admin Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={refreshAll}
              className="text-white/70 hover:text-white transition-colors p-2"
              title="Refresh"
              data-ocid="admin.secondary_button"
            >
              <RefreshCw size={18} />
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 font-bold uppercase tracking-wider text-xs px-4 py-2 text-white hover:opacity-80 transition-opacity border border-white/30"
              style={{ borderRadius: "9999px" }}
              data-ocid="admin.delete_button"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Order status counts */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {["All", "New", "In Progress", "Ready", "Delivered"].map((label) => {
            const count =
              label === "All"
                ? orders.length
                : orders.filter((o) => o.status === label).length;
            return (
              <div
                key={label}
                className="bg-white rounded-xl p-5 shadow-card text-center"
              >
                <div
                  className="font-black text-3xl"
                  style={{ color: "#1D1160" }}
                >
                  {count}
                </div>
                <div
                  className="text-xs font-bold uppercase tracking-wider mt-1"
                  style={{
                    color:
                      label === "New"
                        ? "#3B5BDB"
                        : label === "In Progress"
                          ? "#E56020"
                          : label === "Ready"
                            ? "#22863a"
                            : label === "Delivered"
                              ? "#6B7280"
                              : "#1D1160",
                  }}
                >
                  {label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 mb-6 border-b-4 border-[#111]">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="font-black uppercase tracking-wider text-sm px-6 py-3 transition-colors"
            style={{
              backgroundColor:
                activeTab === "orders" ? "#FF5500" : "transparent",
              color: activeTab === "orders" ? "white" : "#1D1160",
            }}
            data-ocid="admin.tab"
          >
            Apparel Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logo")}
            className="font-black uppercase tracking-wider text-sm px-6 py-3 transition-colors"
            style={{
              backgroundColor: activeTab === "logo" ? "#FF5500" : "transparent",
              color: activeTab === "logo" ? "white" : "#1D1160",
            }}
            data-ocid="admin.tab"
          >
            Logo Requests ({logoRequests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className="font-black uppercase tracking-wider text-sm px-6 py-3 transition-colors"
            style={{
              backgroundColor:
                activeTab === "expenses" ? "#FF5500" : "transparent",
              color: activeTab === "expenses" ? "white" : "#1D1160",
            }}
            data-ocid="admin.tab"
          >
            Expenses ({expenses.length})
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div>
            {/* Financial Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div
                className="rounded-xl p-4 border-2"
                style={{ backgroundColor: "#1D1160", borderColor: "#1D1160" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign size={14} className="text-white/60" />
                  <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
                    Revenue
                  </span>
                </div>
                <div className="text-white font-black text-2xl">
                  ${stats.totalRevenue.toLocaleString()}
                </div>
              </div>
              <div
                className="rounded-xl p-4 border-2"
                style={{ backgroundColor: "#FF5500", borderColor: "#FF5500" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} className="text-white/70" />
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Profit
                  </span>
                </div>
                <div className="text-white font-black text-2xl">
                  ${stats.totalProfit.toLocaleString()}
                </div>
              </div>
              <div
                className="rounded-xl p-4 border-2"
                style={{ backgroundColor: "#E56020", borderColor: "#E56020" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Tax (25%)
                  </span>
                </div>
                <div className="text-white font-black text-2xl">
                  $
                  {stats.taxSetAside.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>
              <div
                className="rounded-xl p-4 border-2 bg-white"
                style={{ borderColor: "#1D1160" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#1D1160" }}
                  >
                    Orders
                  </span>
                </div>
                <div
                  className="font-black text-2xl"
                  style={{ color: "#1D1160" }}
                >
                  {stats.count}
                </div>
              </div>
            </div>

            {/* Search & Filters */}
            <div
              className="bg-white rounded-2xl p-5 mb-6 shadow-card"
              style={{ border: "2px solid #e5e7eb" }}
            >
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="relative flex-1">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#aaa" }}
                  />
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg font-medium outline-none"
                    style={{ borderColor: "#e5e7eb" }}
                    data-ocid="admin.search_input"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="text-sm border-2 rounded-lg px-3 py-2 font-bold uppercase tracking-wider outline-none"
                  style={{ borderColor: "#e5e7eb", color: "#1D1160" }}
                  data-ocid="admin.select"
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <select
                  value={filterPayment}
                  onChange={(e) => setFilterPayment(e.target.value)}
                  className="text-sm border-2 rounded-lg px-3 py-2 font-bold uppercase tracking-wider outline-none"
                  style={{ borderColor: "#e5e7eb", color: "#1D1160" }}
                  data-ocid="admin.select"
                >
                  <option value="All">All Payment</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="font-bold uppercase text-xs tracking-wider"
                    style={{ color: "#888" }}
                  >
                    From
                  </span>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="border-2 rounded-lg px-2 py-1.5 text-sm outline-none"
                    style={{ borderColor: "#e5e7eb" }}
                    data-ocid="admin.input"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="font-bold uppercase text-xs tracking-wider"
                    style={{ color: "#888" }}
                  >
                    To
                  </span>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="border-2 rounded-lg px-2 py-1.5 text-sm outline-none"
                    style={{ borderColor: "#e5e7eb" }}
                    data-ocid="admin.input"
                  />
                </div>

                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
                    data-ocid="admin.cancel_button"
                  >
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>

              {/* Sort Controls */}
              <div
                className="flex flex-wrap gap-2 mt-3 pt-3"
                style={{ borderTop: "1px solid #f3f4f6" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-wider self-center"
                  style={{ color: "#888" }}
                >
                  <ArrowDownUp size={12} className="inline mr-1" />
                  Sort:
                </span>
                {(["date", "name", "phone", "totalPaid"] as SortField[]).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleSort(f)}
                      className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border-2 transition-all"
                      style={{
                        borderColor: sortField === f ? "#FF5500" : "#e5e7eb",
                        backgroundColor: sortField === f ? "#FF5500" : "white",
                        color: sortField === f ? "white" : "#1D1160",
                      }}
                      data-ocid="admin.toggle"
                    >
                      {f === "date"
                        ? "Date"
                        : f === "name"
                          ? "Name"
                          : f === "phone"
                            ? "Phone"
                            : "Total Paid"}
                      {sortField === f ? (
                        sortDir === "desc" ? (
                          <ChevronDown size={11} />
                        ) : (
                          <ChevronUp size={11} />
                        )
                      ) : null}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div
                className="px-6 py-5 border-b"
                style={{ borderColor: "#e5e7eb" }}
              >
                <h2
                  className="font-black uppercase text-sm tracking-widest"
                  style={{ color: "#1D1160" }}
                >
                  {filteredOrders.length} Order
                  {filteredOrders.length !== 1 ? "s" : ""}
                  {hasFilters ? " (filtered)" : ""}
                </h2>
              </div>

              {ordersError && (
                <div
                  className="mb-4 p-4 border-2 border-red-500 bg-red-50 text-red-700 font-bold flex items-center gap-3"
                  data-ocid="admin.error_state"
                >
                  <span>⚠ {ordersError}</span>
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="ml-auto px-3 py-1 bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                    data-ocid="admin.secondary_button"
                  >
                    ↻ Retry
                  </button>
                </div>
              )}
              {ordersLoading ? (
                <div
                  className="flex items-center justify-center py-20"
                  data-ocid="admin.loading_state"
                >
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: "#E56020" }}
                  />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div
                  className="text-center py-20"
                  data-ocid="admin.empty_state"
                >
                  <p
                    className="font-bold uppercase tracking-wider text-sm"
                    style={{ color: "#1D1160", opacity: 0.4 }}
                  >
                    No orders found
                  </p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                  {filteredOrders.map((order, idx) => {
                    const idStr = order.id.toString();
                    const isExpanded = expandedOrders.has(idStr);
                    const notesText = parseCartNotes(order.notes);
                    const totalShirts = getTotalShirts(order);
                    const form = getForm(idStr);
                    const isSaving = savingFinancials.has(idStr);
                    const isSaved = savedFinancials.has(idStr);

                    // Calculated fields
                    const pricePerShirt =
                      Number.parseFloat(form.pricePerShirt) || 0;
                    const totalPaid =
                      Number.parseFloat(form.totalPaid) ||
                      pricePerShirt * totalShirts;
                    const depositPaid =
                      Number.parseFloat(form.depositPaid) || 0;
                    const costPerShirt =
                      Number.parseFloat(form.costPerShirt) || 0;
                    const balanceDue = totalPaid - depositPaid;
                    const totalCost = costPerShirt * totalShirts;
                    const profit = totalPaid - totalCost;
                    const taxSetAside = profit * 0.25;

                    return (
                      <motion.div
                        key={idStr}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        data-ocid={`admin.item.${idx + 1}`}
                      >
                        {/* Order Row Header */}
                        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-orange-50/20 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className="font-black text-sm shrink-0"
                              style={{ color: "#E56020" }}
                            >
                              #{idStr}
                            </span>
                            <div className="min-w-0">
                              <p
                                className="font-semibold text-sm truncate"
                                style={{ color: "#1B1545" }}
                              >
                                {order.name}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: "#888" }}
                              >
                                {order.email} · {order.phone}
                              </p>
                            </div>
                          </div>

                          <div className="hidden sm:block min-w-[120px]">
                            <p
                              className="text-xs font-semibold"
                              style={{ color: "#1B1545" }}
                            >
                              {totalShirts} shirt{totalShirts !== 1 ? "s" : ""}
                            </p>
                            <p className="text-xs" style={{ color: "#888" }}>
                              {order.cartItems
                                .map((ci) => ci.shirtType)
                                .join(", ")}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className="text-xs font-bold px-2 py-1"
                              style={{
                                ...statusColor(order.status),
                                borderRadius: "9999px",
                              }}
                            >
                              {order.status}
                            </span>
                            <span className="text-xs" style={{ color: "#888" }}>
                              {formatDate(order.submittedAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleOrder(idStr)}
                              className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border hover:opacity-80 transition-opacity"
                              style={{
                                borderColor: "#E56020",
                                color: "#E56020",
                                borderRadius: "9999px",
                              }}
                              data-ocid="admin.toggle"
                            >
                              {isExpanded ? "Hide" : "Details"}
                            </button>
                            {deletingOrder === order.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                                style={{ color: "#dc2626" }}
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirm(order.id)}
                                className="flex items-center justify-center px-2 py-1.5 border hover:opacity-80 transition-opacity"
                                style={{
                                  borderColor: "#dc2626",
                                  color: "#dc2626",
                                  borderRadius: "9999px",
                                }}
                                data-ocid="admin.delete_button"
                                title="Delete order"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}

                            {updatingOrder === order.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                                style={{ color: "#E56020" }}
                              />
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex items-center gap-1 font-bold uppercase tracking-wider text-xs px-3 py-1.5 border hover:opacity-80 transition-opacity"
                                    style={{
                                      borderColor: "#1D1160",
                                      color: "#1D1160",
                                      borderRadius: "9999px",
                                    }}
                                    data-ocid="admin.dropdown_menu"
                                  >
                                    Update <ChevronDown size={12} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {STATUSES.map((s) => (
                                    <DropdownMenuItem
                                      key={s}
                                      onClick={() =>
                                        updateOrderStatus(order.id, s)
                                      }
                                      className="font-semibold text-xs uppercase tracking-wider cursor-pointer"
                                      data-ocid="admin.select"
                                    >
                                      {s}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Section A: Order Details */}
                              <div
                                className="rounded-xl p-4"
                                style={{
                                  backgroundColor: "#F7F4EF",
                                  border: "2px solid #e5e7eb",
                                }}
                              >
                                <p
                                  className="font-black uppercase text-xs tracking-widest mb-3"
                                  style={{ color: "#1D1160" }}
                                >
                                  Order Details
                                </p>
                                <div className="space-y-2 mb-3">
                                  {order.cartItems.map((ci, i) => (
                                    <div
                                      key={`ci-${order.id.toString()}-${i}`}
                                      className="bg-white rounded-lg px-3 py-2 text-xs"
                                      style={{ color: "#555" }}
                                    >
                                      <span className="font-bold text-[#E56020]">
                                        {ci.shirtType}
                                      </span>
                                      {" · "}
                                      <span>Shirt: {ci.shirtColor}</span>
                                      {" · "}
                                      <span>Vinyl: {ci.vinylColor}</span>
                                      {" · "}
                                      <span>
                                        {ci.sizes
                                          .map(([s, q]) => `${s} × ${q}`)
                                          .join(", ")}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className="text-xs font-bold rounded px-2 py-1 inline-block mb-2"
                                  style={{
                                    backgroundColor: "#1D1160",
                                    color: "white",
                                  }}
                                >
                                  Total: {totalShirts} shirt
                                  {totalShirts !== 1 ? "s" : ""}
                                </div>
                                {notesText && (
                                  <div className="mt-2">
                                    <p
                                      className="font-bold uppercase text-xs tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Customer Notes
                                    </p>
                                    <p
                                      className="text-xs"
                                      style={{ color: "#555" }}
                                    >
                                      {notesText}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Section B: Financial Details */}
                              <div
                                className="rounded-xl p-4"
                                style={{
                                  backgroundColor: "#fff",
                                  border: "2px solid #FF5500",
                                }}
                              >
                                <p
                                  className="font-black uppercase text-xs tracking-widest mb-4"
                                  style={{ color: "#FF5500" }}
                                >
                                  Financial Details
                                </p>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Price/Shirt ($)
                                    </p>
                                    <input
                                      type="number"
                                      min="0"
                                      value={form.pricePerShirt}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "pricePerShirt",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="0"
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.input"
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Total Paid ($)
                                    </p>
                                    <input
                                      type="number"
                                      min="0"
                                      value={form.totalPaid}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "totalPaid",
                                          e.target.value,
                                        )
                                      }
                                      placeholder={
                                        pricePerShirt > 0
                                          ? (
                                              pricePerShirt * totalShirts
                                            ).toString()
                                          : "0"
                                      }
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.input"
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Deposit Paid ($)
                                    </p>
                                    <input
                                      type="number"
                                      min="0"
                                      value={form.depositPaid}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "depositPaid",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="0"
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.input"
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Balance Due
                                    </p>
                                    <div
                                      className="border-2 rounded-lg px-2 py-1.5 text-sm font-black"
                                      style={{
                                        borderColor:
                                          balanceDue > 0
                                            ? "#E56020"
                                            : "#22863a",
                                        backgroundColor:
                                          balanceDue > 0
                                            ? "#FFF5EE"
                                            : "#F0FFF4",
                                        color:
                                          balanceDue > 0
                                            ? "#E56020"
                                            : "#22863a",
                                      }}
                                    >
                                      ${balanceDue.toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Cost/Shirt ($)
                                    </p>
                                    <input
                                      type="number"
                                      min="0"
                                      value={form.costPerShirt}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "costPerShirt",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="0"
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.input"
                                    />
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Total Cost
                                    </p>
                                    <div
                                      className="border-2 rounded-lg px-2 py-1.5 text-sm font-bold"
                                      style={{
                                        borderColor: "#e5e7eb",
                                        backgroundColor: "#F7F4EF",
                                        color: "#555",
                                      }}
                                    >
                                      ${totalCost.toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Profit
                                    </p>
                                    <div
                                      className="border-2 rounded-lg px-2 py-1.5 text-sm font-black"
                                      style={{
                                        borderColor:
                                          profit >= 0 ? "#22863a" : "#dc2626",
                                        backgroundColor:
                                          profit >= 0 ? "#F0FFF4" : "#FEF2F2",
                                        color:
                                          profit >= 0 ? "#22863a" : "#dc2626",
                                      }}
                                    >
                                      ${profit.toFixed(2)}
                                    </div>
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Tax Set Aside (25%)
                                    </p>
                                    <div
                                      className="border-2 rounded-lg px-2 py-1.5 text-sm font-bold"
                                      style={{
                                        borderColor: "#e5e7eb",
                                        backgroundColor: "#F7F4EF",
                                        color: "#555",
                                      }}
                                    >
                                      ${taxSetAside.toFixed(2)}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Payment Method
                                    </p>
                                    <select
                                      value={form.paymentMethod}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "paymentMethod",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm font-semibold outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.select"
                                    >
                                      {PAYMENT_METHODS.map((m) => (
                                        <option key={m} value={m}>
                                          {m}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <p
                                      className="text-xs font-bold uppercase tracking-wider mb-1"
                                      style={{ color: "#888" }}
                                    >
                                      Date Delivered
                                    </p>
                                    <input
                                      type="date"
                                      value={form.dateDelivered}
                                      onChange={(e) =>
                                        setFormField(
                                          idStr,
                                          "dateDelivered",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full border-2 rounded-lg px-2 py-1.5 text-sm outline-none"
                                      style={{ borderColor: "#e5e7eb" }}
                                      data-ocid="admin.input"
                                    />
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <p
                                    className="text-xs font-bold uppercase tracking-wider mb-1"
                                    style={{ color: "#888" }}
                                  >
                                    Design / Logo Notes
                                  </p>
                                  <textarea
                                    value={form.designNotes}
                                    onChange={(e) =>
                                      setFormField(
                                        idStr,
                                        "designNotes",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Describe the design, logo, or special instructions..."
                                    rows={2}
                                    className="w-full border-2 rounded-lg px-2 py-1.5 text-sm resize-none outline-none"
                                    style={{ borderColor: "#e5e7eb" }}
                                    data-ocid="admin.textarea"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => saveFinancials(order)}
                                  disabled={isSaving}
                                  className="w-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm py-2.5 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: isSaved
                                      ? "#22863a"
                                      : "#FF5500",
                                    color: "white",
                                    opacity: isSaving ? 0.7 : 1,
                                  }}
                                  data-ocid="admin.save_button"
                                >
                                  {isSaving ? (
                                    <>
                                      <Loader2
                                        size={14}
                                        className="animate-spin"
                                      />{" "}
                                      Saving...
                                    </>
                                  ) : isSaved ? (
                                    "✓ Saved!"
                                  ) : (
                                    "Save Financials"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOGO REQUESTS TAB */}
        {activeTab === "logo" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div
              className="px-6 py-5 border-b"
              style={{ borderColor: "#e5e7eb" }}
            >
              <h2
                className="font-black uppercase text-sm tracking-widest"
                style={{ color: "#1D1160" }}
              >
                Logo Requests
              </h2>
            </div>

            {logoLoading || isFetching ? (
              <div
                className="flex items-center justify-center py-20"
                data-ocid="admin.loading_state"
              >
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: "#E56020" }}
                />
              </div>
            ) : logoRequests.length === 0 ? (
              <div className="text-center py-20" data-ocid="admin.empty_state">
                <p
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "#1D1160", opacity: 0.4 }}
                >
                  No logo requests yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                {logoRequests.map((req, idx) => {
                  const idStr = req.id.toString();
                  const isExpanded = expandedLogos.has(idStr);
                  return (
                    <motion.div
                      key={idStr}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      data-ocid="admin.row"
                    >
                      <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-orange-50/20 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span
                            className="font-black text-sm shrink-0"
                            style={{ color: "#E56020" }}
                          >
                            #{idStr}
                          </span>
                          <div className="min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: "#1B1545" }}
                            >
                              {req.name}
                            </p>
                            <p
                              className="text-xs truncate"
                              style={{ color: "#888" }}
                            >
                              {req.email} · {req.phone}
                            </p>
                          </div>
                        </div>

                        <div className="hidden sm:block flex-1 min-w-0">
                          <p
                            className="text-xs truncate"
                            style={{ color: "#555", maxWidth: "280px" }}
                          >
                            {req.description.length > 80
                              ? `${req.description.slice(0, 80)}…`
                              : req.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className="text-xs font-bold px-2 py-1"
                            style={{
                              ...statusColor(req.status),
                              borderRadius: "9999px",
                            }}
                          >
                            {req.status}
                          </span>
                          <span className="text-xs" style={{ color: "#888" }}>
                            {formatDate(req.submittedAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleLogo(idStr)}
                            className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 border hover:opacity-80 transition-opacity"
                            style={{
                              borderColor: "#E56020",
                              color: "#E56020",
                              borderRadius: "9999px",
                            }}
                            data-ocid="admin.toggle"
                          >
                            {isExpanded ? "Hide" : "View"}
                          </button>
                          {updatingLogo === req.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                              style={{ color: "#E56020" }}
                            />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="flex items-center gap-1 font-bold uppercase tracking-wider text-xs px-3 py-1.5 border hover:opacity-80 transition-opacity"
                                  style={{
                                    borderColor: "#1D1160",
                                    color: "#1D1160",
                                    borderRadius: "9999px",
                                  }}
                                  data-ocid="admin.dropdown_menu"
                                >
                                  Update <ChevronDown size={12} />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {STATUSES.map((s) => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => updateLogoStatus(req.id, s)}
                                    className="font-semibold text-xs uppercase tracking-wider cursor-pointer"
                                    data-ocid="admin.select"
                                  >
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-4">
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <p
                              className="font-black uppercase text-xs tracking-widest mb-2"
                              style={{ color: "#1D1160" }}
                            >
                              Full Description
                            </p>
                            <p
                              className="text-sm mb-4"
                              style={{ color: "#333" }}
                            >
                              {req.description}
                            </p>
                            {req.imageUrl && (
                              <div>
                                <p
                                  className="font-black uppercase text-xs tracking-widest mb-2"
                                  style={{ color: "#1D1160" }}
                                >
                                  Reference Image
                                </p>
                                <img
                                  src={req.imageUrl}
                                  alt="Reference"
                                  style={{ maxHeight: "192px" }}
                                  className="border-4 border-[#111] object-contain"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <div>
            {/* Add Expense Form */}
            <div className="bg-white rounded-2xl shadow-card border-2 border-[#e5e7eb] p-6 mb-6">
              <h2
                className="font-black uppercase text-sm tracking-widest mb-4"
                style={{ color: "#1D1160" }}
              >
                Log an Expense
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label
                    htmlFor="exp-date"
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#1D1160" }}
                  >
                    Date
                  </label>
                  <input
                    id="exp-date"
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) =>
                      setExpenseForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ fontSize: "16px" }}
                    data-ocid="expense.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-category"
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#1D1160" }}
                  >
                    Category
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ fontSize: "16px" }}
                    data-ocid="expense.select"
                  >
                    {[
                      "Shirts/Blanks",
                      "Vinyl & Materials",
                      "Equipment",
                      "Supplies",
                      "Marketing",
                      "Website",
                      "Mileage",
                      "Phone",
                      "Labor/Time",
                      "Other",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="exp-amount"
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#1D1160" }}
                  >
                    Amount ($)
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm((f) => ({ ...f, amount: e.target.value }))
                    }
                    className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ fontSize: "16px" }}
                    data-ocid="expense.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-desc"
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#1D1160" }}
                  >
                    Description
                  </label>
                  <input
                    id="exp-desc"
                    type="text"
                    placeholder="e.g. 50 blank construction shirts"
                    value={expenseForm.description}
                    onChange={(e) =>
                      setExpenseForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ fontSize: "16px" }}
                    data-ocid="expense.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="exp-vendor"
                    className="block text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#1D1160" }}
                  >
                    Vendor / Store
                  </label>
                  <input
                    id="exp-vendor"
                    type="text"
                    placeholder="e.g. Hobby Lobby"
                    value={expenseForm.vendor}
                    onChange={(e) =>
                      setExpenseForm((f) => ({ ...f, vendor: e.target.value }))
                    }
                    className="w-full border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                    style={{ fontSize: "16px" }}
                    data-ocid="expense.input"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    disabled={
                      addingExpense ||
                      !expenseForm.amount ||
                      !expenseForm.description
                    }
                    onClick={async () => {
                      if (
                        !actor ||
                        !expenseForm.amount ||
                        !expenseForm.description
                      )
                        return;
                      setAddingExpense(true);
                      try {
                        const dateNs =
                          BigInt(new Date(expenseForm.date).getTime()) *
                          1_000_000n;
                        const amountCents = BigInt(
                          Math.round(
                            Number.parseFloat(expenseForm.amount) * 100,
                          ),
                        );
                        await (actor as any).addExpense({
                          date: dateNs,
                          category: expenseForm.category,
                          description: expenseForm.description,
                          amount: amountCents,
                          vendor: expenseForm.vendor,
                        });
                        await fetchExpenses();
                        setExpenseForm({
                          date: new Date().toISOString().split("T")[0],
                          category: "Shirts/Blanks",
                          description: "",
                          amount: "",
                          vendor: "",
                        });
                      } finally {
                        setAddingExpense(false);
                      }
                    }}
                    className="w-full font-black uppercase tracking-wider text-sm px-6 py-2.5 text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: "#FF5500", borderRadius: "8px" }}
                    data-ocid="expense.submit_button"
                  >
                    {addingExpense ? "Adding..." : "+ Add Expense"}
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-card border-2 border-[#e5e7eb] p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Search description or vendor..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ fontSize: "16px" }}
                  data-ocid="expense.search_input"
                />
                <select
                  value={expenseFilterCategory}
                  onChange={(e) => setExpenseFilterCategory(e.target.value)}
                  className="border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ fontSize: "16px" }}
                  data-ocid="expense.select"
                >
                  <option value="All">All Categories</option>
                  {[
                    "Shirts/Blanks",
                    "Vinyl & Materials",
                    "Equipment",
                    "Supplies",
                    "Marketing",
                    "Website",
                    "Mileage",
                    "Phone",
                    "Labor/Time",
                    "Other",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={expenseFilterFrom}
                  onChange={(e) => setExpenseFilterFrom(e.target.value)}
                  className="border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ fontSize: "16px" }}
                  placeholder="From date"
                  data-ocid="expense.input"
                />
                <input
                  type="date"
                  value={expenseFilterTo}
                  onChange={(e) => setExpenseFilterTo(e.target.value)}
                  className="border-2 border-[#e5e7eb] rounded-lg px-3 py-2 text-sm font-semibold"
                  style={{ fontSize: "16px" }}
                  placeholder="To date"
                  data-ocid="expense.input"
                />
              </div>
            </div>

            {/* Expense List */}
            {(() => {
              const filtered = expenses.filter((e) => {
                if (
                  expenseFilterCategory !== "All" &&
                  e.category !== expenseFilterCategory
                )
                  return false;
                if (expenseSearch) {
                  const q = expenseSearch.toLowerCase();
                  if (
                    !e.description.toLowerCase().includes(q) &&
                    !e.vendor.toLowerCase().includes(q)
                  )
                    return false;
                }
                const dateMs = Number(e.date / 1_000_000n);
                if (
                  expenseFilterFrom &&
                  dateMs < new Date(expenseFilterFrom).getTime()
                )
                  return false;
                if (
                  expenseFilterTo &&
                  dateMs > new Date(expenseFilterTo).getTime() + 86400000
                )
                  return false;
                return true;
              });
              const totalFiltered = filtered.reduce(
                (sum, e) => sum + Number(e.amount) / 100,
                0,
              );
              const byCategory: Record<string, number> = {};
              for (const e of filtered) {
                byCategory[e.category] =
                  (byCategory[e.category] || 0) + Number(e.amount) / 100;
              }

              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div
                      className="rounded-xl p-4 border-2"
                      style={{
                        backgroundColor: "#1D1160",
                        borderColor: "#1D1160",
                      }}
                    >
                      <div className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
                        Total Expenses
                      </div>
                      <div className="font-black text-2xl text-white">
                        ${totalFiltered.toFixed(2)}
                      </div>
                      <div className="text-white/50 text-xs mt-1">
                        {filtered.length} records
                      </div>
                    </div>
                    {Object.entries(byCategory)
                      .sort((a, b) => b[1] - a[1])
                      .map(([cat, total]) => (
                        <div
                          key={cat}
                          className="bg-white rounded-xl p-4 border-2 border-[#e5e7eb]"
                        >
                          <div
                            className="text-xs font-bold uppercase tracking-wider mb-1"
                            style={{ color: "#E56020" }}
                          >
                            {cat}
                          </div>
                          <div
                            className="font-black text-xl"
                            style={{ color: "#1D1160" }}
                          >
                            ${total.toFixed(2)}
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* List */}
                  <div className="bg-white rounded-2xl shadow-card border-2 border-[#e5e7eb] overflow-hidden mb-6">
                    <div className="px-6 py-4 border-b border-[#e5e7eb]">
                      <h3
                        className="font-black uppercase text-sm tracking-widest"
                        style={{ color: "#1D1160" }}
                      >
                        Expense Records
                      </h3>
                    </div>
                    {expensesLoading || isFetching ? (
                      <div
                        className="flex items-center justify-center py-16"
                        data-ocid="expense.loading_state"
                      >
                        <Loader2
                          size={28}
                          className="animate-spin"
                          style={{ color: "#E56020" }}
                        />
                      </div>
                    ) : filtered.length === 0 ? (
                      <div
                        className="text-center py-16"
                        data-ocid="expense.empty_state"
                      >
                        <p
                          className="font-bold uppercase tracking-wider text-sm"
                          style={{ color: "#1D1160", opacity: 0.4 }}
                        >
                          No expenses recorded yet
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#f3f4f6]">
                        {filtered.map((expense, idx) => (
                          <motion.div
                            key={expense.id.toString()}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className="px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-orange-50/20 transition-colors"
                            data-ocid={`expense.item.${idx + 1}`}
                          >
                            <div
                              className="shrink-0 text-xs font-bold"
                              style={{ color: "#888", minWidth: "90px" }}
                            >
                              {new Date(
                                Number(expense.date / 1_000_000n),
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="shrink-0">
                              <span
                                className="text-xs font-bold px-2 py-1 rounded-full"
                                style={{
                                  backgroundColor: "#FFF5EE",
                                  color: "#E56020",
                                  border: "1px solid #E56020",
                                }}
                              >
                                {expense.category}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-semibold text-sm"
                                style={{ color: "#1B1545" }}
                              >
                                {expense.description}
                              </p>
                              {expense.vendor && (
                                <p
                                  className="text-xs"
                                  style={{ color: "#888" }}
                                >
                                  {expense.vendor}
                                </p>
                              )}
                            </div>
                            <div
                              className="shrink-0 font-black text-lg"
                              style={{ color: "#1D1160" }}
                            >
                              ${(Number(expense.amount) / 100).toFixed(2)}
                            </div>
                          </motion.div>
                        ))}
                        <div
                          className="px-6 py-4 flex justify-between items-center"
                          style={{ backgroundColor: "#F7F4EF" }}
                        >
                          <span
                            className="font-black uppercase text-sm tracking-widest"
                            style={{ color: "#1D1160" }}
                          >
                            Total
                          </span>
                          <span
                            className="font-black text-xl"
                            style={{ color: "#FF5500" }}
                          >
                            ${totalFiltered.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tax Summary */}
                  {(() => {
                    let totalRevenue = 0;
                    let totalOrderCosts = 0;
                    for (const o of orders) {
                      const f = financialsMap.get(o.id.toString());
                      if (!f) continue;
                      const totalShirts = getTotalShirts(o);
                      totalRevenue += Number(f.totalPaid);
                      totalOrderCosts += Number(f.costPerShirt) * totalShirts;
                    }
                    const totalExpenses = expenses.reduce(
                      (sum, e) => sum + Number(e.amount) / 100,
                      0,
                    );
                    const netProfit =
                      totalRevenue - totalOrderCosts - totalExpenses;
                    const estimatedTax = Math.max(0, netProfit * 0.25);
                    return (
                      <div className="bg-white rounded-2xl shadow-card border-2 border-[#e5e7eb] p-6">
                        <h3
                          className="font-black uppercase text-sm tracking-widest mb-4"
                          style={{ color: "#1D1160" }}
                        >
                          Tax Summary (All Time)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <div
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: "#888" }}
                            >
                              Total Revenue
                            </div>
                            <div
                              className="font-black text-xl"
                              style={{ color: "#1D1160" }}
                            >
                              ${totalRevenue.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <div
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: "#888" }}
                            >
                              Order Costs
                            </div>
                            <div
                              className="font-black text-xl"
                              style={{ color: "#E56020" }}
                            >
                              -${totalOrderCosts.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <div
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: "#888" }}
                            >
                              Expenses
                            </div>
                            <div
                              className="font-black text-xl"
                              style={{ color: "#E56020" }}
                            >
                              -${totalExpenses.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <div
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: "#888" }}
                            >
                              Net Profit
                            </div>
                            <div
                              className="font-black text-xl"
                              style={{
                                color: netProfit >= 0 ? "#22863a" : "#c0392b",
                              }}
                            >
                              ${netProfit.toFixed(2)}
                            </div>
                          </div>
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#1D1160" }}
                          >
                            <div className="text-xs font-bold uppercase tracking-wider mb-1 text-white/60">
                              Est. Tax (25%)
                            </div>
                            <div className="font-black text-xl text-white">
                              ${estimatedTax.toFixed(2)}
                            </div>
                            <div className="text-white/60 text-xs mt-1">
                              Set aside ~${estimatedTax.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        )}
        {/* Delete Confirmation Dialog */}
        {deleteConfirm !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            data-ocid="admin.dialog"
          >
            <div
              className="rounded-2xl p-8 max-w-sm w-full mx-4 border-4"
              style={{ backgroundColor: "#fff", borderColor: "#dc2626" }}
            >
              <h2
                className="font-black text-2xl uppercase tracking-wider mb-3"
                style={{
                  color: "#dc2626",
                  fontFamily: "Bebas Neue, sans-serif",
                }}
              >
                Delete Order?
              </h2>
              <p
                className="text-sm font-semibold mb-6"
                style={{ color: "#444" }}
              >
                This order will be permanently deleted and cannot be recovered.
                Are you sure?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 font-bold uppercase tracking-wider text-sm px-4 py-2.5 border-2 hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: "#888",
                    color: "#444",
                    borderRadius: "9999px",
                  }}
                  data-ocid="admin.cancel_button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOrder(deleteConfirm)}
                  disabled={deletingOrder !== null}
                  className="flex-1 font-bold uppercase tracking-wider text-sm px-4 py-2.5 border-2 hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "#dc2626",
                    borderColor: "#dc2626",
                    color: "#fff",
                    borderRadius: "9999px",
                  }}
                  data-ocid="admin.confirm_button"
                >
                  {deletingOrder !== null ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : null}
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
