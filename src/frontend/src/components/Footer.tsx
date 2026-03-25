import { Link } from "@tanstack/react-router";
import { Flame, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#111111] text-white border-t-4 border-[#FF5500]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={20} className="text-[#FF5500]" />
              <h3 className="font-['Bebas_Neue'] text-2xl tracking-widest text-[#FF5500] uppercase">
                Desert Valley Designs
              </h3>
            </div>
            <p className="text-[#FFD200] text-[10px] uppercase tracking-[0.25em] font-bold mb-3">
              Custom Apparel · Vinyl Print · Buckeye AZ
            </p>
            <div className="flex items-start gap-2 text-white/60 mb-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#FF5500]" />
              <span className="text-sm">Buckeye, Arizona</span>
            </div>
            <div className="flex items-start gap-2 text-white/60 mb-2">
              <Mail size={14} className="mt-0.5 shrink-0 text-[#FF5500]" />
              <a
                href="mailto:DesertValleyDesignsContact@gmail.com"
                className="text-sm hover:text-[#FF5500] transition-colors"
              >
                DesertValleyDesignsContact@gmail.com
              </a>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mt-3">
              Custom apparel and logo design rooted in the spirit of the desert
              Southwest.
            </p>
          </div>
          <div>
            <h4 className="font-['Bebas_Neue'] text-lg tracking-widest text-[#FFD200] uppercase mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/services", label: "Services" },
                { to: "/order", label: "Place an Order" },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to as "/"}
                    className="text-white/60 hover:text-[#FF5500] text-sm transition-colors font-semibold uppercase tracking-wider"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-['Bebas_Neue'] text-lg tracking-widest text-[#FFD200] uppercase mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-white/60 text-sm font-medium">
              <li>Custom Uniforms</li>
              <li>Team Apparel</li>
              <li>Branded Shirts</li>
              <li>Vinyl Printing</li>
              <li>Logo Design</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-white/40 text-xs">
            &copy; {year} Desert Valley Designs. All rights reserved.
            &nbsp;·&nbsp; Buckeye, Arizona
          </p>
        </div>
      </div>
    </footer>
  );
}
