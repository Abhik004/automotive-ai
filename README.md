# 🚗 AutoVision AI - 3D Car Configurator

> An interactive automotive showcase built with **Next.js**, **Three.js**, and **Gemini AI** ; letting users customize a 3D car model in real-time and receive AI-generated configuration presets based on themes.

---

## ✨ Features Implemented

### 🎮 Interactive 3D Car Viewer
- Real-time 3D car rendered entirely with **Three.js geometry** , no external model files required
- **Drag to orbit** the car with mouse or touch input
- **Scroll to zoom** in and out
- **Auto-rotate** when idle, pauses on interaction and resumes after 2 seconds
- Smooth **ACES Filmic tone mapping** for cinematic visual quality
- Dynamic **ground shadow** and a color-reactive **glow ring** beneath the car

### 🎨 Body Color Customization
- 10 preset paint colors including Obsidian, Crimson, Cobalt, Pearl, Emerald, Gold, Violet, Slate, Burnt Orange, and Cyan
- All body panels update **instantly** in real-time : hood, cabin, bumpers, doors, mirrors
- Color changes also reflect in the ambient ground ring for full scene immersion

### 🔩 Wheel Style Switching
- 3 distinct wheel designs built with Three.js geometry:
  - **Standard** : classic 5-spoke alloy
  - **Sport** : twin-spoke with accent color highlights
  - **Premium** : turbine/mesh blade with gold metallic finish
- Wheels switch live with a single click, no reload needed

### 🪣 Paint Finish Selection
- 3 finish types that change the material's physical properties:
  - **Matte** : low roughness, non-reflective surface
  - **Gloss** : high smoothness, mirror-like sheen
  - **Metallic** : full metalness with mid roughness for a chrome-like effect
- Uses **PBR (Physically Based Rendering)** via Three.js `MeshStandardMaterial`

### 💡 Dynamic Lighting
- **Key light** : warm directional light simulating a studio spotlight
- **Rim light** : white point light behind the car for edge definition
- **Fill light** : cool blue point light for depth and contrast
- **Ground light** : subtle upward light for underbody ambient fill

### 🤖 Gemini AI Suggestion Panel
- Type any theme or pick from quick-select chips
- Gemini generates **5 unique car presets** tailored to the theme
- Each preset includes color, color name, wheel style, paint finish, accent color, and a one-line description
- Clicking a preset **applies all settings simultaneously** to the live 3D car
- Staggered card animations on load for a polished feel

### 🖥️ UI / UX
- Dark luxury automotive aesthetic , carbon black with gold accents
- **Rajdhani** display font paired with **DM Sans** for body text
- Tabbed side panel : switch between AI Suggest and Manual controls
- Active preset shown in the header with live color swatch
- Fully responsive layout, works on desktop and tablet

---

## 🤖 Generative AI Component

### How It Works

The AI component uses **Google Gemini 2.5 Flash** via the `@google/generative-ai` SDK. When a user enters a theme (e.g. *"Luxury"*, *"Stealth"*, *"Futuristic"*), the following happens:

1. The theme is sent from the frontend to a **Next.js API Route** (`/api/suggest`)
2. The server calls Gemini with a structured prompt asking for exactly 5 car configuration presets
3. Gemini returns a **JSON array** of presets - each containing color hex, wheel style index, paint finish, accent color, and a description
4. The frontend parses and renders the presets as interactive cards
5. Clicking any card **instantly applies** all its values to the live 3D car

### Why Gemini 2.5 Flash

- Fast response time : ideal for real-time interactive experiences
- Strong structured JSON output : reliable parsing without schema enforcement
- Free tier available via [Google AI Studio](https://aistudio.google.com)



### Prompt Design

The prompt explicitly instructs Gemini to:
- Return **only** a raw JSON array (no markdown, no explanation)
- Use valid hex codes for colors
- Constrain `wheels` to `0`, `1`, or `2`
- Constrain `finish` to exactly `"matte"`, `"gloss"`, or `"metallic"`

A cleanup step strips any accidental markdown fences before `JSON.parse()`.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- A **Gemini API key** get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/automotive-ai.git
cd automotive-ai

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# or just create .env.local manually
```

### Environment Setup

Create a `.env.local` file in the root of the project:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 🕹️ How to Interact

### 3D Car Viewer (Left Panel)

| Action | How |
|---|---|
| Rotate the car | Click and drag anywhere on the 3D view |
| Zoom in / out | Scroll the mouse wheel |
| Auto-rotate | Just wait, it resumes automatically after 2 seconds |

### Manual Controls (Right Panel → "Manual" tab)

| Control | What It Does |
|---|---|
| Color swatches (grid of 10) | Changes the car body color instantly |
| Wheel buttons (Standard / Sport / Premium) | Swaps the wheel style on all 4 wheels |
| Finish buttons (Matte / Gloss / Metallic) | Changes the paint material properties |

### AI Configurator (Right Panel → "✦ AI Suggest" tab)

| Step | Action |
|---|---|
| 1 | Click a quick-theme chip : **Sporty, Luxury, Stealth, Futuristic, Vintage, Off-Road** |
| 2 | Or type your own theme in the text input |
| 3 | Press **Enter** or click the **→** button |
| 4 | Wait ~2 seconds for Gemini to generate 5 presets |
| 5 | Click any preset card to apply it to the car instantly |

---

## 🗂️ Project Structure

```
automotive-ai/
├── app/
│   ├── api/
│   │   └── suggest/
│   │       └── route.ts        # Gemini API route
│   ├── globals.css             # Global styles + fonts
│   ├── layout.tsx              # Root layout + metadata
│   └── page.tsx                # Main page + state management
├── components/
│   ├── CarViewer.tsx           # Three.js 3D car (client-only)
│   ├── AIPanel.tsx             # Gemini AI suggestion panel
│   └── ControlPanel.tsx        # Manual color/wheel/finish controls
├── lib/
│   └── gemini.ts               # Gemini SDK wrapper + types
├── public/                     # Static assets
├── .env.local                  # API keys (not committed)
├── package.json
└── README.md
```

---

## 📦 Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js 15](https://nextjs.org) | React framework, API routes, SSR |
| [Three.js](https://threejs.org) | 3D rendering engine |
| [Gemini 2.5 Flash](https://ai.google.dev) | AI car configuration generation |
| [Framer Motion](https://www.framer.com/motion/) | UI animations |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [Lucide React](https://lucide.dev) | Icon library |
| TypeScript | Type safety throughout |

---

---

<p align="center">Built for the Metadome Solutions Engineer Evaluation · 2026</p>