/* ============================================
   NETHERGRID — SENTINEL COMMAND CENTER
   script.js
   ============================================ */

(function () {
  "use strict";

  /* ----------------------------------------
     0. BOOT SEQUENCE
     ---------------------------------------- */
  const BOOT_LINES = [
    { text: "> INITIALIZING SENTINEL CORE...", cls: "line-dim" },
    { text: "> LOADING NETHERGRID TOPOLOGY MAP...", cls: "line-dim" },
    { text: "> SENTINEL CORE STATUS: SILENT", cls: "line-warn" },
    { text: "> ANOMALY DETECTED: SELF-REPLICATING SIGNATURE 'THE BREACH'", cls: "line-alert" },
    { text: "> ASSIGNING GUARDIAN CLEARANCE... GRANTED", cls: "line-ok" },
    { text: "> HANDING CONTROL TO OPERATOR.", cls: "line-ok" },
    { text: "", cls: "" },
    { text: "Welcome, Guardian. NetherGrid is yours to defend.", cls: "line-ok" },
  ];

  const bootLinesEl = document.getElementById("boot-lines");
  const bootScreen = document.getElementById("boot-screen");
  const skipBtn = document.getElementById("skip-boot");
  const app = document.getElementById("app");

  let bootDone = false;

  function typeLine(lineObj, container, onDone) {
    const span = document.createElement("div");
    if (lineObj.cls) span.className = lineObj.cls;
    container.appendChild(span);
    let i = 0;
    const speed = 14;
    function step() {
      if (i <= lineObj.text.length) {
        span.textContent = lineObj.text.slice(0, i);
        i++;
        setTimeout(step, speed);
      } else {
        onDone();
      }
    }
    step();
  }

  function runBoot() {
    let idx = 0;
    function next() {
      if (bootDone) return;
      if (idx >= BOOT_LINES.length) {
        setTimeout(finishBoot, 500);
        return;
      }
      typeLine(BOOT_LINES[idx], bootLinesEl, () => {
        idx++;
        setTimeout(next, 120);
      });
    }
    next();
  }

  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    if (window.gsap) {
      gsap.to(bootScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          bootScreen.style.display = "none";
          app.classList.remove("hidden");
          gsap.to(app, { opacity: 1, duration: 0.6 });
          startDashboard();
        },
      });
    } else {
      bootScreen.style.display = "none";
      app.classList.remove("hidden");
      app.style.opacity = 1;
      startDashboard();
    }
  }

  skipBtn.addEventListener("click", finishBoot);
  runBoot();

  /* ----------------------------------------
     1. STATE
     ---------------------------------------- */
  const NODE_NAMES = [
    "AUTH-01", "AUTH-02", "RELAY-A", "RELAY-B", "CORE-DB",
    "EDGE-N1", "EDGE-N2", "EDGE-N3", "VAULT-X", "PROXY-7",
    "MESH-04", "GATE-KY",
  ];

  const STATUS = { SECURE: "secure", RISK: "risk", BREACH: "breach" };

  const STATUS_COLOR = {
    [STATUS.SECURE]: "var(--green)",
    [STATUS.RISK]: "var(--yellow)",
    [STATUS.BREACH]: "var(--red)",
  };

  const STATUS_LABEL = {
    [STATUS.SECURE]: "Secure",
    [STATUS.RISK]: "At Risk",
    [STATUS.BREACH]: "Compromised",
  };

  let nodes = [];
  let edges = [];
  let selectedNodeId = null;
  let missionSeconds = 0;
  let spreadHistory = [0];
  let clockInterval = null;
  let simInterval = null;
  let alertInterval = null;

  /* ----------------------------------------
     2. NETWORK GENERATION
     ---------------------------------------- */
  function buildNetwork() {
    const W = 800, H = 480;
    const cols = 4, rows = 3;
    const padX = 90, padY = 80;
    nodes = NODE_NAMES.map((name, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const jitterX = (Math.sin(i * 12.9) * 18);
      const jitterY = (Math.cos(i * 7.3) * 14);
      const x = padX + col * ((W - padX * 2) / (cols - 1)) + jitterX;
      const y = padY + row * ((H - padY * 2) / (rows - 1)) + jitterY;
      return {
        id: "n" + i,
        name,
        x, y,
        status: STATUS.SECURE,
      };
    });

    // seed a couple of initial anomalies for drama
    nodes[4].status = STATUS.RISK;   // CORE-DB
    nodes[8].status = STATUS.BREACH; // VAULT-X

    // simple mesh: connect each node to 2-3 nearby nodes
    edges = [];
    nodes.forEach((n, i) => {
      const next = nodes[(i + 1) % nodes.length];
      edges.push([n.id, next.id]);
      if (i % 3 === 0) {
        const skip = nodes[(i + 4) % nodes.length];
        edges.push([n.id, skip.id]);
      }
    });
  }

  /* ----------------------------------------
     3. RENDER NETWORK MAP
     ---------------------------------------- */
  const svg = document.getElementById("network-svg");
  const NS = "http://www.w3.org/2000/svg";

  function renderNetwork() {
    svg.innerHTML = "";

    // edges
    edges.forEach(([a, b]) => {
      const na = nodes.find((n) => n.id === a);
      const nb = nodes.find((n) => n.id === b);
      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", na.x);
      line.setAttribute("y1", na.y);
      line.setAttribute("x2", nb.x);
      line.setAttribute("y2", nb.y);
      line.setAttribute("class", "map-edge");
      svg.appendChild(line);
    });

    // nodes
    nodes.forEach((n) => {
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", "map-node" + (n.id === selectedNodeId ? " selected" : ""));
      g.setAttribute("tabindex", "0");
      g.setAttribute("role", "button");
      g.setAttribute("aria-label", n.name + " — " + STATUS_LABEL[n.status]);
      g.dataset.id = n.id;

      const halo = document.createElementNS(NS, "circle");
      halo.setAttribute("class", "node-halo");
      halo.setAttribute("cx", n.x);
      halo.setAttribute("cy", n.y);
      halo.setAttribute("r", 14);
      halo.setAttribute("fill", STATUS_COLOR[n.status]);
      g.appendChild(halo);

      const core = document.createElementNS(NS, "circle");
      core.setAttribute("class", "node-core");
      core.setAttribute("cx", n.x);
      core.setAttribute("cy", n.y);
      core.setAttribute("r", 7);
      core.setAttribute("fill", STATUS_COLOR[n.status]);
      core.setAttribute("stroke", "rgba(255,255,255,0.4)");
      g.appendChild(core);

      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", n.x);
      label.setAttribute("y", n.y + 24);
      label.textContent = n.name;
      g.appendChild(label);

      g.addEventListener("click", () => selectNode(n.id));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectNode(n.id); }
      });

      svg.appendChild(g);

      if (window.gsap) {
        gsap.to(halo, {
          r: n.status === STATUS.BREACH ? 20 : 17,
          opacity: n.status === STATUS.SECURE ? 0.15 : 0.4,
          duration: n.status === STATUS.BREACH ? 0.6 : 1.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: Math.random() * 0.6,
        });
      }
    });

    updateEdgeActivity();
  }

  function updateEdgeActivity() {
    const lines = svg.querySelectorAll(".map-edge");
    lines.forEach((line) => line.classList.remove("edge-active"));
    // highlight edges touching risky/breached nodes
    const badIds = nodes.filter((n) => n.status !== STATUS.SECURE).map((n) => n.id);
    edges.forEach(([a, b], i) => {
      if (badIds.includes(a) || badIds.includes(b)) {
        lines[i] && lines[i].classList.add("edge-active");
      }
    });
  }

  /* ----------------------------------------
     4. NODE SELECTION / DETAIL / ACTIONS
     ---------------------------------------- */
  const nodeEmpty = document.getElementById("node-empty");
  const nodeDetail = document.getElementById("node-detail");
  const detailName = document.getElementById("detail-name");
  const detailStatus = document.getElementById("detail-status");
  const detailDesc = document.getElementById("detail-desc");
  const actionFeedback = document.getElementById("action-feedback");
  const btnIsolate = document.getElementById("btn-isolate");
  const btnPatch = document.getElementById("btn-patch");
  const btnNeutralize = document.getElementById("btn-neutralize");

  const DESC_BY_STATUS = {
    [STATUS.SECURE]: "No anomalies detected on this node. All traffic patterns nominal.",
    [STATUS.RISK]: "Unusual traffic detected. The Breach may be probing this node's defenses.",
    [STATUS.BREACH]: "This node has been compromised. The Breach is actively corrupting local data.",
  };

  function selectNode(id) {
    selectedNodeId = id;
    renderNetwork();
    const n = nodes.find((x) => x.id === id);
    nodeEmpty.classList.add("hidden");
    nodeDetail.classList.remove("hidden");
    detailName.textContent = n.name;
    detailStatus.textContent = STATUS_LABEL[n.status];
    detailStatus.className = "node-detail-status status-" + n.status;
    detailDesc.textContent = DESC_BY_STATUS[n.status];
    actionFeedback.textContent = "";
    syncActionButtons(n);
  }

  function syncActionButtons(n) {
    btnIsolate.disabled = n.status === STATUS.SECURE;
    btnPatch.disabled = n.status === STATUS.SECURE;
    btnNeutralize.disabled = n.status !== STATUS.BREACH;
  }

  function applyAction(type) {
    const n = nodes.find((x) => x.id === selectedNodeId);
    if (!n) return;

    if (type === "isolate") {
      pushAlert("medium", n.name + " isolated from network. Spread contained locally.");
      actionFeedback.textContent = "✓ " + n.name + " isolated — no further spread from this node.";
      if (n.status === STATUS.RISK) n.status = STATUS.SECURE;
    }
    if (type === "patch") {
      if (n.status === STATUS.RISK) {
        n.status = STATUS.SECURE;
        pushAlert("low", n.name + " patched. Node restored to secure status.");
        actionFeedback.textContent = "✓ Patch deployed — " + n.name + " is secure again.";
      } else if (n.status === STATUS.BREACH) {
        pushAlert("medium", "Patch attempted on " + n.name + " — partial success, threat persists.");
        actionFeedback.textContent = "⚠ Patch weakened the breach, but full neutralization is still required.";
        n.status = STATUS.RISK;
      }
    }
    if (type === "neutralize") {
      if (n.status === STATUS.BREACH) {
        n.status = STATUS.SECURE;
        pushAlert("low", "The Breach neutralized on " + n.name + ". Node fully restored.");
        actionFeedback.textContent = "✓ Threat neutralized — " + n.name + " is fully secure.";
      }
    }

    renderNetwork();
    selectNode(n.id);
    updateStats();
    pulseIntegrity();
  }

  btnIsolate.addEventListener("click", () => applyAction("isolate"));
  btnPatch.addEventListener("click", () => applyAction("patch"));
  btnNeutralize.addEventListener("click", () => applyAction("neutralize"));

  /* ----------------------------------------
     5. ALERTS FEED
     ---------------------------------------- */
  const alertsList = document.getElementById("alerts-list");
  const alertCount = document.getElementById("alert-count");
  let totalAlerts = 0;

  const RANDOM_ALERT_MESSAGES = [
    { sev: "low", msg: "Routine scan completed on {node}. No issues found." },
    { sev: "medium", msg: "Unusual packet burst detected near {node}." },
    { sev: "critical", msg: "The Breach signature detected attempting entry via {node}." },
  ];

  function pushAlert(sev, msg) {
    totalAlerts++;
    alertCount.textContent = totalAlerts;

    const item = document.createElement("div");
    item.className = "alert-item sev-" + sev;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    item.innerHTML =
      '<span class="sev-tag">' + sev + '</span>' +
      '<span class="alert-time">' + time + '</span>' +
      '<span class="alert-msg"></span>';
    item.querySelector(".alert-msg").textContent = msg;

    alertsList.prepend(item);
    if (window.gsap) {
      gsap.from(item, { opacity: 0, x: -12, duration: 0.35, ease: "power2.out" });
    }

    // cap list length
    while (alertsList.children.length > 40) {
      alertsList.removeChild(alertsList.lastChild);
    }
  }

  function randomAmbientAlert() {
    const pick = RANDOM_ALERT_MESSAGES[Math.floor(Math.random() * RANDOM_ALERT_MESSAGES.length)];
    const node = nodes[Math.floor(Math.random() * nodes.length)];
    pushAlert(pick.sev, pick.msg.replace("{node}", node.name));
  }

  /* ----------------------------------------
     6. BREACH SPREAD SIMULATION
     ---------------------------------------- */
  function simulateSpread() {
    // small chance a secure node becomes at-risk, or at-risk becomes breached
    const secureNodes = nodes.filter((n) => n.status === STATUS.SECURE);
    const riskNodes = nodes.filter((n) => n.status === STATUS.RISK);

    if (riskNodes.length && Math.random() < 0.28) {
      const target = riskNodes[Math.floor(Math.random() * riskNodes.length)];
      target.status = STATUS.BREACH;
      pushAlert("critical", "The Breach has fully compromised " + target.name + "!");
    } else if (secureNodes.length && Math.random() < 0.22) {
      const target = secureNodes[Math.floor(Math.random() * secureNodes.length)];
      target.status = STATUS.RISK;
      pushAlert("medium", target.name + " flagged at risk — anomalous behavior detected.");
    }

    renderNetwork();
    if (selectedNodeId) {
      const n = nodes.find((x) => x.id === selectedNodeId);
      if (n) selectNode(n.id);
    }
    updateStats();
    pulseIntegrity();
  }

  /* ----------------------------------------
     7. STATS / INTEGRITY / FOOTER GRAPH
     ---------------------------------------- */
  const integrityFill = document.getElementById("integrity-fill");
  const integrityValue = document.getElementById("integrity-value");
  const integrityBar = document.getElementById("integrity-bar");
  const statSecure = document.getElementById("stat-secure");
  const statRisk = document.getElementById("stat-risk");
  const statBreach = document.getElementById("stat-breach");
  const spreadGraph = document.getElementById("spread-graph");

  function computeIntegrity() {
    const total = nodes.length;
    const weighted =
      nodes.filter((n) => n.status === STATUS.SECURE).length * 1 +
      nodes.filter((n) => n.status === STATUS.RISK).length * 0.4;
    return Math.round((weighted / total) * 100);
  }

  function updateStats() {
    const secure = nodes.filter((n) => n.status === STATUS.SECURE).length;
    const risk = nodes.filter((n) => n.status === STATUS.RISK).length;
    const breach = nodes.filter((n) => n.status === STATUS.BREACH).length;

    statSecure.textContent = secure;
    statRisk.textContent = risk;
    statBreach.textContent = breach;

    spreadHistory.push(breach);
    if (spreadHistory.length > 24) spreadHistory.shift();
    renderSpreadGraph();

    const pct = computeIntegrity();
    integrityFill.style.width = pct + "%";
    integrityValue.textContent = pct + "%";
    integrityBar.setAttribute("aria-valuenow", pct);

    let color = "linear-gradient(90deg, var(--green), var(--cyan))";
    if (pct < 40) color = "linear-gradient(90deg, var(--red), var(--yellow))";
    else if (pct < 70) color = "linear-gradient(90deg, var(--yellow), var(--cyan))";
    integrityFill.style.background = color;
  }

  function pulseIntegrity() {
    if (!window.gsap) return;
    gsap.fromTo(integrityBar, { boxShadow: "0 0 0px rgba(0,229,255,0)" }, {
      boxShadow: "0 0 14px rgba(0,229,255,0.5)",
      duration: 0.25,
      yoyo: true,
      repeat: 1,
    });
  }

  function renderSpreadGraph() {
    const W = 220, H = 40;
    const max = Math.max(4, ...spreadHistory);
    const stepX = W / Math.max(1, spreadHistory.length - 1);
    let pathD = "";
    spreadHistory.forEach((v, i) => {
      const x = i * stepX;
      const y = H - (v / max) * (H - 4) - 2;
      pathD += (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1) + " ";
    });
    const fillD = pathD + "L" + W + "," + H + " L0," + H + " Z";

    spreadGraph.innerHTML =
      '<path class="spread-fill" d="' + fillD + '"></path>' +
      '<path class="spread-line" d="' + pathD.trim() + '"></path>';
  }

  /* ----------------------------------------
     8. MISSION CLOCK
     ---------------------------------------- */
  const clockEl = document.getElementById("mission-clock");
  function tickClock() {
    missionSeconds++;
    const h = String(Math.floor(missionSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((missionSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(missionSeconds % 60).padStart(2, "0");
    clockEl.textContent = h + ":" + m + ":" + s;
  }

  /* ----------------------------------------
     9. TOAST (hook for Evolution Challenge)
     ---------------------------------------- */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  window.showToast = function (msg, duration) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), duration || 3500);
  };

  /* ----------------------------------------
     10. BOOTSTRAP DASHBOARD
     ---------------------------------------- */
  function startDashboard() {
    buildNetwork();
    renderNetwork();
    updateStats();

    pushAlert("critical", "VAULT-X reporting active compromise on startup.");
    pushAlert("medium", "CORE-DB flagged at risk during initial scan.");

    clockInterval = setInterval(tickClock, 1000);
    alertInterval = setInterval(randomAmbientAlert, 7000);
    simInterval = setInterval(simulateSpread, 9000);

    setTimeout(() => {
      window.showToast("SYSTEM: Guardian protocols fully online. Stay sharp.");
    }, 900);
  }

  /* ----------------------------------------
     11. PUBLIC HOOK — for the Evolution Challenge
     Exposes a minimal API so a late-breaking twist
     can be wired in without refactoring the app.
     ---------------------------------------- */
  window.NetherGrid = {
    getNodes: () => nodes,
    setNodeStatus: (id, status) => {
      const n = nodes.find((x) => x.id === id);
      if (n && STATUS[status.toUpperCase()]) {
        n.status = STATUS[status.toUpperCase()];
        renderNetwork();
        updateStats();
      }
    },
    pushAlert,
    showToast: (msg, d) => window.showToast(msg, d),
  };
})();
