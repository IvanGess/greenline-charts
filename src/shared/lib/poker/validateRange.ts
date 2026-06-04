import { normalizeCellPaint, paintToActions } from './cellStyle'
import { actionsListToPaint } from './solutionPaint'
import type { CellCheckResult, CellPaint, HandKey, RangeChartDefinition } from './types'

export function validateUserRange(
  chart: RangeChartDefinition,
  userCells: Record<HandKey, CellPaint>,
): Record<HandKey, CellCheckResult> {
  const result: Record<HandKey, CellCheckResult> = {}
  const keys = new Set<HandKey>([
    ...Object.keys(chart.solution),
    ...Object.keys(chart.solutionPaint ?? {}),
    ...Object.keys(userCells),
  ])

  for (const key of keys) {
    const expectedPaint = normalizeCellPaint(
      chart.solutionPaint?.[key] ?? actionsListToPaint(chart.solution[key] ?? []),
    )
    const actualPaint = normalizeCellPaint(userCells[key] ?? {})
    const expected = paintToActions(expectedPaint)
    const actual = paintToActions(actualPaint)
    if (!expected.length && !actual.length) {
      continue
    }
    result[key] = {
      expected,
      actual,
      state: resolveState(expectedPaint, actualPaint),
    }
  }

  return result
}

function resolveState(expected: CellPaint, actual: CellPaint): CellCheckResult['state'] {
  const expectedActions = paintToActions(expected)
  const actualActions = paintToActions(actual)
  if (expectedActions.length === 0 && actualActions.length === 0) return 'idle'
  if (expectedActions.length > 0 && actualActions.length === 0) return 'missing'
  if (expectedActions.length === 0 && actualActions.length > 0) return 'extra'
  if (cellPaintEqual(expected, actual)) return 'correct'
  return 'wrong-mix'
}

function cellPaintEqual(a: CellPaint, b: CellPaint): boolean {
  const keys = new Set<string>([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const av = Number(a[key] ?? 0)
    const bv = Number(b[key] ?? 0)
    if (Math.abs(av - bv) > 0.001) {
      return false
    }
  }
  return true
}

export function countMistakes(check: Record<HandKey, CellCheckResult>): number {
  return Object.values(check).filter(
    (c) => c.state === 'missing' || c.state === 'extra' || c.state === 'wrong-mix',
  ).length
}
