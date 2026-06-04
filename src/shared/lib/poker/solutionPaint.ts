import type { CellActions, CellPaint, HandKey, RangeChartDefinition } from './types'

export function actionsListToPaint(actions: CellActions): CellPaint {
  if (!actions.length) return {}
  const share = 100 / actions.length
  const out: CellPaint = {}
  for (const actionId of actions) {
    out[actionId] = share
  }
  return out
}

export function chartSolutionToPaintMap(chart: RangeChartDefinition): Record<HandKey, CellPaint> {
  if (chart.solutionPaint) {
    return Object.fromEntries(
      Object.entries(chart.solutionPaint).map(([key, paint]) => [key, { ...paint }]),
    )
  }

  const out: Record<HandKey, CellPaint> = {}
  for (const [key, actions] of Object.entries(chart.solution)) {
    if (!actions.length) continue
    out[key] = actionsListToPaint(actions)
  }
  return out
}
