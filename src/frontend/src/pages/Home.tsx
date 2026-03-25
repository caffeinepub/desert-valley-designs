import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Flame,
  Palette,
  Shirt,
  Star,
  Sun,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";

const stats = [
  { icon: Users, value: "500+", label: "Happy Clients" },
  { icon: Shirt, value: "10K+", label: "Garments Made" },
  { icon: Star, value: "5-Star", label: "Rated Service" },
];

const services = [
  {
    icon: Shirt,
    title: "Custom Apparel",
    description:
      "From team uniforms to branded shirts and custom gear — we bring your vision to life with premium fabrics and precision vinyl printing.",
    cta: "Order Apparel",
    link: "/order" as const,
    accent: "#FF5500",
  },
  {
    icon: Palette,
    title: "Logo Design",
    description:
      "Professional logos that capture your brand identity. Bold, memorable marks built for Arizona businesses.",
    cta: "Get a Logo",
    link: "/logo-request" as const,
    accent: "#FFD200",
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Nav />

      {/* Hero */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ paddingTop: "64px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-desert.dim_1920x600.jpg')",
          }}
        />
        {/* Dark overlay with desert warmth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(17,17,17,0.82) 0%, rgba(17,17,17,0.6) 50%, rgba(200,96,58,0.45) 100%)",
          }}
        />

        {/* Halftone dot decoration */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #FF5500 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 bg-[#FF5500] text-white font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-6"
              style={{ transform: "rotate(-1deg)" }}
            >
              <Sun size={14} /> Buckeye, Arizona
            </div>

            <h1 className="text-white font-['Bebas_Neue'] uppercase text-7xl sm:text-9xl leading-none tracking-wide mb-4">
              Desert Valley
              <br />
              <span className="text-[#FF5500]">Designs</span>
            </h1>
            <p className="text-white/90 text-lg sm:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Custom apparel &amp; vinyl printing rooted in the heat of the
              desert Southwest. Bold. Vibrant. Built to last.
            </p>

            {/* Thick ruled line */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <div className="h-1 w-16 bg-[#FF5500]" />
              <Flame size={16} className="text-[#FFD200]" />
              <div className="h-1 w-16 bg-[#FF5500]" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate({ to: "/order" })}
                className="font-black uppercase tracking-wider px-8 py-4 bg-[#FF5500] text-white hover:bg-[#FFD200] hover:text-[#111] transition-colors text-sm border-4 border-[#FF5500] hover:border-[#FFD200]"
                data-ocid="hero.primary_button"
              >
                Start Your Order
              </button>
              <Link
                to="/services"
                className="font-black uppercase tracking-wider px-8 py-4 text-white border-4 border-white hover:bg-white hover:text-[#111] transition-all text-sm"
                data-ocid="hero.secondary_button"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-xs uppercase tracking-widest animate-bounce">
          ↓ Scroll
        </div>
      </section>

      {/* Stats — black bar */}
      <section className="bg-[#111111] py-12 border-y-4 border-[#FF5500]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <s.icon size={28} className="mx-auto mb-2 text-[#FF5500]" />
                <div className="font-['Bebas_Neue'] text-white text-4xl sm:text-5xl tracking-wide">
                  {s.value}
                </div>
                <div className="text-white/50 text-xs uppercase tracking-wider font-bold mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview — white section */}
      <section className="py-24 bg-[#FAFAF5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-[#FFD200] text-[#111] font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4">
              What We Do
            </div>
            <h2 className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-[#111111] tracking-wide">
              Our Services
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-1 w-12 bg-[#FF5500]" />
              <div className="h-1 w-4 bg-[#FFD200]" />
              <div className="h-1 w-12 bg-[#FF5500]" />
            </div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc, i) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white border-4 border-[#111111] p-8 flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-6 border-4 border-[#111]"
                  style={{ backgroundColor: svc.accent }}
                >
                  <svc.icon size={28} className="text-white" />
                </div>
                <h3 className="font-['Bebas_Neue'] text-3xl text-[#111111] tracking-wide mb-3">
                  {svc.title}
                </h3>
                <p className="text-[#444] leading-relaxed mb-6 text-sm font-medium">
                  {svc.description}
                </p>
                <Link
                  to={svc.link}
                  className="font-black uppercase tracking-wider px-6 py-3 text-white text-sm hover:bg-[#FFD200] hover:text-[#111] transition-colors flex items-center gap-2 border-2 border-[#111]"
                  style={{ backgroundColor: svc.accent }}
                  data-ocid={`services.item.${i + 1}`}
                >
                  {svc.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="font-black uppercase tracking-wider px-8 py-4 bg-[#111111] text-white text-sm hover:bg-[#FF5500] transition-colors inline-flex items-center gap-2 border-4 border-[#111111]"
              data-ocid="home.services.link"
            >
              See Full Services <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Vinyl Quality — orange block */}
      <section className="py-20 bg-[#FF5500]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-block bg-[#FFD200] text-[#111] font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4">
              Quality You Can Count On
            </div>
            <h2 className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-white tracking-wide mb-4">
              100% Premium Vinyl
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-1 w-12 bg-white/50" />
              <Flame size={16} className="text-[#FFD200]" />
              <div className="h-1 w-12 bg-white/50" />
            </div>
            <p className="text-white/90 text-base leading-relaxed font-medium">
              Every design is applied with 100% premium vinyl that’s built to
              last. Wash it dozens of times and it holds up beautifully —
              guaranteed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA — yellow block */}
      <section className="py-20 text-center bg-[#FFD200]">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-block text-[10px] font-black uppercase tracking-[0.3em] text-[#FF5500] bg-[#111] px-4 py-2 mb-4">
              Let’s Make Something Bold
            </div>
            <h2 className="font-['Bebas_Neue'] text-6xl sm:text-8xl text-[#111111] tracking-wide mb-4">
              Ready to Stand Out?
            </h2>
            <p className="text-[#333] text-lg mb-8 font-medium">
              Let’s create something bold for your team, crew, or business.
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: "/order" })}
              className="font-black uppercase tracking-wider px-10 py-4 text-sm bg-[#111111] text-white hover:bg-[#FF5500] transition-colors border-4 border-[#111111] hover:border-[#FF5500]"
              data-ocid="cta.primary_button"
            >
              Place Your Order Today
            </button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
