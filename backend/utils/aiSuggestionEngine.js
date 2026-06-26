/**
 * AmpEdge AI Suggestion Engine (Rule-Based MVP)
 * 
 * Matches BOM items to marketplace products using:
 * 1. Keyword matching (40% weight)
 * 2. Category filtering (25% weight)
 * 3. Specification parsing (20% weight)
 * 4. Popularity + rating (15% weight)
 * + Preferred brand boost
 * 
 * Returns top 3-5 suggestions per item, classified by tier (Budget/Mid/Premium)
 */

// ── Normalize & Tokenize ──────────────────────────────────────

function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, ' ')  // Remove special chars except dots
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'for', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'by', 'with',
    'from', 'as', 'it', 'its', 'this', 'that', 'type', 'set', 'pack',
  ]);
  return normalizeText(text)
    .split(' ')
    .filter(t => t.length > 1 && !stopWords.has(t));
}

// ── Specification Parser ──────────────────────────────────────

function parseSpecs(text) {
  if (!text) return {};
  const normalized = normalizeText(text);
  const specs = {};

  // Extract common electrical specifications
  const patterns = [
    { key: 'sqmm', regex: /([\d.]+)\s*(?:sq\s*mm|sqmm|sq\.mm)/i },
    { key: 'watts', regex: /([\d.]+)\s*(?:w|watt|watts)/i },
    { key: 'amps', regex: /([\d.]+)\s*(?:a|amp|amps|ampere)/i },
    { key: 'volts', regex: /([\d.]+)\s*(?:v|volt|volts)/i },
    { key: 'mm', regex: /([\d.]+)\s*mm\b/i },
    { key: 'ton', regex: /([\d.]+)\s*(?:ton|tons)/i },
    { key: 'star', regex: /([\d.]+)\s*star/i },
    { key: 'rpm', regex: /([\d.]+)\s*rpm/i },
    { key: 'liter', regex: /([\d.]+)\s*(?:l|ltr|liter|litre)/i },
    { key: 'core', regex: /([\d.]+)\s*core/i },
    { key: 'way', regex: /([\d.]+)\s*way/i },
    { key: 'pole', regex: /(\w+)\s*pole/i },
  ];

  for (const { key, regex } of patterns) {
    const match = normalized.match(regex);
    if (match) {
      specs[key] = match[1];
    }
  }

  // Extract material types — FIX: BUG-001
  // Prioritize conductor materials over insulation materials.
  // "copper PVC insulated" should detect material=copper, not PVC.
  // Uses word-boundary matching to prevent "insulated" matching "led".
  const conductorMaterials = ['copper', 'aluminium', 'aluminum', 'steel', 'brass'];
  const insulatorMaterials = ['pvc', 'cfl', 'halogen', 'led'];

  // Check conductors first (higher priority)
  for (const mat of conductorMaterials) {
    const regex = new RegExp('\\b' + mat + '\\b');
    if (regex.test(normalized)) {
      specs.material = mat;
    }
  }
  // Only set insulator if no conductor was found
  if (!specs.material) {
    for (const mat of insulatorMaterials) {
      const regex = new RegExp('\\b' + mat + '\\b');
      if (regex.test(normalized)) {
        specs.material = mat;
      }
    }
  }

  return specs;
}

// ── Spec Matching Score ───────────────────────────────────────

function matchSpecs(querySpecs, productSpecText) {
  if (!productSpecText || Object.keys(querySpecs).length === 0) return 0;

  const productSpecs = parseSpecs(productSpecText);
  if (Object.keys(productSpecs).length === 0) return 0;

  let matches = 0;
  let total = 0;

  for (const [key, value] of Object.entries(querySpecs)) {
    total++;
    if (productSpecs[key]) {
      if (productSpecs[key].toString() === value.toString()) {
        matches += 1;       // Exact match
      } else {
        matches += 0.3;     // Same spec type but different value — partial credit
      }
    }
  }

  return total > 0 ? matches / total : 0;
}

// ── Tag Builder ───────────────────────────────────────────────

function buildTags(product, allScored) {
  const tags = [];

  // Tier-based tags
  if (product.tier === 'BUDGET') tags.push('Budget');
  if (product.tier === 'MID_RANGE') tags.push('Best Value');
  if (product.tier === 'PREMIUM') tags.push('Premium');

  // If this is the highest scoring match, mark as AI Recommended
  if (allScored.length > 0 && allScored[0].product._id.toString() === product._id.toString()) {
    tags.push('AI Recommended');
  }

  // Stock warning
  if (product.stock <= 5 && product.stock > 0) {
    tags.push('Low Stock');
  }

  // Popular
  if (product.popularity >= 20) {
    tags.push('Popular');
  }

  // Highly rated
  if (product.rating >= 4.0) {
    tags.push('Top Rated');
  }

  return tags;
}

// ── Levenshtein Distance (fuzzy matching) ─────────────────────

function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function fuzzyTokenMatch(queryToken, productTokens) {
  for (const pToken of productTokens) {
    // Exact substring match
    if (pToken.includes(queryToken) || queryToken.includes(pToken)) return 1.0;
    // Levenshtein fuzzy match (tolerance: 2 edits for tokens > 4 chars)
    if (queryToken.length > 4 && pToken.length > 4) {
      const dist = levenshteinDistance(queryToken, pToken);
      if (dist <= 2) return 0.7;
    }
  }
  return 0;
}

// ── Main Suggestion Function ──────────────────────────────────

/**
 * Generate AI suggestions for a single BOM item
 * @param {Object} bomItem - { name, category, specification, preferredBrand }
 * @param {Array} allProducts - All active products from DB
 * @returns {Array} Top 3-5 product suggestions with scores and tags
 */
function suggestProducts(bomItem, allProducts) {
  const query = normalizeText(bomItem.name);
  const queryTokens = tokenize(bomItem.name + ' ' + (bomItem.specification || ''));
  const specs = parseSpecs((bomItem.specification || '') + ' ' + bomItem.name);

  const scored = allProducts
    .filter(p => p.isActive && p.stock > 0)
    .map(product => {
      let score = 0;
      const reasons = [];

      // 1. Keyword matching (40% weight)
      const productText = product.searchText || normalizeText(
        [product.name, product.brand, product.description, product.specifications, ...(product.tags || [])].join(' ')
      );
      const productTokens = tokenize(productText);

      let keywordHits = 0;
      for (const qToken of queryTokens) {
        const matchScore = fuzzyTokenMatch(qToken, productTokens);
        keywordHits += matchScore;
      }
      const keywordScore = queryTokens.length > 0 ? keywordHits / queryTokens.length : 0;
      score += keywordScore * 0.4;
      if (keywordScore > 0) reasons.push(`Keyword match: ${Math.round(keywordHits)} of ${queryTokens.length} terms`);

      // 2. Category match (25% weight)
      if (bomItem.category && bomItem.category !== 'OTHER' && bomItem.category === product.category) {
        score += 0.25;
        reasons.push('Category match');
      } else if (bomItem.category && bomItem.category !== 'OTHER') {
        // Partial credit for being in a related category
        score += 0;
      }

      // 3. Specification match (20% weight)
      const specScore = matchSpecs(specs, product.specifications || product.name);
      score += specScore * 0.2;
      if (specScore > 0) reasons.push(`Spec match: ${Math.round(specScore * 100)}%`);

      // 4. Popularity + rating (15% weight)
      const popScore = Math.min((product.popularity || 0) / 100, 1) * 0.1;
      const ratScore = ((product.rating || 0) / 5) * 0.05;
      score += popScore + ratScore;
      if (product.popularity > 10 || product.rating >= 4) {
        reasons.push(`Popularity: ${product.popularity || 0}, Rating: ${product.rating || 0}★`);
      }

      // Preferred brand boost (+15%)
      if (bomItem.preferredBrand &&
          product.brand?.toLowerCase() === bomItem.preferredBrand.toLowerCase()) {
        score += 0.15;
        reasons.push('Preferred brand match');
      }

      return { product, score, reasons };
    })
    .filter(s => {
      // FIX: BUG-002/003 — require minimum threshold AND meaningful keyword overlap
      // Prevents popularity/rating alone from surfacing irrelevant products.
      // Also requires ≥30% of query tokens to match, to prevent single-token fuzzy false positives.
      if (s.score <= 0.15) return false;
      const keywordReason = s.reasons.find(r => r.startsWith('Keyword match'));
      const hasCategoryMatch = s.reasons.some(r => r === 'Category match');
      if (hasCategoryMatch) return true; // category match alone is sufficient
      if (!keywordReason) return false;
      // Parse "Keyword match: X of Y terms" — require X/Y >= 0.40
      const kMatch = keywordReason.match(/Keyword match: (\d+) of (\d+)/);
      if (kMatch) {
        const hits = parseInt(kMatch[1]);
        const total = parseInt(kMatch[2]);
        if (total > 0 && hits / total < 0.40) return false;
      }
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Build final suggestion objects with tier tags
  return scored.map(s => ({
    productId: s.product._id,
    productName: s.product.name,
    brand: s.product.brand || 'Generic',
    tier: s.product.tier || 'MID_RANGE',
    price: s.product.basePrice,
    confidenceScore: Math.round(s.score * 100) / 100,
    matchReason: s.reasons.join('; '),
    isAvailable: s.product.stock > 0,
    tags: buildTags(s.product, scored)
  }));
}

/**
 * Generate AI suggestions for ALL items in a BOM
 * @param {Array} bomItems - Array of BOM items
 * @param {Array} allProducts - All active products from DB
 * @returns {Array} Array of { itemIndex, itemName, matches[] }
 */
function suggestForBOM(bomItems, allProducts) {
  return bomItems.map((item, index) => ({
    itemIndex: index,
    itemName: item.name,
    matches: suggestProducts(item, allProducts)
  }));
}

module.exports = {
  suggestProducts,
  suggestForBOM,
  normalizeText,
  tokenize,
  parseSpecs,
  matchSpecs,
  buildTags
};
