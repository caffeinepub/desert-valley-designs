import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Flame, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useActor } from "../hooks/useActor";

export default function LogoRequest() {
  const { actor, isFetching } = useActor();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!actor) {
      setError("Connecting to backend, please wait…");
      return;
    }
    setSubmitting(true);
    try {
      await actor.submitLogoRequest({
        name,
        email,
        phone,
        description,
        imageUrl: "",
      });
      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      <Nav />

      {/* Hero */}
      <div className="pt-24 pb-10 px-4 bg-[#111111] border-b-4 border-[#FF5500]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#FF5500] text-white font-black text-xs uppercase tracking-[0.3em] px-4 py-2 mb-4"
          >
            Custom Branding
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-['Bebas_Neue'] text-6xl sm:text-7xl text-white tracking-wide mb-3"
          >
            Request a Logo
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
            Tell us your vision and we'll bring it to life.
          </motion.p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white border-4 border-[#111] px-8"
              data-ocid="logo_request.success_state"
            >
              <CheckCircle2 size={64} className="mx-auto mb-5 text-green-600" />
              <h2 className="font-['Bebas_Neue'] text-5xl text-[#111] tracking-wide mb-3">
                Logo Request Submitted!
              </h2>
              <p className="text-[#555] font-medium mb-6">
                We'll review your request and reach out soon.
              </p>
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setEmail("");
                  setPhone("");
                  setDescription("");
                }}
                className="font-black uppercase tracking-wider px-8 py-3 text-white text-sm bg-[#FF5500] border-4 border-[#111] rounded-none h-auto hover:bg-[#FFD200] hover:text-[#111] transition-colors"
                data-ocid="logo_request.secondary_button"
              >
                Submit Another Request
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white border-4 border-[#111111] p-8 space-y-6"
              data-ocid="logo_request.panel"
            >
              <div className="border-l-4 border-[#FF5500] pl-4 mb-2">
                <h2 className="font-['Bebas_Neue'] text-3xl text-[#111] tracking-wide">
                  Your Details
                </h2>
              </div>

              {/* Name */}
              <div>
                <Label className="font-black text-xs uppercase tracking-widest text-[#111] mb-1 block">
                  Full Name *
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="border-2 border-[#111] rounded-none focus-visible:ring-[#FF5500]"
                  data-ocid="logo_request.input"
                />
              </div>

              {/* Email */}
              <div>
                <Label className="font-black text-xs uppercase tracking-widest text-[#111] mb-1 block">
                  Email *
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  required
                  className="border-2 border-[#111] rounded-none focus-visible:ring-[#FF5500]"
                  data-ocid="logo_request.input"
                />
              </div>

              {/* Phone */}
              <div>
                <Label className="font-black text-xs uppercase tracking-widest text-[#111] mb-1 block">
                  Phone *
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(623) 555-0100"
                  required
                  className="border-2 border-[#111] rounded-none focus-visible:ring-[#FF5500]"
                  data-ocid="logo_request.input"
                />
              </div>

              <div className="h-1 w-full bg-[#111] opacity-10" />

              <div className="border-l-4 border-[#FFD200] pl-4 mb-2">
                <h2 className="font-['Bebas_Neue'] text-3xl text-[#111] tracking-wide">
                  Logo Details
                </h2>
              </div>

              {/* Description */}
              <div>
                <Label className="font-black text-xs uppercase tracking-widest text-[#111] mb-1 block">
                  Describe Your Logo *
                </Label>
                <p className="text-xs text-[#888] mb-2 font-medium">
                  Include style, colors, symbols, text/company name, and any
                  specific ideas.
                </p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. A bold desert landscape with a cactus silhouette. Company name 'Desert Crew' in all caps above it. Colors: black, orange, and gold."
                  rows={5}
                  required
                  className="border-2 border-[#111] rounded-none resize-y focus-visible:ring-[#FF5500]"
                  data-ocid="logo_request.textarea"
                />
              </div>

              {error && (
                <p
                  className="text-sm font-bold text-red-600 text-center py-2 border-2 border-red-200 bg-red-50"
                  data-ocid="logo_request.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting || isFetching}
                className="w-full font-black uppercase tracking-wider py-4 text-white text-sm bg-[#FF5500] border-4 border-[#111] rounded-none h-auto hover:bg-[#FFD200] hover:text-[#111] transition-colors disabled:opacity-60"
                data-ocid="logo_request.submit_button"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Submitting…
                  </>
                ) : (
                  "Submit Logo Request"
                )}
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
