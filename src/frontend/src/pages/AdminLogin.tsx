import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";

const ADMIN_KEY = "dvd_admin_logged_in";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(ADMIN_KEY) === "true") {
      navigate({ to: "/admin/dashboard", replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!actor) {
      setError("Connecting to backend, please wait...");
      return;
    }
    setLoading(true);
    try {
      const ok = await actor.adminLogin(username, password);
      if (ok) {
        localStorage.setItem(ADMIN_KEY, "true");
        navigate({ to: "/admin/dashboard", replace: true });
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-[#111111]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #FF5500 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-['Bebas_Neue'] text-5xl text-[#FF5500] tracking-widest">
            Admin Portal
          </h1>
          <p className="text-white/50 text-sm mt-2 font-medium uppercase tracking-widest">
            Desert Valley Designs
          </p>
        </div>
        <form
          onSubmit={handleLogin}
          className="bg-white border-4 border-[#FF5500] p-8 space-y-6"
          data-ocid="admin.panel"
        >
          <div>
            <Label
              htmlFor="admin-user"
              className="font-black text-xs uppercase tracking-wider text-[#111]"
            >
              Username
            </Label>
            <Input
              id="admin-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoComplete="username"
              className="mt-1 border-2 border-[#111] rounded-none"
              data-ocid="admin.input"
            />
          </div>
          <div>
            <Label
              htmlFor="admin-pass"
              className="font-black text-xs uppercase tracking-wider text-[#111]"
            >
              Password
            </Label>
            <Input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="mt-1 border-2 border-[#111] rounded-none"
              data-ocid="admin.input"
            />
          </div>
          {error && (
            <p
              className="text-sm font-bold text-center text-red-600"
              data-ocid="admin.error_state"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || isFetching}
            className="w-full font-black uppercase tracking-wider py-4 text-white text-sm hover:bg-[#FF5500] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 bg-[#111111] border-4 border-[#111111] hover:border-[#FF5500]"
            data-ocid="admin.submit_button"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in…
              </>
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
