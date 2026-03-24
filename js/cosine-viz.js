/* ============================================================
   cosine-viz.js
   Interactive draggable-vector cosine similarity visualizer.
   Two arrows on a unit circle; user drags tips to change angle.
   ============================================================ */

const CosineViz = (() => {
  "use strict";

  let canvas, ctx, dpr = 1;
  let angleA = 0.5;   // radians
  let angleB = 1.2;
  let dragging = null; // "A" | "B" | null
  const R = 120;       // radius of the circle in CSS px

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onDrag);
    canvas.addEventListener("mouseup", () => { dragging = null; });
    canvas.addEventListener("mouseleave", () => { dragging = null; });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", () => { dragging = null; });
    draw();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.min(rect.width - 8, 440);
    const h = 340;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function center() {
    return { x: (canvas.width / dpr) / 2, y: (canvas.height / dpr) / 2 + 10 };
  }

  function tipPos(angle) {
    const c = center();
    return { x: c.x + Math.cos(angle) * R, y: c.y - Math.sin(angle) * R };
  }

  function draw() {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const c = center();
    ctx.clearRect(0, 0, w, h);

    // Unit circle
    ctx.beginPath();
    ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Angle arc
    const startAngle = Math.min(angleA, angleB);
    const endAngle = Math.max(angleA, angleB);
    ctx.beginPath();
    ctx.arc(c.x, c.y, 36, -endAngle, -startAngle);
    ctx.strokeStyle = "#0078d488";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Theta label
    const midAngle = (angleA + angleB) / 2;
    const lx = c.x + Math.cos(midAngle) * 48;
    const ly = c.y - Math.sin(midAngle) * 48;
    ctx.font = "italic 14px serif";
    ctx.fillStyle = "#0078d4";
    ctx.textAlign = "center";
    ctx.fillText("θ", lx, ly + 4);

    // Vectors
    drawArrow(c, tipPos(angleA), "#0078d4", "A");
    drawArrow(c, tipPos(angleB), "#fa5252", "B");

    // Cosine value
    const cosVal = Math.cos(angleA - angleB);
    const dist = 1 - cosVal;

    // Color for cosine
    const green = [64, 192, 87];
    const red = [250, 82, 82];
    const t = (cosVal + 1) / 2; // map -1..1 to 0..1
    const cr = Math.round(red[0] + (green[0] - red[0]) * t);
    const cg = Math.round(red[1] + (green[1] - red[1]) * t);
    const cb = Math.round(red[2] + (green[2] - red[2]) * t);

    ctx.font = "bold 28px sans-serif";
    ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
    ctx.textAlign = "center";
    ctx.fillText("cos(θ) = " + cosVal.toFixed(3), w / 2, 36);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#5a5a5a";
    ctx.fillText(`Cosine Distance = ${dist.toFixed(3)}`, w / 2, 58);

    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#999";
    ctx.fillText("Drag the arrow tips to change the angle", w / 2, h - 12);
  }

  function drawArrow(from, to, color, label) {
    const headLen = 12;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - 0.4), to.y - headLen * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - headLen * Math.cos(angle + 0.4), to.y - headLen * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Draggable handle circle
    ctx.beginPath();
    ctx.arc(to.x, to.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label
    ctx.font = "bold 14px sans-serif";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(label, to.x + 16 * Math.cos(Math.atan2(to.y - from.y, to.x - from.x)),
                        to.y + 16 * Math.sin(Math.atan2(to.y - from.y, to.x - from.x)) - 4);
  }

  function getAngleFromMouse(mx, my) {
    const c = center();
    return Math.atan2(-(my - c.y), mx - c.x);
  }

  function onDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const tA = tipPos(angleA);
    const tB = tipPos(angleB);
    if (Math.hypot(mx - tA.x, my - tA.y) < 20) dragging = "A";
    else if (Math.hypot(mx - tB.x, my - tB.y) < 20) dragging = "B";
  }

  function onDrag(e) {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const a = getAngleFromMouse(mx, my);
    if (dragging === "A") angleA = a;
    else angleB = a;
    draw();
  }

  function onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    const tA = tipPos(angleA);
    const tB = tipPos(angleB);
    if (Math.hypot(mx - tA.x, my - tA.y) < 30) dragging = "A";
    else if (Math.hypot(mx - tB.x, my - tB.y) < 30) dragging = "B";
  }

  function onTouchMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mx = touch.clientX - rect.left;
    const my = touch.clientY - rect.top;
    const a = getAngleFromMouse(mx, my);
    if (dragging === "A") angleA = a;
    else angleB = a;
    draw();
  }

  return { init };
})();
