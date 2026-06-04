const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function rankIndex(r) {
  return RANKS.indexOf(r)
}

/** Пары не слабее min (77+ включает AA). */
export function pairs(min) {
  const lo = rankIndex(min)
  const out = []
  for (let i = 0; i <= lo; i += 1) out.push(`${RANKS[i]}${RANKS[i]}`)
  return out
}

export function suited(high, lowFrom, lowTo = '2') {
  const out = []
  const h = rankIndex(high)
  const a = rankIndex(lowFrom)
  const b = rankIndex(lowTo)
  for (let l = Math.max(a, b); l <= Math.min(a, b) || l <= h; l += 1) {
    if (l === h) continue
    const low = RANKS[l]
    out.push(`${high}${low}s`)
  }
  for (let l = h + 1; l <= Math.max(a, b); l += 1) {
    if (l >= RANKS.length) break
    out.push(`${high}${RANKS[l]}s`)
  }
  return out
}

/** suited high-low+ e.g. A2s+ means all Axs with x<=2... actually A2s+ = A2s, A3s,... AKs */
export function suitedPlus(high, lowMin) {
  const out = []
  const h = rankIndex(high)
  const lMin = rankIndex(lowMin)
  for (let l = lMin; l > h; l -= 1) out.push(`${RANKS[h]}${RANKS[l]}s`)
  return out
}

export function offsuitPlus(high, lowMin) {
  const out = []
  const h = rankIndex(high)
  const lo = rankIndex(lowMin)
  for (let l = lo; l > h; l -= 1) out.push(`${RANKS[h]}${RANKS[l]}o`)
  return out
}

export function offsuit(high, lowFrom, lowTo) {
  const out = []
  const a = rankIndex(lowFrom)
  const b = rankIndex(lowTo)
  for (let l = Math.min(a, b); l <= Math.max(a, b); l += 1) {
    if (RANKS[l] === high) continue
    out.push(`${high}${RANKS[l]}o`)
  }
  return out
}

export function handList(defs) {
  const out = new Set()
  for (const d of defs) {
    if (typeof d === 'string') out.add(d)
    else if (d.pairs) for (const h of pairs(d.pairs[0])) out.add(h)
    else if (d.suitedPlus) for (const h of suitedPlus(d.suitedPlus[0], d.suitedPlus[1])) out.add(h)
    else if (d.offsuitPlus) for (const h of offsuitPlus(d.offsuitPlus[0], d.offsuitPlus[1])) out.add(h)
  }
  return [...out]
}

export function toSolution(hands, actionId) {
  const s = {}
  for (const h of hands) s[h] = [actionId]
  return s
}

export function mergeSolutions(...parts) {
  const s = {}
  for (const part of parts) {
    for (const [k, v] of Object.entries(part)) {
      if (!s[k]) s[k] = [...v]
      else s[k] = [...new Set([...s[k], ...v])].sort()
    }
  }
  return s
}
