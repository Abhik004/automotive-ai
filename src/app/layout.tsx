import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoVision AI — 3D Car Configurator",
  description: "Real-time 3D car customization powered by Generative AI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}