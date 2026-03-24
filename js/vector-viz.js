/* ============================================================
   vector-viz.js
   2D scatter-plot of word-embeddings showing semantic clusters.
   Uses manually-placed coordinates (simulating a t-SNE projection).
   ============================================================ */

const VectorViz = (() => {
  "use strict";

  const WORDS = [
    { label: "bike",      x: 0.15, y: 0.25, cluster: "transport" },
    { label: "bicycle",   x: 0.18, y: 0.30, cluster: "transport" },
    { label: "motorcycle",x: 0.22, y: 0.20, cluster: "transport" },
    { label: "car",       x: 0.35, y: 0.22, cluster: "transport" },
    { label: "truck",     x: 0.40, y: 0.18, cluster: "transport" },
    { label: "bus",       x: 0.38, y: 0.28, cluster: "transport" },
    { label: "red",       x: 0.70, y: 0.70, cluster: "color" },
    { label: "blue",      x: 0.75, y: 0.78, cluster: "color" },
    { label: "green",     x: 0.68, y: 0.82, cluster: "color" },
    { label: "yellow",    x: 0.78, y: 0.72, cluster: "color" },
    { label: "shoe",      x: 0.60, y: 0.35, cluster: "clothing" },
    { label: "sneaker",   x: 0.63, y: 0.40, cluster: "clothing" },
    { label: "boot",      x: 0.57, y: 0.42, cluster: "clothing" },
    { label: "helmet",    x: 0.28, y: 0.55, cluster: "gear" },
    { label: "gloves",    x: 0.32, y: 0.60, cluster: "gear" },
  ];

  const CLUSTER_COLORS = {
    transport: "#0078d4",
    color: "#fa5252",
    clothing: "#40c057",
    gear: "#fd7e14",
  };

  let canvas, ctx, hovered = null, dpr = 1;

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", () => { hovered = null; draw(); });
    draw();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.min(rect.width - 8, 600);
    const h = 380;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function toScreen(wx, wy) {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const pad = 60;
    return {
      x: pad + wx * (w - 2 * pad),
      y: pad + wy * (h - 2 * pad),
    };
  }

  function draw() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = 60 + (i / 10) * (w - 120);
      const y = 60 + (i / 10) * (h - 120);
      ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, h - 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(w - 60, y); ctx.stroke();
    }

    // Cluster hulls (simple bounding ellipse)
    const clusters = {};
    WORDS.forEach(w => {
      if (!clusters[w.cluster]) clusters[w.cluster] = [];
      clusters[w.cluster].push(toScreen(w.x, w.y));
    });
    Object.entries(clusters).forEach(([name, pts]) => {
      const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      let rx = 0, ry = 0;
      pts.forEach(p => {
        rx = Math.max(rx, Math.abs(p.x - cx));
        ry = Math.max(ry, Math.abs(p.y - cy));
      });
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx + 28, ry + 28, 0, 0, Math.PI * 2);
      ctx.fillStyle = CLUSTER_COLORS[name] + "12";
      ctx.strokeStyle = CLUSTER_COLORS[name] + "30";
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();
    });

    // Points
    WORDS.forEach((word, i) => {
      const p = toScreen(word.x, word.y);
      const isHovered = hovered === i;
      const r = isHovered ? 8 : 5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = CLUSTER_COLORS[word.cluster];
      ctx.fill();
      if (isHovered) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Label
      ctx.font = isHovered ? "bold 13px sans-serif" : "12px sans-serif";
      ctx.fillStyle = isHovered ? "#1b1b1b" : "#555";
      ctx.textAlign = "center";
      ctx.fillText(word.label, p.x, p.y - r - 6);
    });

    // Tooltip for hovered
    if (hovered !== null) {
      const word = WORDS[hovered];
      const p = toScreen(word.x, word.y);
      const txt = `[${word.x.toFixed(2)}, ${word.y.toFixed(2)}]`;
      ctx.font = "11px monospace";
      ctx.fillStyle = "rgba(0,0,0,.75)";
      const tm = ctx.measureText(txt);
      const bx = p.x - tm.width / 2 - 6;
      const by = p.y + 14;
      ctx.fillRect(bx, by, tm.width + 12, 22);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(txt, p.x, by + 15);
    }

    // Legend
    let lx = 60, ly = h - 24;
    Object.entries(CLUSTER_COLORS).forEach(([name, color]) => {
      ctx.beginPath();
      ctx.arc(lx, ly, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#555";
      ctx.textAlign = "left";
      ctx.fillText(name, lx + 10, ly + 4);
      lx += ctx.measureText(name).width + 30;
    });
  }

  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hovered = null;
    WORDS.forEach((word, i) => {
      const p = toScreen(word.x, word.y);
      if (Math.hypot(mx - p.x, my - p.y) < 16) hovered = i;
    });
    draw();
  }

  return { init };
})();
