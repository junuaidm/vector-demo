/* ============================================================
   cosine-playground.js
   Three-tabbed interactive cosine search playground.
   Tab 1: Sentence Picker  Tab 2: Live Comparison  Tab 3: Mini Search
   Depends on: trigram-vectorizer.js (TrigramVectorizer)
   ============================================================ */

const CosinePlayground = (() => {
  "use strict";

  /* ---- Sample data ---- */
  const SENTENCES = [
    "fast red bicycle for racing",
    "blue mountain bike off-road",
    "lightweight running shoes",
    "luxury leather handbag",
    "red mountain bike budget",
    "children's bike with training wheels",
    "waterproof hiking boots",
    "wireless bluetooth headphones",
    "stainless steel water bottle",
    "electric scooter commuter",
    "yoga mat non-slip",
    "camping tent 4-person",
  ];

  const SEARCH_DB = [
    "Red Mountain Bike $499",
    "Blue Road Bicycle $350",
    "Running Shoes Lightweight $89",
    "Leather Hiking Boots $149",
    "Electric Scooter City $299",
    "Kids Bike Training Wheels $129",
    "Carbon Fiber Road Bike $1299",
    "Waterproof Trail Runners $109",
    "Cycling Helmet Black $59",
    "Mountain Bike Gloves $29",
    "Bike Repair Tool Kit $35",
    "Outdoor Camping Tent $199",
    "Yoga Mat Premium $45",
    "Stainless Water Bottle $19",
    "Wireless Headphones Sport $79",
  ];

  let selectedCards = [];

  function init() {
    initTabs();
    initSentencePicker();
    initLiveComparison();
    initMiniSearch();
  }

  /* ---- Tab Switching ---- */
  function initTabs() {
    document.querySelectorAll("#playground .tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        document.querySelectorAll("#playground .tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll("#playground .tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const panel = document.getElementById(target);
        if (panel) panel.classList.add("active");
      });
    });
  }

  /* ---- Tab 1: Sentence Picker ---- */
  function initSentencePicker() {
    const grid = document.getElementById("picker-grid");
    const result = document.getElementById("picker-result");
    if (!grid) return;

    grid.innerHTML = SENTENCES.map((s, i) =>
      `<div class="sentence-card" data-idx="${i}">${s}</div>`
    ).join("");

    grid.addEventListener("click", e => {
      const card = e.target.closest(".sentence-card");
      if (!card) return;
      const idx = parseInt(card.dataset.idx);

      if (selectedCards.includes(idx)) {
        selectedCards = selectedCards.filter(x => x !== idx);
        card.classList.remove("selected");
      } else {
        if (selectedCards.length >= 2) {
          const oldCard = grid.querySelector(`[data-idx="${selectedCards[0]}"]`);
          if (oldCard) oldCard.classList.remove("selected");
          selectedCards.shift();
        }
        selectedCards.push(idx);
        card.classList.add("selected");
      }

      if (selectedCards.length === 2) {
        showPickerResult(result, SENTENCES[selectedCards[0]], SENTENCES[selectedCards[1]]);
      } else {
        result.innerHTML = '<p style="color:#999;text-align:center;">Select two sentences to compare.</p>';
      }
    });
  }

  function showPickerResult(el, textA, textB) {
    const r = TrigramVectorizer.compare(textA, textB);
    const pct = (r.similarity * 100).toFixed(1);
    const gaugePct = ((r.similarity + 1) / 2 * 100).toFixed(1);

    el.innerHTML = `
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
        <div style="flex:1;min-width:200px;padding:12px;background:#deecf9;border-radius:8px;">
          <strong style="color:#0078d4;">A:</strong> ${escapeHtml(textA)}
        </div>
        <div style="flex:1;min-width:200px;padding:12px;background:#e3fafc;border-radius:8px;">
          <strong style="color:#50e6ff;">B:</strong> ${escapeHtml(textB)}
        </div>
      </div>
      <div class="gauge-wrap">
        <div class="gauge-bar">
          <div class="gauge-needle" style="left:${gaugePct}%;"></div>
        </div>
        <div class="gauge-value" style="color:${simColor(r.similarity)};">${pct}%</div>
        <div class="gauge-label">Cosine Similarity</div>
        <div style="font-size:13px;color:#555;margin-top:4px;">
          Distance = ${r.distance.toFixed(4)}
        </div>
      </div>`;
  }

  /* ---- Tab 2: Live Comparison ---- */
  function initLiveComparison() {
    const inputA = document.getElementById("compare-a");
    const inputB = document.getElementById("compare-b");
    const resultEl = document.getElementById("compare-result");
    if (!inputA || !inputB) return;

    let debounce = null;
    const handler = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const a = inputA.value.trim();
        const b = inputB.value.trim();
        if (!a || !b) {
          resultEl.innerHTML = '<p style="color:#999;text-align:center;">Type in both fields to see the similarity.</p>';
          return;
        }
        const r = TrigramVectorizer.compare(a, b);
        renderComparison(resultEl, r, a, b);
      }, 300);
    };
    inputA.addEventListener("input", handler);
    inputB.addEventListener("input", handler);
  }

  function renderComparison(el, r, textA, textB) {
    const pct = (r.similarity * 100).toFixed(1);
    const gaugePct = ((r.similarity + 1) / 2 * 100).toFixed(1);

    // Show top 20 vocab dimensions as bar charts
    const dims = r.vocab.map((v, i) => ({ label: v, a: r.vecA[i], b: r.vecB[i] }))
      .sort((x, y) => (y.a + y.b) - (x.a + x.b))
      .slice(0, 20);

    const maxVal = Math.max(1, ...dims.map(d => Math.max(d.a, d.b)));

    el.innerHTML = `
      <div class="gauge-wrap">
        <div class="gauge-bar">
          <div class="gauge-needle" style="left:${gaugePct}%;"></div>
        </div>
        <div class="gauge-value" style="color:${simColor(r.similarity)};">${pct}%</div>
        <div class="gauge-label">Cosine Similarity &nbsp;|&nbsp; Distance = ${r.distance.toFixed(4)}</div>
      </div>
      <h4 style="margin:16px 0 8px;font-size:14px;color:#555;">Top Vector Dimensions (character trigrams)</h4>
      <div class="bar-chart">
        ${dims.map(d => `
          <div class="bar-row">
            <span style="min-width:40px;font-family:monospace;color:#555;">${escapeHtml(d.label)}</span>
            <div class="bar" style="width:${(d.a / maxVal) * 120}px;background:#0078d4;"></div>
            <div class="bar" style="width:${(d.b / maxVal) * 120}px;background:#50e6ff;"></div>
          </div>`).join("")}
      </div>
      <div style="font-size:11px;color:#999;margin-top:4px;">
        <span style="color:#0078d4;">■</span> Text A &nbsp;
        <span style="color:#50e6ff;">■</span> Text B &nbsp;
        (${r.vocab.length} total dimensions)
      </div>`;
  }

  /* ---- Tab 3: Mini Search ---- */
  function initMiniSearch() {
    const input = document.getElementById("search-input");
    const resultEl = document.getElementById("search-results");
    if (!input) return;

    let debounce = null;
    input.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const q = input.value.trim();
        if (!q) {
          renderSearchResults(resultEl, SEARCH_DB.map((text, index) => ({ text, similarity: 0, distance: 1, index })));
          return;
        }
        const ranked = TrigramVectorizer.rank(q, SEARCH_DB);
        renderSearchResults(resultEl, ranked);
      }, 250);
    });

    // Initial render
    renderSearchResults(resultEl, SEARCH_DB.map((text, index) => ({ text, similarity: 0, distance: 1, index })));
  }

  function renderSearchResults(el, items) {
    el.innerHTML = items.map((item, rank) => {
      const barW = Math.max(2, item.similarity * 100);
      const color = simColor(item.similarity);
      return `
        <div class="result-item">
          <span class="result-rank">${rank + 1}</span>
          <span class="result-text">${escapeHtml(item.text)}</span>
          <span class="result-bar-wrap">
            <div class="result-bar" style="width:${barW}%;background:${color};"></div>
          </span>
          <span class="result-score">${(item.similarity * 100).toFixed(1)}%</span>
        </div>`;
    }).join("");
  }

  /* ---- Helpers ---- */
  function simColor(sim) {
    if (sim > 0.6) return "#40c057";
    if (sim > 0.3) return "#fd7e14";
    return "#fa5252";
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  return { init };
})();
