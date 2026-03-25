import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111] border-b-4 border-[#FF5500]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex flex-col leading-none"
            data-ocid="nav.link"
          >
            <span className="text-[#FF5500] font-['Bebas_Neue'] text-2xl tracking-widest uppercase leading-none">
              Desert Valley Designs
            </span>
            <span className="text-[#FFD200] text-[9px] uppercase tracking-[0.25em] font-bold">
              Custom Apparel · Vinyl Print · Buckeye AZ
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-white/80 hover:text-[#FFD200] font-bold uppercase tracking-wider text-xs transition-colors"
              data-ocid="nav.home.link"
            >
              Home
            </Link>
            <Link
              to="/services"
              className="text-white/80 hover:text-[#FFD200] font-bold uppercase tracking-wider text-xs transition-colors"
              data-ocid="nav.services.link"
            >
              Services
            </Link>
            <button
              type="button"
              onClick={() => navigate({ to: "/order" })}
              className="font-black uppercase tracking-wider text-xs px-5 py-2 bg-[#FF5500] text-white hover:bg-[#FFD200] hover:text-[#111111] transition-colors rounded-none border-2 border-[#FF5500] hover:border-[#FFD200]"
              data-ocid="nav.order.button"
            >
              Order Now
            </button>
          </div>
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t-2 border-[#FF5500] bg-[#111111]">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="text-white font-bold uppercase tracking-wider text-sm"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setOpen(false)}
              className="text-white font-bold uppercase tracking-wider text-sm"
            >
              Services
            </Link>
            <Link
              to="/order"
              onClick={() => setOpen(false)}
              className="inline-block text-center text-white font-black uppercase tracking-wider text-sm px-5 py-2 bg-[#FF5500] border-2 border-[#FF5500]"
            >
              Order Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
