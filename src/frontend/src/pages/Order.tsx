import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Flame,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useActor } from "../hooks/useActor";

// ─── Constants ─────────────────────────────────────────────────────

type SleeveType = "Short Sleeve" | "Long Sleeve";
const SLEEVE_OPTIONS: SleeveType[] = ["Short Sleeve", "Long Sleeve"];

const SHIRT_COLORS = [
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#FFFFFF", border: true },
  { name: "Grey", hex: "#9CA3AF" },
  { name: "Navy", hex: "#003087" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Dark Green", hex: "#013220" },
  { name: "Safety Green", hex: "#4DB848" },
  { name: "Safety Orange", hex: "#FF6700" },
  { name: "Red", hex: "#CC0000" },
  { name: "Maroon", hex: "#800000" },
  { name: "Light Blue", hex: "#6CB4E4" },
  { name: "Orange", hex: "#FF5500" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Sand", hex: "#C2B280" },
];

const VINYL_COLORS = [
  { name: "Black", hex: "#1A1A1A" },
  { name: "White", hex: "#FFFFFF", border: true },
  { name: "Red", hex: "#CC0000" },
  { name: "Royal Blue", hex: "#1B4FDB" },
  { name: "Yellow", hex: "#F5C400" },
  { name: "Green", hex: "#228B22" },
  { name: "Orange", hex: "#FF5500" },
  { name: "Gray", hex: "#808080" },
  { name: "Gold", hex: "#FFD700" },
  { name: "Pink", hex: "#FF69B4" },
  { name: "Silver", hex: "#C0C0C0", border: true },
];

const KIDS_SIZES = ["Kids-XS", "Kids-S", "Kids-M", "Kids-L", "Kids-XL"];
const ADULT_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

interface ProductDef {
  id: string;
  name: string;
  description: string;
  category: "work" | "everyday";
  shirtType: string;
  hasSleeveOption?: boolean;
  pricing: {
    min: number;
    max: number;
    tiers: { label: string; price: number }[];
  };
}

const PRODUCTS: ProductDef[] = [
  {
    id: "construction-tee",
    name: "Construction T-Shirt",
    description:
      "Heavy-duty 100% cotton tee built for job-site conditions. Rugged, breathable, and ready for anything.",
    category: "work",
    shirtType: "Construction T-Shirt",
    hasSleeveOption: true,
    pricing: {
      min: 18,
      max: 25,
      tiers: [
        { label: "1–15 shirts", price: 25 },
        { label: "16–30 shirts", price: 22 },
        { label: "31–50 shirts", price: 20 },
        { label: "50+ shirts", price: 18 },
      ],
    },
  },
  {
    id: "polo",
    name: "Polo Shirt",
    description:
      "Professional piqué polo perfect for crews, uniforms, and client-facing staff. Sharp look on every job.",
    category: "work",
    shirtType: "Polo",
    pricing: {
      min: 28,
      max: 35,
      tiers: [
        { label: "1–15 polos", price: 35 },
        { label: "16–30 polos", price: 32 },
        { label: "31–50 polos", price: 30 },
        { label: "50+ polos", price: 28 },
      ],
    },
  },
  {
    id: "softstyle-tee",
    name: "Softstyle T-Shirt",
    description:
      "Ultra-soft ring-spun cotton for everyday wear and restaurant/service uniforms. Comfortable all day long.",
    category: "everyday",
    shirtType: "Softstyle T-Shirt",
    pricing: {
      min: 20,
      max: 28,
      tiers: [
        { label: "1–15 shirts", price: 28 },
        { label: "16–30 shirts", price: 25 },
        { label: "31–50 shirts", price: 22 },
        { label: "50+ shirts", price: 20 },
      ],
    },
  },
];

// ─── Types ────────────────────────────────────────────────────────────────

interface CartItem {
  id: string;
  shirtType: string;
  category: "work" | "everyday";
  shirtColor: string;
  vinylColor: string;
  sizes: Record<string, number>;
  sleeveType?: SleeveType;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

// ─── Pricing helpers ────────────────────────────────────────────────────────────────

function getPricePerUnit(shirtType: string, totalQty: number): number {
  const p = PRODUCTS.find((pr) => pr.shirtType === shirtType);
  if (!p) return 25;
  const tiers = p.pricing.tiers;
  if (totalQty >= 50) return tiers[3].price;
  if (totalQty >= 31) return tiers[2].price;
  if (totalQty >= 16) return tiers[1].price;
  return tiers[0].price;
}

function itemTotalQty(item: CartItem): number {
  return Object.values(item.sizes).reduce((s, q) => s + q, 0);
}

function itemSubtotal(item: CartItem): number {
  const qty = itemTotalQty(item);
  return qty * getPricePerUnit(item.shirtType, qty);
}

function cartTotal(cart: CartItem[]): number {
  return cart.reduce((s, item) => s + itemSubtotal(item), 0);
}

function cartUnitCount(cart: CartItem[]): number {
  return cart.reduce((s, item) => s + itemTotalQty(item), 0);
}

// ─── Subcomponents ────────────────────────────────────────────────────────────────

function SizeRow({
  label,
  sizes,
  values,
  onChange,
}: {
  label: string;
  sizes: string[];
  values: Record<string, number>;
  onChange: (size: string, qty: number) => void;
}) {
  return (
    <div className="mb-4">
      <p className="font-black uppercase text-xs tracking-widest mb-2 text-[#FF5500]">
        {label}
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {sizes.map((size) => {
          const qty = values[size] ?? 0;
          return (
            <div key={size} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold uppercase text-[#111]">
                {size.replace("Kids-", "K-")}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(size, Math.max(0, qty - 1))}
                  className="w-6 h-6 border-2 border-[#111] flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <Minus size={10} />
                </button>
                <span
                  className="w-6 text-center text-sm font-black"
                  style={{ color: qty > 0 ? "#FF5500" : "#888" }}
                >
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(size, qty + 1)}
                  className="w-6 h-6 border-2 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  style={{ borderColor: "#FF5500" }}
                >
                  <Plus size={10} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ColorPicker({
  colors,
  selected,
  onSelect,
}: {
  colors: { name: string; hex: string; border?: boolean }[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          title={c.name}
          onClick={() => onSelect(c.name)}
          className="w-8 h-8 transition-transform hover:scale-110 focus:outline-none"
          style={{
            backgroundColor: c.hex,
            border:
              selected === c.name
                ? "3px solid #FF5500"
                : c.border
                  ? "2px solid #d1d5db"
                  : "2px solid transparent",
            boxShadow: selected === c.name ? "0 0 0 2px #FF5500" : "none",
          }}
          aria-label={c.name}
        />
      ))}
      <p className="w-full text-xs font-bold mt-1 text-[#FF5500]">
        Selected: {selected}
      </p>
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────────────────────

function ProductCard({
  product,
  onCustomize,
}: {
  product: ProductDef;
  onCustomize: (product: ProductDef) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white border-4 border-[#111111] overflow-hidden flex flex-col"
    >
      <div
        className="h-3"
        style={{
          backgroundColor: product.category === "work" ? "#111111" : "#FF5500",
        }}
      />
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-['Bebas_Neue'] text-2xl text-[#111111] tracking-wide leading-tight">
            {product.name}
          </h3>
          <div className="flex flex-col items-end gap-1">
            <span
              className="text-xs font-black uppercase tracking-wider px-2 py-1 whitespace-nowrap border-2 border-[#111]"
              style={{
                backgroundColor:
                  product.category === "work" ? "#111111" : "#FF5500",
                color: "white",
              }}
            >
              {product.category === "work" ? "For Work" : "Everyday"}
            </span>
            {product.hasSleeveOption && (
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 whitespace-nowrap border-2 border-[#FFD200] bg-[#FFD200] text-[#111]">
                Short &amp; Long Sleeve
              </span>
            )}
          </div>
        </div>
        <p className="text-sm mb-4 text-[#555] font-medium">
          {product.description}
        </p>
        <div className="mb-5">
          <p className="font-black uppercase text-xs tracking-wider mb-2 text-[#111]">
            Pricing Tiers
          </p>
          <div className="grid grid-cols-2 gap-1">
            {product.pricing.tiers.map((tier) => (
              <div
                key={tier.label}
                className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-1.5"
              >
                <span className="text-xs text-[#555]">{tier.label}</span>
                <span className="text-xs font-black text-[#FF5500]">
                  ${tier.price}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto">
          <button
            type="button"
            onClick={() => onCustomize(product)}
            className="w-full font-black uppercase tracking-wider py-3 text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors bg-[#FF5500] border-4 border-[#111111]"
            data-ocid="order.primary_button"
          >
            Customize & Add to Cart
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
  accent,
}: { title: string; subtitle: string; accent: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-1 w-12" style={{ backgroundColor: accent }} />
        <h2 className="font-['Bebas_Neue'] text-4xl sm:text-5xl text-[#111111] tracking-wide">
          {title}
        </h2>
      </div>
      <p
        className="text-sm text-[#555] font-medium"
        style={{ paddingLeft: "60px" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────

export default function Order() {
  const { actor, isFetching } = useActor();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [customizing, setCustomizing] = useState<ProductDef | null>(null);
  const [modalSizes, setModalSizes] = useState<Record<string, number>>({});
  const [modalShirtColor, setModalShirtColor] = useState("Black");
  const [modalVinylColor, setModalVinylColor] = useState("White");
  const [modalSleeveType, setModalSleeveType] =
    useState<SleeveType>("Short Sleeve");

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<bigint | null>(null);
  const [orderError, setOrderError] = useState("");

  const openModal = (product: ProductDef) => {
    setCustomizing(product);
    const allSizes = [...KIDS_SIZES, ...ADULT_SIZES];
    setModalSizes(Object.fromEntries(allSizes.map((s) => [s, 0])));
    setModalShirtColor("Black");
    setModalVinylColor("White");
    setModalSleeveType("Short Sleeve");
  };

  const modalTotalQty = Object.values(modalSizes).reduce((s, q) => s + q, 0);

  const handleAddToCart = () => {
    if (!customizing || modalTotalQty === 0) return;
    const newItem: CartItem = {
      id: `${customizing.id}-${Date.now()}`,
      shirtType: customizing.shirtType,
      category: customizing.category,
      shirtColor: modalShirtColor,
      vinylColor: modalVinylColor,
      sizes: { ...modalSizes },
      sleeveType: customizing.hasSleeveOption ? modalSleeveType : undefined,
    };
    setCart((prev) => [...prev, newItem]);
    setCustomizing(null);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePlaceOrder = async () => {
    setOrderError("");
    if (
      !customerInfo.name.trim() ||
      !customerInfo.email.trim() ||
      !customerInfo.phone.trim()
    ) {
      setOrderError("Please fill in your name, email, and phone.");
      return;
    }
    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }
    if (!actor) {
      setOrderError("Connecting to backend, please wait…");
      return;
    }

    const cartSummary = cart
      .map(
        (item, i) =>
          `Item ${i + 1}: ${item.shirtType}${item.sleeveType ? ` (${item.sleeveType})` : ""} | Shirt: ${item.shirtColor} | Vinyl: ${item.vinylColor} | ${Object.entries(
            item.sizes,
          )
            .filter(([, q]) => q > 0)
            .map(([s, q]) => `${s}×${q}`)
            .join(", ")}`,
      )
      .join(" || ");

    const fullNotes =
      cartSummary +
      (customerInfo.notes ? `\n\nNotes: ${customerInfo.notes}` : "");

    const cartItemsPayload = cart.map((item) => ({
      shirtType: item.shirtType,
      shirtColor: item.shirtColor,
      vinylColor: item.vinylColor,
      category: item.category,
      sizes: Object.entries(item.sizes)
        .filter(([, q]) => q > 0)
        .map(([s, q]): [string, bigint] => [s, BigInt(q)]),
    }));

    setSubmitting(true);
    try {
      const id = await (actor as any).submitOrder({
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        cartItems: cartItemsPayload,
        notes: fullNotes,
      });
      setOrderId(id);
      setCart([]);
    } catch (err) {
      setOrderError("Failed to submit order. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const workProducts = PRODUCTS.filter((p) => p.category === "work");
  const everydayProducts = PRODUCTS.filter((p) => p.category === "everyday");
  const unitCount = cartUnitCount(cart);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Nav />

      {/* Hero */}
      <div className="pt-24 pb-10 px-4 bg-[#111111] border-b-4 border-[#FF5500]">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#FF5500] text-white font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4"
          >
            Custom Apparel
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-white tracking-wide mb-3"
          >
            Shop Our Products
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-1 w-12 bg-[#FF5500]" />
            <Flame size={14} className="text-[#FFD200]" />
            <div className="h-1 w-12 bg-[#FF5500]" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-sm max-w-xl mx-auto font-medium"
          >
            Customize shirts with your colors and logo. Add items to your cart,
            then place your order.
          </motion.p>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* FOR WORK */}
        <section className="mb-16">
          <SectionHeader
            title="For Work"
            subtitle="Professional uniforms, job-site gear, and crew apparel built to perform."
            accent="#111111"
          />
          <div className="grid sm:grid-cols-2 gap-6">
            {workProducts.map((p) => (
              <ProductCard key={p.id} product={p} onCustomize={openModal} />
            ))}
          </div>
        </section>

        {/* FOR EVERYDAY */}
        <section>
          <SectionHeader
            title="For Everyday"
            subtitle="Soft, comfortable styles for restaurants, events, and everyday casual wear."
            accent="#FF5500"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {everydayProducts.map((p) => (
              <ProductCard key={p.id} product={p} onCustomize={openModal} />
            ))}
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Cart Button */}
      <AnimatePresence>
        {unitCount > 0 && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 right-6 flex items-center gap-3 font-black uppercase tracking-wider text-sm text-white px-6 py-4 shadow-xl hover:bg-[#FFD200] hover:text-[#111] transition-colors z-40 bg-[#FF5500] border-4 border-[#111]"
            data-ocid="order.open_modal_button"
          >
            <ShoppingCart size={20} />
            View Cart ({unitCount} {unitCount === 1 ? "item" : "items"})
          </motion.button>
        )}
      </AnimatePresence>

      {/* Customization Modal */}
      <Dialog
        open={!!customizing}
        onOpenChange={(open) => !open && setCustomizing(null)}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="order.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-['Bebas_Neue'] text-3xl text-[#111] tracking-wide">
              {customizing?.name}
            </DialogTitle>
          </DialogHeader>

          {customizing && (
            <div className="space-y-6 pb-2">
              {/* Sleeve Type — only for construction tee */}
              {customizing.hasSleeveOption && (
                <>
                  <div>
                    <p className="font-black uppercase text-xs tracking-widest mb-3 text-[#111]">
                      Sleeve Type
                    </p>
                    <div className="flex gap-3">
                      {SLEEVE_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setModalSleeveType(option)}
                          className="flex-1 py-3 font-black uppercase tracking-wider text-sm border-4 transition-colors"
                          style={{
                            backgroundColor:
                              modalSleeveType === option
                                ? "#FF5500"
                                : "#FFFFFF",
                            color:
                              modalSleeveType === option
                                ? "#FFFFFF"
                                : "#111111",
                            borderColor:
                              modalSleeveType === option
                                ? "#FF5500"
                                : "#111111",
                          }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Shirt Color */}
              <div>
                <p className="font-black uppercase text-xs tracking-widest mb-2 text-[#111]">
                  Shirt Color
                </p>
                <ColorPicker
                  colors={SHIRT_COLORS}
                  selected={modalShirtColor}
                  onSelect={setModalShirtColor}
                />
              </div>

              <Separator />

              {/* Vinyl Color */}
              <div>
                <p className="font-black uppercase text-xs tracking-widest mb-1 text-[#111]">
                  Vinyl Color
                </p>
                <p className="text-xs mb-2 text-[#888]">
                  100% premium vinyl — wash-safe and built to last.
                </p>
                <ColorPicker
                  colors={VINYL_COLORS}
                  selected={modalVinylColor}
                  onSelect={setModalVinylColor}
                />
              </div>

              <Separator />

              {/* Sizes */}
              <div>
                <p className="font-black uppercase text-xs tracking-widest mb-4 text-[#111]">
                  Sizes & Quantities
                </p>
                <SizeRow
                  label="Kids (XS–XL)"
                  sizes={KIDS_SIZES}
                  values={modalSizes}
                  onChange={(size, qty) =>
                    setModalSizes((prev) => ({ ...prev, [size]: qty }))
                  }
                />
                <SizeRow
                  label="Adults (S–5XL)"
                  sizes={ADULT_SIZES}
                  values={modalSizes}
                  onChange={(size, qty) =>
                    setModalSizes((prev) => ({ ...prev, [size]: qty }))
                  }
                />
                {modalTotalQty > 0 && (
                  <div className="mt-3 p-3 bg-[#FFF8F0] border-2 border-[#FF5500]">
                    <p className="text-sm font-bold text-[#FF5500]">
                      Total: {modalTotalQty} units @ $
                      {getPricePerUnit(customizing.shirtType, modalTotalQty)}/ea
                      {" = "}
                      <span className="font-black">
                        $
                        {modalTotalQty *
                          getPricePerUnit(customizing.shirtType, modalTotalQty)}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomizing(null)}
                  className="flex-1 font-bold uppercase tracking-wider py-3 text-sm border-4 border-[#111] hover:bg-gray-100 transition-colors text-[#111]"
                  data-ocid="order.cancel_button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={modalTotalQty === 0}
                  className="flex-1 font-black uppercase tracking-wider py-3 text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors disabled:opacity-40 bg-[#FF5500] border-4 border-[#111]"
                  data-ocid="order.primary_button"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col"
          data-ocid="order.sheet"
        >
          <SheetHeader className="px-6 py-5 border-b-4 border-[#FF5500] bg-[#111111]">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-['Bebas_Neue'] text-3xl text-white tracking-wide flex items-center gap-2">
                <ShoppingCart size={22} className="text-[#FF5500]" />
                Your Cart
                {unitCount > 0 && (
                  <span className="text-xs font-black px-2 py-0.5 text-white bg-[#FF5500] ml-1">
                    {unitCount}
                  </span>
                )}
              </SheetTitle>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4">
              <AnimatePresence>
                {orderId !== null ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                    data-ocid="order.success_state"
                  >
                    <CheckCircle2
                      size={56}
                      className="mx-auto mb-4"
                      style={{ color: "#16a34a" }}
                    />
                    <h3 className="font-['Bebas_Neue'] text-4xl text-[#111] tracking-wide mb-2">
                      Order Submitted!
                    </h3>
                    <p className="text-sm mb-1 text-[#555]">
                      Order #{orderId.toString()} received.
                    </p>
                    <p className="text-xs mb-6 text-[#888]">
                      We'll review and reach out to you soon.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderId(null);
                        setCartOpen(false);
                        setCustomerInfo({
                          name: "",
                          email: "",
                          phone: "",
                          notes: "",
                        });
                      }}
                      className="font-black uppercase tracking-wider px-8 py-3 text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors bg-[#FF5500] border-4 border-[#111]"
                      data-ocid="order.secondary_button"
                    >
                      Continue Shopping
                    </button>
                  </motion.div>
                ) : (
                  <>
                    {cart.length === 0 ? (
                      <div
                        className="text-center py-16"
                        data-ocid="order.empty_state"
                      >
                        <ShoppingCart
                          size={48}
                          className="mx-auto mb-4 opacity-20 text-[#111]"
                        />
                        <p className="font-bold uppercase tracking-wider text-sm text-[#111] opacity-50">
                          Your cart is empty
                        </p>
                        <button
                          type="button"
                          onClick={() => setCartOpen(false)}
                          className="mt-6 font-black uppercase tracking-wider px-6 py-2.5 text-white text-sm hover:bg-[#FF5500] transition-colors bg-[#111] border-4 border-[#111]"
                          data-ocid="order.secondary_button"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Cart items */}
                        {cart.map((item, idx) => {
                          const qty = itemTotalQty(item);
                          const subtotal = itemSubtotal(item);
                          const perUnit = getPricePerUnit(item.shirtType, qty);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="bg-gray-50 border-2 border-[#111] p-4"
                              data-ocid={`order.list_item.${idx + 1}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span
                                      className="text-xs font-black uppercase tracking-wider px-2 py-0.5 text-white"
                                      style={{
                                        backgroundColor:
                                          item.category === "work"
                                            ? "#111111"
                                            : "#FF5500",
                                      }}
                                    >
                                      {item.category === "work"
                                        ? "Work"
                                        : "Everyday"}
                                    </span>
                                    {item.sleeveType && (
                                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-[#FFD200] text-[#111]">
                                        {item.sleeveType}
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-black text-sm text-[#111]">
                                    {item.shirtType}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <div className="flex items-center gap-1">
                                      <span
                                        className="w-3 h-3 inline-block border border-gray-200"
                                        style={{
                                          backgroundColor:
                                            SHIRT_COLORS.find(
                                              (c) => c.name === item.shirtColor,
                                            )?.hex ?? "#ccc",
                                        }}
                                      />
                                      <span className="text-xs text-[#555]">
                                        {item.shirtColor}
                                      </span>
                                    </div>
                                    <span className="text-gray-300">|</span>
                                    <div className="flex items-center gap-1">
                                      <span
                                        className="w-3 h-3 inline-block border border-gray-200"
                                        style={{
                                          backgroundColor:
                                            VINYL_COLORS.find(
                                              (c) => c.name === item.vinylColor,
                                            )?.hex ?? "#ccc",
                                        }}
                                      />
                                      <span className="text-xs text-[#555]">
                                        {item.vinylColor} vinyl
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {Object.entries(item.sizes)
                                      .filter(([, q]) => q > 0)
                                      .map(([size, q]) => (
                                        <span
                                          key={size}
                                          className="text-xs px-2 py-0.5 bg-white border-2 border-[#111] font-bold text-[#111]"
                                        >
                                          {size.replace("Kids-", "K-")}×{q}
                                        </span>
                                      ))}
                                  </div>
                                  <p className="mt-2 text-xs text-[#888]">
                                    {qty} units @ ${perUnit}/ea
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveFromCart(item.id)
                                    }
                                    className="p-1.5 hover:bg-red-50 transition-colors text-[#888]"
                                    data-ocid={`order.delete_button.${idx + 1}`}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                  <p className="font-black text-sm text-[#111]">
                                    ${subtotal}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Total */}
                        <div
                          className="flex items-center justify-between px-1 pt-2"
                          style={{ borderTop: "4px solid #111111" }}
                        >
                          <span className="font-black uppercase tracking-wider text-sm text-[#111]">
                            Estimated Total
                          </span>
                          <span className="font-black text-2xl text-[#FF5500]">
                            ${cartTotal(cart)}
                          </span>
                        </div>

                        <Separator />

                        {/* Continue shopping */}
                        <button
                          type="button"
                          onClick={() => setCartOpen(false)}
                          className="w-full font-bold uppercase tracking-wider py-2.5 text-sm border-4 border-[#111] hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-[#111]"
                          data-ocid="order.secondary_button"
                        >
                          <X size={14} /> Continue Shopping
                        </button>

                        <Separator />

                        {/* Customer info */}
                        <div>
                          <p className="font-black uppercase text-xs tracking-widest mb-4 text-[#111]">
                            Your Information
                          </p>
                          <div className="space-y-3">
                            <div>
                              <Label className="font-bold text-xs uppercase tracking-wider text-[#111]">
                                Full Name *
                              </Label>
                              <Input
                                value={customerInfo.name}
                                onChange={(e) =>
                                  setCustomerInfo((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                placeholder="Jane Smith"
                                className="mt-1 border-2 border-[#111] rounded-none"
                                data-ocid="order.input"
                              />
                            </div>
                            <div>
                              <Label className="font-bold text-xs uppercase tracking-wider text-[#111]">
                                Email *
                              </Label>
                              <Input
                                type="email"
                                value={customerInfo.email}
                                onChange={(e) =>
                                  setCustomerInfo((prev) => ({
                                    ...prev,
                                    email: e.target.value,
                                  }))
                                }
                                placeholder="jane@example.com"
                                className="mt-1 border-2 border-[#111] rounded-none"
                                data-ocid="order.input"
                              />
                            </div>
                            <div>
                              <Label className="font-bold text-xs uppercase tracking-wider text-[#111]">
                                Phone *
                              </Label>
                              <Input
                                type="tel"
                                value={customerInfo.phone}
                                onChange={(e) =>
                                  setCustomerInfo((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="(623) 555-0100"
                                className="mt-1 border-2 border-[#111] rounded-none"
                                data-ocid="order.input"
                              />
                            </div>
                            <div>
                              <Label className="font-bold text-xs uppercase tracking-wider text-[#111]">
                                Notes (optional)
                              </Label>
                              <Textarea
                                value={customerInfo.notes}
                                onChange={(e) =>
                                  setCustomerInfo((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                  }))
                                }
                                placeholder="Design details, logo info, special requests…"
                                rows={3}
                                className="mt-1 border-2 border-[#111] rounded-none"
                                data-ocid="order.textarea"
                              />
                            </div>
                          </div>
                        </div>

                        {orderError && (
                          <p className="text-sm font-bold text-red-600 text-center">
                            {orderError}
                          </p>
                        )}

                        <Button
                          onClick={handlePlaceOrder}
                          disabled={submitting || isFetching}
                          className="w-full font-black uppercase tracking-wider py-4 text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors disabled:opacity-60 bg-[#FF5500] border-4 border-[#111] rounded-none h-auto"
                          data-ocid="order.submit_button"
                        >
                          {submitting ? (
                            <>
                              <Loader2
                                size={18}
                                className="animate-spin mr-2"
                              />{" "}
                              Placing Order…
                            </>
                          ) : (
                            "Place Order"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
