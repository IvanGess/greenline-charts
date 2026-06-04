import type { CellActions, CellPaint, ChartAction } from './types'

export function actionsToGradient(
  paint: CellPaint,
  actionsById: Map<string, ChartAction>,
): string {
  const normalized = normalizeCellPaint(paint)
  const entries = Object.entries(normalized)

  if (entries.length === 0) {
    return 'var(--range-cell-empty, #eef2f0)'
  }

  const segments: Array<{ color: string; share: number }> = []
  let totalShare = 0
  for (const [id, share] of entries) {
    if (typeof share !== 'number') continue
    const color = actionsById.get(id)?.color
    if (!color) continue
    segments.push({ color, share })
    totalShare += share
  }

  if (segments.length === 0) {
    return 'var(--range-cell-empty, #eef2f0)'
  }

  if (totalShare < 100) {
    segments.push({ color: 'var(--range-cell-empty, #eef2f0)', share: 100 - totalShare })
  }

  let cursor = 0
  const stops: string[] = []
  for (const segment of segments) {
    const start = cursor
    const end = cursor + segment.share
    stops.push(`${segment.color} ${start}%`, `${segment.color} ${end}%`)
    cursor = end
  }

  return `linear-gradient(90deg, ${stops.join(', ')})`
}

export function normalizeCellActions(actions: CellActions): CellActions {
  return [...new Set(actions)]
}

export function normalizeCellPaint(paint: CellPaint): CellPaint {
  const out: CellPaint = {}
  for (const [id, value] of Object.entries(paint)) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) continue
    out[id] = Math.min(100, roundStep(value))
  }
  return out
}

export function paintToActions(paint: CellPaint): CellActions {
  return Object.entries(normalizeCellPaint(paint))
    .filter(([, value]) => typeof value === 'number' && value > 0)
    .map(([id]) => id)
}

export function cellActionsEqual(a: CellActions, b: CellActions): boolean {
  const na = [...normalizeCellActions(a)].sort()
  const nb = [...normalizeCellActions(b)].sort()
  if (na.length !== nb.length) return false
  return na.every((id, i) => id === nb[i])
}

function roundStep(value: number): number {
  // Поддержка 12.5% шагов: 100 / 8
  const STEP = 12.5
  return Math.round(value / STEP) * STEP
}
