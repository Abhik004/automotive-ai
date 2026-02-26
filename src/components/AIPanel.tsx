"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ChevronRight } from "lucide-react";
import type { CarPreset } from "../lib/gemini";

interface Props {
  onApplyPreset: (preset: CarPreset) => void;
}

const THEMES = ["Sporty", "Luxury", "Stealth", "Futuristic", "Vintage", "Off-Road"];
const FINISH_COLOR: Record<string, string> = {
  matte: "bg-zinc-500", gloss: "bg-sky-500", metallic: "bg-amber-500",
};

export default function AIPanel({ onApplyPreset }: Props) {
  const [theme, setTheme]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [presets, setPresets]   = useState<CarPreset[]>([]);
  const [active, setActive]     = useState<number | null>(null);
  const [error, setError]       = useState("");

  async function generate() {
    if (!theme.trim()) return;
    setLoading(true); setError(""); setPresets([]);
    try {
      const res  = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPresets(data.suggestions);
    } catch {
      setError("Generation failed. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  function apply(preset: CarPreset, i: number) {
    setActive(i);
    onApplyPreset(preset);
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        <span className="text-[11px] tracking-[0.3em] text-white/50 uppercase">AI Configurator</span>
      </div>

      {/* Quick themes */}
      <div className="flex flex-wrap gap-1.5">
        {THEMES.map((t) => (
          <button key={t} onClick={() => setTheme(t)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-all ${
              theme === t ? "border-amber-400 text-amber-400 bg-amber-400/10"
                         : "border-white/15 text-white/40 hover:border-white/30"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Input + button */}
      <div className="flex gap-2">
        <input
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="Type a theme..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-amber-400/50 transition-colors"
        />
        <button onClick={generate} disabled={loading || !theme.trim()}
          className="px-3 py-2 bg-amber-400 text-black rounded-lg font-bold text-sm disabled:opacity-40 hover:bg-amber-300 transition-colors">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
        </button>
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Preset cards */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
        <AnimatePresence>
          {presets.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              onClick={() => apply(p, i)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                active === i
                  ? "border-amber-400/70 bg-amber-400/10"
                  : "border-white/8 bg-white/4 hover:border-white/20"}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: p.color }} />
                  <span className={`text-[10px] px-1.5 py-0.5 rounded text-white/90 ${FINISH_COLOR[p.finish]}`}>
                    {p.finish}
                  </span>
                </div>
              </div>
              <p className="text-xs text-white/45 leading-relaxed">{p.description}</p>
              <div className="mt-2 flex gap-3 text-[10px] text-white/30">
                <span>🎨 {p.colorName}</span>
                <span>🔩 {p.wheelName}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {presets.length === 0 && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Sparkles size={24} className="text-white/15" />
            <p className="text-xs text-white/25">Pick a theme and let AI<br />design your car</p>
          </div>
        )}
      </div>
    </div>
  );
}