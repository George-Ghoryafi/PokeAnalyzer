# 🔴 Competitive Pokédex Simulator

### [**Live Demo: poke-analyzer-bqzk.vercel.app**](https://poke-analyzer-bqzk.vercel.app/)

A professional-grade Pokémon team building and coverage analysis tool. Built for competitive players who need instant, data-driven feedback on team composition, type vulnerabilities, and offensive coverage gaps.

![Pokedex Interface](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pokedex.png)

## ✨ Core Features

### 🖥️ High-Fidelity Pokédex Hardware UI
- **Pokedex Aesthetic**: A custom-designed interface that mirrors the look and feel of a high-tech Pokédex.
- **Glassmorphic Components**: Sleek, semi-transparent panels with vibrant "Scan-line" animations.
- **Interactive Tooltips**: custom Pokéball split-door animations that provide deep-dive diagnostic details.

### 📊 Advanced Team Analysis
- **Dynamic Type Engine**: Real-time matchup calculations for single and dual-typed Pokémon, powered by PokeAPI.
- **Heuristic Insights**: Instant algorithmic flagging for **Stacked Weaknesses** (3+ members weak to a type), **Unresisted Threats**, and **Offensive Blindspots**.
- **Utility & Hazard Tracker**: Automatically maps your team's access to Stealth Rock, Spikes, Defog, Rapid Spin, and more.

### 🧠 Expert AI Analyst (Local-First)
- **WebGPU Integration**: Leverages `@mlc-ai/web-llm` to run **Phi-3.5-mini** directly in your browser.
- **Private Inference**: All AI analysis happens on your GPU—no data is ever sent to a server.
- **Context-Aware Advice**: The AI reads your live team state to provide specific tactical recommendations.

### ⚡ Zero-Latency UX
- **TanStack Query (v5)**: Aggressive client-side caching ensures that once a Pokémon is viewed, its data loads instantly for the rest of your session.
- **Infinite Scroll**: Seamlessly browse through 1,000+ Pokémon with zero pagination lag.
- **Prefetch Engine**: Hovering over a Pokémon card prefetches its data, making the transition to the config screen feel instantaneous.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite 8
- **Language**: TypeScript (Strict Mode)
- **State & Caching**: TanStack Query v5 + Persistent LocalStorage Cache
- **Styling**: Tailwind CSS 4 + Headless UI
- **Local AI**: MLC-LLM (WebGPU)
- **Data Source**: PokeAPI

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh) (Recommended) or Node.js

### Installation
1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd team-builder
   ```
3. Install dependencies:
   ```bash
   bun install
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```

### Building for Production
```bash
bun run build
```
The output will be in the `/dist` directory, ready to be deployed to Vercel or Netlify.

## 📜 License
MIT License - Developed with a passion for competitive Pokémon.
