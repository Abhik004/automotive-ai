"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import AIPanel from "../components/AIPanel";
import ControlPanel from "../components/ControlPanel";
import type { CarPreset } from "../lib/gemini";

const CarViewer = dynamic(() => import("@/components/CarViewer"), { ssr: false });

export default function Home() {
  const [color,  setColor]  = useState("#0A0A0A");
  const [accent, setAccent] = useState("#C9A84C");
  const [wheel,  setWheel]  = useState(0);
  const [finish, setFinish] = useState<"matte"|"gloss"|"metallic">("gloss");
  const [tab,    setTab]    = useState<"ai"|"manual">("ai");
  const [preset, setPreset] = useState<CarPreset | null>(null);

  const applyPreset = useCallback((p: CarPreset) => {
    setPreset(p);
    setColor(p.color);
    setAccent(p.accentColor);
    setWheel(p.wheels);
    setFinish(p.finish);
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 border-b border-white/5 shrink-0"
        style={{ background: "rgba(10,10,15,0.9)", backdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-amber-400 flex items-center justify-center">
            <span className="font-display font-bold text-black text-sm">AV</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-widest leading-none">
              AUTO<span className="text-amber-400">VISION</span>
            </h1>
            <p className="text-[9px] text-white/25 tracking-[0.3em] uppercase mt-0.5">
              AI Car Configurator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {preset && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/8">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: preset.color }} />
              <span className="text-xs text-white/60">{preset.name}</span>
              <span className="text-[10px] text-white/30">· {preset.finish}</span>
            </motion.div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Abhik Samanta (22052610)
          </div>
        </div>
      </motion.header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <CarViewer
            bodyColor={color}
            accentColor={accent}
            wheelIndex={wheel}
            finish={finish}
          />
          <div className="absolute bottom-4 left-4 text-xs text-white/20 font-mono tracking-widest select-none">
            DRAG TO ROTATE · SCROLL TO ZOOM
          </div>
          {/* Color indicator bar at bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            animate={{ background: color }}
            style={{ opacity: 0.6 }}
          />
        </div>

        {/* Side panel */}
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-72 border-l border-white/5 flex flex-col shrink-0"
          style={{ background: "rgba(12,12,18,0.92)", backdropFilter: "blur(20px)" }}
        >
          {/* Tabs */}
          <div className="flex border-b border-white/5 shrink-0">
            {(["ai", "manual"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-3 text-[11px] tracking-[0.2em] uppercase transition-all ${
                  tab === t ? "text-amber-400 border-b-2 border-amber-400" : "text-white/25 hover:text-white/40"
                }`}>
                {t === "ai" ? "✦ AI Suggest" : "Manual"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-4">
            {tab === "ai"
              ? <AIPanel onApplyPreset={applyPreset} />
              : <ControlPanel color={color} wheel={wheel} finish={finish}
                  onColor={setColor} onWheel={setWheel} onFinish={setFinish} />
            }
          </div>

          
        </motion.aside>
      </div>
    </main>
  );
}