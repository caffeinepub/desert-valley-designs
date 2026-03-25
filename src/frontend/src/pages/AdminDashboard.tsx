import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Loader2, LogOut, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_KEY = "dvd_admin_logged_in";
const STATUSES = ["Pending", "Reviewed", "Completed"];

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

function statusColor(s: string): React.CSSProperties {
  if (s === "Pending")
    return {
      backgroundColor: "#FFF5EE",
      color: "#E56020",
      border: "1px solid #E56020",
    };
  if (s === "Reviewed")
    return {
      backgroundColor: "#EEF2FF",
      color: "#3B5BDB",
      border: "1px solid #3B5BDB",
    };
  if (s === "Completed")
    return {
      backgroundColor: "#F0FFF4",
      color: "#22863a",
      border: "1px solid #22863a",
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [activeTab, setActiveTab] = useState<"orders" | "logo">("orders");

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<bigint | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const [logoRequests, setLogoRequests] = useState<LogoRequest[]>([]);
  const [logoLoading, setLogoLoading] = useState(true);
  const [updatingLogo, setUpdatingLogo] = useState<bigint | null>(null);
  const [expandedLogos, setExpandedLogos] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) !== "true") {
      navigate({ to: "/admin", replace: true });
    }
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    if (!actor) return;
    setOrdersLoading(true);
    try {
      const data = (await (actor as any).getOrders()) as Order[];
      setOrders(
        [...data].sort((a, b) => Number(b.submittedAt - a.submittedAt)),
      );
    } finally {
      setOrdersLoading(false);
    }
  }, [actor]);

  const fetchLogoRequests = useCallback(async () => {
    if (!actor) return;
    setLogoLoading(true);
    try {
      const data = (await (actor as any).getLogoRequests()) as LogoRequest[];
      setLogoRequests(
        [...data].sort((a, b) => Number(b.submittedAt - a.submittedAt)),
      );
    } finally {
      setLogoLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      fetchOrders();
      fetchLogoRequests();
    }
  }, [actor, isFetching, fetchOrders, fetchLogoRequests]);

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

  const updateLogoStatus = async (id: bigint, status: string) => {
    if (!actor) return;
    setUpdatingLogo(id);
    try {
      await (actor as any).updateLogoRequestStatus(id, status);
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
  };

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
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {["All", "Pending", "Reviewed", "Completed"].map((label) => {
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
                      label === "Pending"
                        ? "#E56020"
                        : label === "Reviewed"
                          ? "#3B5BDB"
                          : label === "Completed"
                            ? "#22863a"
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
        </div>

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <div
              className="px-6 py-5 border-b"
              style={{ borderColor: "#e5e7eb" }}
            >
              <h2
                className="font-black uppercase text-sm tracking-widest"
                style={{ color: "#1D1160" }}
              >
                All Apparel Orders
              </h2>
            </div>

            {ordersLoading || isFetching ? (
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
            ) : orders.length === 0 ? (
              <div className="text-center py-20" data-ocid="admin.empty_state">
                <p
                  className="font-bold uppercase tracking-wider text-sm"
                  style={{ color: "#1D1160", opacity: 0.4 }}
                >
                  No orders yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                {orders.map((order, idx) => {
                  const idStr = order.id.toString();
                  const isExpanded = expandedOrders.has(idStr);
                  const notesText = parseCartNotes(order.notes);

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
                            {order.cartItems.length} item
                            {order.cartItems.length !== 1 ? "s" : ""}
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
                          {order.cartItems.length > 0 && (
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

                      {isExpanded && (
                        <div className="px-6 pb-4">
                          <div
                            className="rounded-xl p-4"
                            style={{ backgroundColor: "#F7F4EF" }}
                          >
                            <p
                              className="font-black uppercase text-xs tracking-widest mb-3"
                              style={{ color: "#1D1160" }}
                            >
                              Cart Items
                            </p>
                            <div className="space-y-2">
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
                                      .map(([s, q]) => `${s}×${q}`)
                                      .join(", ")}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {notesText && (
                              <div className="mt-3">
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
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
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
      </main>
    </div>
  );
}
