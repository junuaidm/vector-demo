/* ============================================================
   cosine-walkthrough.js
   "Hello World" step-by-step cosine similarity animation.
   4 sub-steps: Words→Numbers, Dot Product, Magnitudes, Divide.
   ============================================================ */

const CosineWalkthrough = (() => {
  "use strict";

  /* ---- Toy vocabulary & vectors ---- */
  const VOCAB = ["hello", "hi", "world", "how", "are"];
  const SENTENCE_A = { text: "Hello World", vec: [1, 0, 1, 0, 0] };
  const SENTENCE_B = { text: "Hi World",    vec: [0, 1, 1, 0, 0] };

  let currentStep = 0;
  const TOTAL_STEPS = 4;
  let container = null;
  let animTimer = null;
  let isAutoPlaying = false;

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;
    currentStep = 0;
    render();
  }

  function nextStep() {
    if (currentStep < TOTAL_STEPS) { currentStep++; render(); }
  }

  function prevStep() {
    if (currentStep > 0) { currentStep--; render(); }
  }

  function reset() {
    currentStep = 0;
    stopAutoPlay();
    render();
  }

  function autoPlay() {
    if (isAutoPlaying) { stopAutoPlay(); return; }
    isAutoPlaying = true;
    currentStep = 0;
    render();
    animTimer = setInterval(() => {
      if (currentStep < TOTAL_STEPS) { currentStep++; render(); }
      else stopAutoPlay();
    }, 2000);
  }

  function stopAutoPlay() {
    isAutoPlaying = false;
    if (animTimer) { clearInterval(animTimer); animTimer = null; }
    updateControls();
  }

  function render() {
    if (!container) return;
    const stage = container.querySelector(".walkthrough-stage");
    if (!stage) return;

    stage.innerHTML = "";

    if (currentStep === 0) renderIntro(stage);
    else if (currentStep === 1) renderVectors(stage);
    else if (currentStep === 2) renderDotProduct(stage);
    else if (currentStep === 3) renderMagnitudes(stage);
    else if (currentStep === 4) renderResult(stage);

    updateControls();
  }

  function updateControls() {
    const indicator = container.querySelector(".step-indicator");
    const prevBtn = container.querySelector("[data-action=prev]");
    const nextBtn = container.querySelector("[data-action=next]");
    const autoBtn = container.querySelector("[data-action=auto]");

    if (indicator) indicator.textContent = `Step ${currentStep} / ${TOTAL_STEPS}`;
    if (prevBtn) prevBtn.disabled = currentStep === 0;
    if (nextBtn) nextBtn.disabled = currentStep >= TOTAL_STEPS;
    if (autoBtn) autoBtn.textContent = isAutoPlaying ? "⏸ Pause" : "▶ Auto-play";
  }

  /* ---- Step Renderers ---- */

  function renderIntro(stage) {
    stage.innerHTML = `
      <div style="text-align:center;padding:36px 16px;">
        <h3 style="margin-bottom:12px;">Let's compute cosine similarity — step by step!</h3>
        <p style="color:#5a5a5a;">We'll compare two tiny sentences using a simple 5-word vocabulary.</p>
        <div style="display:flex;gap:24px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
          <div style="background:#deecf9;padding:16px 24px;border-radius:8px;">
            <strong style="color:#0078d4;">Sentence A</strong><br>"${SENTENCE_A.text}"
          </div>
          <div style="background:#e3fafc;padding:16px 24px;border-radius:8px;">
            <strong style="color:#50e6ff;">Sentence B</strong><br>"${SENTENCE_B.text}"
          </div>
        </div>
        <p style="margin-top:16px;color:#999;font-size:13px;">Click <strong>Next Step</strong> to begin.</p>
      </div>`;
  }

  function renderVectors(stage) {
    stage.innerHTML = `
      <h3>Step 1: Words → Numbers</h3>
      <p>Each word in our vocabulary gets a slot. If the sentence contains that word, the slot = 1, otherwise 0.</p>
      <div style="overflow-x:auto;">
        <table style="margin:16px auto;border-collapse:collapse;text-align:center;">
          <tr>
            <td></td>
            ${VOCAB.map(w => `<th style="padding:8px 12px;font-size:13px;color:#555;">${w}</th>`).join("")}
          </tr>
          <tr>
            <td class="vector-label">A: "${SENTENCE_A.text}"</td>
            ${SENTENCE_A.vec.map(v => `<td><span class="vector-cell highlight-a">${v}</span></td>`).join("")}
          </tr>
          <tr>
            <td class="vector-label">B: "${SENTENCE_B.text}"</td>
            ${SENTENCE_B.vec.map(v => `<td><span class="vector-cell highlight-b">${v}</span></td>`).join("")}
          </tr>
        </table>
      </div>
      <p style="font-size:13px;color:#999;text-align:center;">Vocabulary: [${VOCAB.join(", ")}] — each word maps to one dimension.</p>`;
  }

  function renderDotProduct(stage) {
    const pairs = VOCAB.map((w, i) => ({
      word: w,
      a: SENTENCE_A.vec[i],
      b: SENTENCE_B.vec[i],
      product: SENTENCE_A.vec[i] * SENTENCE_B.vec[i],
    }));
    const dotProduct = pairs.reduce((s, p) => s + p.product, 0);

    stage.innerHTML = `
      <h3>Step 2: Dot Product</h3>
      <p>Multiply each pair of elements and sum them together.</p>
      <div style="overflow-x:auto;">
        <table style="margin:16px auto;border-collapse:collapse;text-align:center;">
          <tr><td></td>${VOCAB.map(w => `<th style="padding:8px 10px;font-size:12px;color:#555;">${w}</th>`).join("")}<th style="padding:8px 10px;"></th></tr>
          <tr>
            <td class="vector-label">A[i]</td>
            ${SENTENCE_A.vec.map(v => `<td><span class="vector-cell highlight-a">${v}</span></td>`).join("")}
            <td></td>
          </tr>
          <tr>
            <td class="vector-label">B[i]</td>
            ${SENTENCE_B.vec.map(v => `<td><span class="vector-cell highlight-b">${v}</span></td>`).join("")}
            <td></td>
          </tr>
          <tr>
            <td class="vector-label">A×B</td>
            ${pairs.map(p => `<td><span class="vector-cell highlight-result">${p.product}</span></td>`).join("")}
            <td style="padding-left:12px;">
              <span style="font-size:20px;font-weight:700;">= ${dotProduct}</span>
            </td>
          </tr>
        </table>
      </div>
      <p style="text-align:center;font-size:14px;margin-top:8px;">
        <strong>A · B = ${pairs.map(p => `${p.a}×${p.b}`).join(" + ")} = ${dotProduct}</strong>
      </p>`;
  }

  function renderMagnitudes(stage) {
    const magA = Math.sqrt(SENTENCE_A.vec.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(SENTENCE_B.vec.reduce((s, v) => s + v * v, 0));

    stage.innerHTML = `
      <h3>Step 3: Magnitudes</h3>
      <p>Compute the length (L2 norm) of each vector.</p>
      <div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap;margin:20px 0;">
        <div style="text-align:center;">
          <div style="font-size:14px;color:#555;margin-bottom:8px;">|A| = √(${SENTENCE_A.vec.map(v => v + "²").join(" + ")})</div>
          <div style="font-size:28px;font-weight:700;color:#0078d4;">${magA.toFixed(4)}</div>
          ${renderMagBar(magA, 2, "#0078d4")}
        </div>
        <div style="text-align:center;">
          <div style="font-size:14px;color:#555;margin-bottom:8px;">|B| = √(${SENTENCE_B.vec.map(v => v + "²").join(" + ")})</div>
          <div style="font-size:28px;font-weight:700;color:#50e6ff;">${magB.toFixed(4)}</div>
          ${renderMagBar(magB, 2, "#0078d4")}
        </div>
      </div>
      <p style="text-align:center;font-size:14px;">
        <strong>|A| × |B| = ${magA.toFixed(4)} × ${magB.toFixed(4)} = ${(magA * magB).toFixed(4)}</strong>
      </p>`;
  }

  function renderMagBar(val, max, color) {
    const pct = Math.min(100, (val / max) * 100);
    return `<div style="width:180px;height:14px;background:#eee;border-radius:7px;margin:8px auto;overflow:hidden;">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:7px;transition:width .6s;"></div>
    </div>`;
  }

  function renderResult(stage) {
    const dotProduct = SENTENCE_A.vec.reduce((s, v, i) => s + v * SENTENCE_B.vec[i], 0);
    const magA = Math.sqrt(SENTENCE_A.vec.reduce((s, v) => s + v * v, 0));
    const magB = Math.sqrt(SENTENCE_B.vec.reduce((s, v) => s + v * v, 0));
    const cosine = dotProduct / (magA * magB);
    const distance = 1 - cosine;

    const pct = ((cosine + 1) / 2) * 100; // map -1..1 to 0..100

    stage.innerHTML = `
      <h3>Step 4: Divide → Cosine Score</h3>
      <div style="text-align:center;margin:20px 0;">
        <div style="font-size:16px;color:#555;margin-bottom:12px;">
          cos(θ) = (A · B) / (|A| × |B|) = ${dotProduct} / ${(magA * magB).toFixed(4)}
        </div>
        <div style="font-size:42px;font-weight:700;color:#40c057;">${cosine.toFixed(4)}</div>
        <div class="gauge-wrap" style="margin-top:16px;">
          <div class="gauge-bar">
            <div class="gauge-needle" style="left:${pct}%;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;max-width:400px;margin:4px auto;font-size:11px;color:#999;">
            <span>Opposite (-1)</span><span>Orthogonal (0)</span><span>Identical (1)</span>
          </div>
        </div>
        <div style="margin-top:16px;font-size:14px;color:#555;">
          Cosine Distance = 1 − ${cosine.toFixed(4)} = <strong>${distance.toFixed(4)}</strong>
          <span style="font-size:12px;color:#999;display:block;margin-top:4px;">
            (SQL Server's <code>vector_distance('cosine', ...)</code> returns this value)
          </span>
        </div>
      </div>
      <div class="note-box" style="margin-top:24px;">
        <strong>This is exactly what SQL Server does</strong> — but across 768 dimensions, at millions of comparisons per second,
        accelerated by DiskANN vector indexes.
      </div>`;
  }

  return { init, nextStep, prevStep, reset, autoPlay };
})();
