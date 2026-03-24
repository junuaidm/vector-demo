/* ============================================================
   trigram-vectorizer.js
   Shared character-trigram vectorizer for the cosine playground.
   Converts any string into a sparse vector using character 3-grams,
   then exposes cosine similarity helpers.
   ============================================================ */

const TrigramVectorizer = (() => {
  "use strict";

  /** Extract character trigrams from a string. */
  function trigrams(text) {
    const t = (" " + text.toLowerCase().replace(/[^a-z0-9 ]/g, "") + " ").replace(/\s+/g, " ");
    const grams = {};
    for (let i = 0; i <= t.length - 3; i++) {
      const g = t.substring(i, i + 3);
      grams[g] = (grams[g] || 0) + 1;
    }
    return grams;
  }

  /** Build a shared vocabulary from an array of trigram objects. */
  function buildVocab(gramsList) {
    const vocab = new Set();
    gramsList.forEach(g => Object.keys(g).forEach(k => vocab.add(k)));
    return Array.from(vocab).sort();
  }

  /** Convert a trigram object into a dense array given a vocabulary. */
  function toDense(grams, vocab) {
    return vocab.map(k => grams[k] || 0);
  }

  /** Dot product of two equal-length arrays. */
  function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  /** Magnitude (L2 norm). */
  function mag(v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i] * v[i];
    return Math.sqrt(s);
  }

  /** Cosine similarity between two dense vectors. Returns 0–1 (clamped). */
  function cosineSim(a, b) {
    const d = dot(a, b);
    const m = mag(a) * mag(b);
    if (m === 0) return 0;
    return Math.max(0, Math.min(1, d / m));
  }

  /** Cosine distance (SQL Server style, 0 = identical, 2 = opposite). */
  function cosineDist(a, b) {
    return 1 - cosineSim(a, b);
  }

  /**
   * Compare two strings. Returns { similarity, distance, vecA, vecB, vocab }.
   */
  function compare(textA, textB) {
    const gA = trigrams(textA);
    const gB = trigrams(textB);
    const vocab = buildVocab([gA, gB]);
    const vecA = toDense(gA, vocab);
    const vecB = toDense(gB, vocab);
    return {
      similarity: cosineSim(vecA, vecB),
      distance: cosineDist(vecA, vecB),
      vecA,
      vecB,
      vocab,
    };
  }

  /**
   * Rank a list of items against a query.
   * items: string[]
   * query: string
   * Returns: [{ text, similarity, distance, index }] sorted by distance asc.
   */
  function rank(query, items) {
    const gQ = trigrams(query);
    const allGrams = items.map(t => trigrams(t));
    allGrams.push(gQ);
    const vocab = buildVocab(allGrams);
    const vecQ = toDense(gQ, vocab);
    return items
      .map((text, index) => {
        const vecI = toDense(allGrams[index], vocab);
        const similarity = cosineSim(vecQ, vecI);
        return { text, similarity, distance: 1 - similarity, index };
      })
      .sort((a, b) => a.distance - b.distance);
  }

  return { trigrams, compare, rank, dot, mag, cosineSim, cosineDist };
})();
