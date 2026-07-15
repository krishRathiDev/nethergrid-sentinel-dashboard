# NetherGrid — Sentinel Command Center

**Stellar Hack 2026 — Round 2 Submission**
Team: **Lone Nova** · Theme: **Digital Futures — AI & Futuristic Tech (Cybersecurity Operations)**

A real-time cybersecurity command dashboard built for the fictional universe **NetherGrid** — a living digital dimension under attack from a self-replicating rogue AI known as **The Breach**. You play the **Guardian**, the lone operator responsible for keeping the network alive.

🔗 **Live Demo:** _add your deployed link here_
📁 **Repo:** _add your GitHub repo link here_

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

```
sentinel-dashboard/
├── index.html      # markup / structure
├── styles.css      # design system + layout + animation styles
├── script.js       # network simulation, state, rendering, interactions
└── README.md
```

## Extending it (Evolution Challenge ready)

`script.js` exposes a small public API on `window.NetherGrid` so a late-breaking twist can be wired in fast without touching the rest of the app:

```js
NetherGrid.getNodes();                     // read current node states
NetherGrid.setNodeStatus("n3", "breach");  // force a node into a status
NetherGrid.pushAlert("critical", "...");   // inject a new alert
NetherGrid.showToast("...", 4000);         // show a system-wide banner message
```

Whatever the surprise challenge turns out to be, wire it in through this API first — it keeps the diff small and the demo stable.

## Story reference (from Round 1)

- **Universe:** NetherGrid — data packets are citizens, servers are cities, firewalls are borders.
- **Mission:** Operation Sentinel Restore — rebuild network defense and contain The Breach.
- **Primary user:** The Guardian — sole operator of the Sentinel Dashboard.
