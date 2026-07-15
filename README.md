# NetherGrid — Sentinel Command Center

**Stellar Hack 2026 — Round 2 Submission**
Team: **Lone Nova** · Theme: **Digital Futures — AI & Futuristic Tech (Cybersecurity Operations)**

A real-time cybersecurity command dashboard built for the fictional universe **NetherGrid** — a living digital dimension under attack from a self-replicating rogue AI known as **The Breach**. You play the **Guardian**, the lone operator responsible for keeping the network alive.

🔗 **Live Demo:** [lovely-mermaid-5d8b7c.netlify.app](https://lovely-mermaid-5d8b7c.netlify.app)
📁 **Repo:** [github.com/krishRathiDev/nethergrid-sentinel-dashboard](https://github.com/krishRathiDev/nethergrid-sentinel-dashboard)

---

## What it does

- **Network Map** — a live node graph of NetherGrid. Each node is colour-coded by status (Secure / At Risk / Compromised) and pulses continuously.
- **Alerts Panel** — a real-time threat log that fires automatically as the simulation runs, tagged by severity (Low / Medium / Critical).
- **Control Panel** — select any node to inspect it and respond with **Isolate Node**, **Deploy Patch**, or **Neutralize Threat**.
- **Grid Integrity Meter** — a live health score for the whole network, driven by node status.
- **Mission Clock** — tracks how long the Guardian has been on duty.
- **Breach Spread Graph** — a mini sparkline in the footer tracking compromised-node count over time.
- **Boot Sequence** — a terminal-style intro that sets up the story before handing control to the operator (skippable).

The Breach spreads on its own over time — nodes can silently go from Secure → At Risk → Compromised if the Guardian doesn't act, so there's real pressure to keep scanning the map.

## Tech stack

- Plain **HTML / CSS / JavaScript** (no build step, no framework — runs anywhere)
- **GSAP** (via CDN) for node pulses, alert transitions, and integrity-bar feedback
- **SVG** for the network map and spread graph (no external chart library)
- Google Fonts: **Chakra Petch** (display), **IBM Plex Mono** (data/labels), **Inter** (body)

No backend, no build tools, no dependencies to install — just three files.

## Running it locally

Just open `index.html` in a browser. That's it.

If you prefer a local server (recommended, avoids any browser file:// restrictions):

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node
npx serve .
```

## Deploying it (for the submission link)

**Easiest — Netlify Drop:**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole `sentinel-dashboard` folder onto the page
3. Copy the live URL it gives you

**GitHub Pages:**
1. Push this folder to a public GitHub repo
2. Repo → Settings → Pages → Deploy from branch → `main` / root
3. Your live link will be `https://<username>.github.io/<repo-name>/`

**Vercel:**
1. `npm i -g vercel` then run `vercel` inside this folder, or drag-and-drop the folder at [vercel.com/new](https://vercel.com/new)

## Project structure
