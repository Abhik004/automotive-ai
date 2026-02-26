"use client";
import { Palette, CircleDot, Layers } from "lucide-react";

const COLORS = [
  { hex: "#0A0A0A", name: "Obsidian" },   { hex: "#C0392B", name: "Crimson" },
  { hex: "#1A3A6B", name: "Cobalt" },     { hex: "#F0F0EE", name: "Pearl" },
  { hex: "#1A6B3A", name: "Emerald" },    { hex: "#D4A017", name: "Gold" },
  { hex: "#6B1A6B", name: "Violet" },     { hex: "#2C3E50", name: "Slate" },
  { hex: "#E87722", name: "Burnt Orange" },{ hex: "#00B4D8", name: "Cyan" },
];
const WHEELS  = ["Standard", "Sport", "Premium"];
const FINISHES: Array<"matte" | "gloss" | "metallic"> = ["matte", "gloss", "metallic"];

interface Props {
  color: string; wheel: number; finish: "matte" | "gloss" | "metallic";
  onColor: (h: string) => void; onWheel: (i: number) => void;
  onFinish: (f: "matte" | "gloss" | "metallic") => void;
}

export default function ControlPanel({ color, wheel, finish, onColor, onWheel, onFinish }: Props) {
  return (
    <div className="flex flex-col gap-5">

      {/* Color */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Palette size={13} className="text-amber-400" />
          <span className="text-[11px] tracking-[0.25em] text-white/50 uppercase">Body Color</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map((c) => (
            <button key={c.hex} title={c.name} onClick={() => onColor(c.hex)}
              className={`aspect-square rounded-lg border-2 transition-all ${
                color === c.hex ? "border-amber-400 scale-110 shadow-lg" : "border-transparent hover:border-white/25"}`}
              style={{ background: c.hex }} />
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-white/30">
          {COLORS.find(c => c.hex === color)?.name ?? "Custom"}
        </p>
      </div>

      {/* Wheels */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <CircleDot size={13} className="text-amber-400" />
          <span className="text-[11px] tracking-[0.25em] text-white/50 uppercase">Wheel Style</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {WHEELS.map((w, i) => (
            <button key={w} onClick={() => onWheel(i)}
              className={`px-3 py-2 rounded-lg text-xs text-left transition-all border ${
                wheel === i ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                            : "border-white/8 text-white/40 hover:border-white/20"}`}>
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Finish */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Layers size={13} className="text-amber-400" />
          <span className="text-[11px] tracking-[0.25em] text-white/50 uppercase">Paint Finish</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {FINISHES.map((f) => (
            <button key={f} onClick={() => onFinish(f)}
              className={`py-2 rounded-lg text-xs capitalize transition-all border ${
                finish === f ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
                             : "border-white/8 text-white/40 hover:border-white/20"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}