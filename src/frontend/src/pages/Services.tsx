import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle, Flame, Palette, Shirt } from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

const apparel = [
  "Custom team uniforms",
  "Vinyl printed t-shirts",
  "Vinyl hats",
  "Sports & athletic wear",
  "Work & company uniforms",
  "Event & promotional shirts",
  "Youth & adult sizing available",
  "Bulk orders welcome",
];

const logoDesign = [
  "Brand identity packages",
  "Vector logo files (AI, SVG, PDF)",
  "Multiple concept variations",
  "Unlimited revisions until satisfied",
  "Business card & letterhead templates",
  "Social media kit",
  "Color palette & font guide",
  "Fast turnaround",
];

const pricingCategories = [
  {
    title: "T-Shirts",
    subtitle: "Construction",
    tiers: [
      { qty: "1–15 shirts", price: "$26 each" },
      { qty: "16–30 shirts", price: "$23 each" },
      { qty: "31–50 shirts", price: "$21 each" },
      { qty: "51+ shirts", price: "$19 each" },
    ],
    note: "Includes vinyl printing.",
  },
  {
    title: "T-Shirts",
    subtitle: "Softstyle / Restaurant",
    tiers: [
      { qty: "1–15 shirts", price: "$29 each" },
      { qty: "16–30 shirts", price: "$26 each" },
      { qty: "31–50 shirts", price: "$23 each" },
      { qty: "51+ shirts", price: "$21 each" },
    ],
    note: "Includes vinyl printing.",
  },
  {
    title: "Polos",
    subtitle: "",
    tiers: [
      { qty: "1–15 polos", price: "$37 each" },
      { qty: "16–30 polos", price: "$34 each" },
      { qty: "31–50 polos", price: "$32 each" },
      { qty: "51+ polos", price: "$30 each" },
    ],
    note: "Includes vinyl printing.",
  },
];

const logoPricing = [
  {
    title: "Simple Logo",
    price: "$51",
    description: "Text-based or minimal icon logo",
    includes: [
      "1 concept",
      "2 revisions",
      "PNG & JPG files",
      "Quick turnaround",
    ],
  },
  {
    title: "Standard Logo",
    price: "$76",
    description: "Custom icon + text combination",
    includes: [
      "2 concepts",
      "Unlimited revisions",
      "PNG, JPG & PDF files",
      "Color variations",
    ],
    featured: true,
  },
  {
    title: "Full Brand Package",
    price: "$101",
    description: "Complete brand identity design",
    includes: [
      "3 concepts",
      "Unlimited revisions",
      "All file formats (AI, SVG, PDF, PNG)",
      "Color palette & font guide",
    ],
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Nav />

      {/* Hero */}
      <section className="pt-32 pb-20 text-center bg-[#111111] border-b-4 border-[#FF5500]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto px-4"
        >
          <div className="inline-block bg-[#FF5500] text-white font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-6">
            Buckeye, Arizona
          </div>
          <h1 className="font-['Bebas_Neue'] text-7xl sm:text-8xl text-white tracking-wide mb-5">
            Our Services
          </h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-1 w-12 bg-[#FF5500]" />
            <Flame size={16} className="text-[#FFD200]" />
            <div className="h-1 w-12 bg-[#FF5500]" />
          </div>
          <p className="text-white/80 text-lg leading-relaxed font-medium">
            From custom gear to professional branding — we deliver quality and
            creativity rooted in the desert Southwest spirit.
          </p>
        </motion.div>
      </section>

      {/* Custom Apparel */}
      <section className="py-24 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-6 bg-[#FF5500] border-4 border-[#111]">
                <Shirt size={36} className="text-white" />
              </div>
              <h2 className="font-['Bebas_Neue'] text-6xl text-[#111111] tracking-wide mb-4">
                Custom Apparel
              </h2>
              <p className="text-base leading-relaxed mb-8 text-[#444] font-medium">
                We handle every detail. Vinyl transfers on premium garments.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {apparel.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-[#333] font-medium"
                  >
                    <CheckCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[#FF5500]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/order"
                className="font-black uppercase tracking-wider px-8 py-4 bg-[#FF5500] text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors inline-flex items-center gap-2 border-4 border-[#111111]"
                data-ocid="services.apparel.button"
              >
                Order Apparel <ArrowRight size={14} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border-4 border-[#111111] bg-[#FFD200] flex items-center justify-center"
              style={{ minHeight: "360px" }}
            >
              <div className="text-center p-12">
                <Shirt
                  size={100}
                  className="text-[#111111] opacity-30 mx-auto"
                />
                <p className="mt-4 font-['Bebas_Neue'] text-2xl text-[#111111] opacity-40 tracking-widest">
                  Custom Apparel
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Apparel Pricing — black section */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-[#FF5500] text-white font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4">
              Transparent Rates
            </div>
            <h2 className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-white tracking-wide">
              Apparel Pricing
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-1 w-12 bg-[#FF5500]" />
              <div className="h-1 w-4 bg-[#FFD200]" />
              <div className="h-1 w-12 bg-[#FF5500]" />
            </div>
            <p className="mt-4 text-white/70 font-medium">
              Order more, save more. Bulk discounts applied automatically.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingCategories.map((category, idx) => (
              <motion.div
                key={`${category.title}-${category.subtitle}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="border-4 border-[#FF5500] bg-white overflow-hidden"
              >
                {idx === 0 && (
                  <div className="h-48 bg-white flex gap-1 p-2">
                    <img
                      src="/assets/uploads/img_2613-019d22f8-ba06-7298-ae47-67366c206568-1.jpeg"
                      alt="Construction Short Sleeve"
                      className="flex-1 object-contain"
                    />
                    <img
                      src="/assets/uploads/img_2614-019d22f8-ba0d-744e-98ef-b4fc300a5cc0-2.jpeg"
                      alt="Construction Long Sleeve"
                      className="flex-1 object-contain"
                    />
                  </div>
                )}
                {idx === 1 && (
                  <div className="h-48 bg-white flex items-center justify-center p-2">
                    <img
                      src="/assets/uploads/img_2616-019d22f8-ba0d-768d-acc4-2e8c48e83708-3.jpeg"
                      alt="Softstyle T-Shirt"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {idx === 2 && (
                  <div className="h-48 bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src="/assets/uploads/img_2615-019d2300-4efe-77a6-91a2-713b702886b1-1.jpeg"
                      alt="Polo Shirt"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="px-6 py-5 bg-[#FF5500]">
                  <h3 className="font-['Bebas_Neue'] text-3xl text-white tracking-wide leading-tight">
                    {category.title}
                  </h3>
                  {category.subtitle && (
                    <p className="font-bold text-sm mt-0.5 text-white/80">
                      {category.subtitle}
                    </p>
                  )}
                </div>
                <div className="px-6 py-4 divide-y divide-stone-200">
                  {category.tiers.map((tier, tIdx) => (
                    <div
                      key={tier.qty}
                      className="flex items-center justify-between py-3"
                    >
                      <span className="text-sm font-medium text-[#444]">
                        {tier.qty}
                      </span>
                      <span
                        className="font-black text-xl"
                        style={{
                          color:
                            tIdx === category.tiers.length - 1
                              ? "#FF5500"
                              : "#111",
                        }}
                      >
                        {tier.price}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-6 py-3 bg-[#FAFAF5]">
                  <p className="text-xs text-[#888]">{category.note}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Logo Design section */}
      <section className="py-24 bg-[#F5E6C8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="border-4 border-[#111111] bg-[#FF5500] flex items-center justify-center order-last lg:order-first"
              style={{ minHeight: "360px" }}
            >
              <div className="text-center p-12">
                <Palette size={100} className="text-white opacity-40 mx-auto" />
                <p className="mt-4 font-['Bebas_Neue'] text-2xl text-white opacity-50 tracking-widest">
                  Logo Design
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 flex items-center justify-center mb-6 bg-[#111111] border-4 border-[#111]">
                <Palette size={36} className="text-[#FFD200]" />
              </div>
              <h2 className="font-['Bebas_Neue'] text-6xl text-[#111111] tracking-wide mb-4">
                Logo Design
              </h2>
              <p className="text-base leading-relaxed mb-8 text-[#444] font-medium">
                Your logo is the face of your brand. We design professional,
                versatile logos tailored to your industry and style. Perfect for
                startups, local businesses, and teams.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {logoDesign.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm text-[#333] font-medium"
                  >
                    <CheckCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[#FF5500]"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/logo-request"
                className="font-black uppercase tracking-wider px-8 py-4 bg-[#111111] text-white text-sm hover:bg-[#FF5500] transition-colors inline-flex items-center gap-2 border-4 border-[#111111]"
                data-ocid="services.logo.button"
              >
                Request a Logo <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo Pricing */}
      <section className="py-24 bg-[#111111]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-[#FFD200] text-[#111] font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4">
              Logo Pricing
            </div>
            <h2 className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-white tracking-wide">
              Logo Design Rates
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-1 w-12 bg-[#FFD200]" />
              <div className="h-1 w-4 bg-[#FF5500]" />
              <div className="h-1 w-12 bg-[#FFD200]" />
            </div>
            <p className="mt-4 text-white/70 font-medium">
              Flat-rate pricing — no surprises. Pick the package that fits your
              needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {logoPricing.map((pkg, idx) => (
              <motion.div
                key={pkg.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`border-4 overflow-hidden flex flex-col ${
                  pkg.featured
                    ? "border-[#FFD200] scale-105"
                    : "border-[#FF5500]"
                } bg-white`}
              >
                {pkg.featured && (
                  <div className="bg-[#FFD200] text-[#111] font-black text-xs uppercase tracking-widest text-center py-2">
                    Most Popular
                  </div>
                )}
                <div
                  className={`px-6 py-5 ${
                    pkg.featured ? "bg-[#FFD200]" : "bg-[#FF5500]"
                  }`}
                >
                  <h3
                    className={`font-['Bebas_Neue'] text-3xl tracking-wide leading-tight ${
                      pkg.featured ? "text-[#111]" : "text-white"
                    }`}
                  >
                    {pkg.title}
                  </h3>
                  <p
                    className={`font-bold text-sm mt-0.5 ${
                      pkg.featured ? "text-[#333]" : "text-white/80"
                    }`}
                  >
                    {pkg.description}
                  </p>
                </div>
                <div className="px-6 py-5 flex-1">
                  <div className="text-5xl font-black text-[#111] mb-4">
                    {pkg.price}
                  </div>
                  <ul className="space-y-2">
                    {pkg.includes.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-[#333] font-medium"
                      >
                        <CheckCircle
                          size={15}
                          className="mt-0.5 shrink-0 text-[#FF5500]"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <Link
                    to="/logo-request"
                    className={`w-full font-black uppercase tracking-wider px-6 py-3 text-sm inline-flex items-center justify-center gap-2 border-4 border-[#111111] transition-colors ${
                      pkg.featured
                        ? "bg-[#111111] text-white hover:bg-[#FF5500] hover:border-[#FF5500]"
                        : "bg-[#FF5500] text-white hover:bg-[#FFD200] hover:text-[#111]"
                    }`}
                    data-ocid={`services.logo.pkg.${idx}`}
                  >
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-[#FFD200]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-['Bebas_Neue'] text-7xl sm:text-8xl text-[#111111] tracking-wide mb-4">
            Let's Build Your Brand
          </h2>
          <p className="text-[#333] text-lg mb-8 font-medium">
            Fill out our easy order form to get started today.
          </p>
          <Link
            to="/order"
            className="font-black uppercase tracking-wider px-10 py-4 bg-[#111111] text-white text-sm hover:bg-[#FF5500] hover:border-[#FF5500] transition-colors inline-block border-4 border-[#111111]"
            data-ocid="services.cta.button"
          >
            Place Your Order
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
