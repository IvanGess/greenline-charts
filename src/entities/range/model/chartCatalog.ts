import { paintToActions } from '@shared/lib/poker'
import type { CellPaint, RangeChartDefinition } from '@shared/lib/poker'
import { RANGE_SITUATION, RANGE_SITUATION_ORDER } from './situations'

const SOLUTION_OVERRIDES_STORAGE_KEY = 'range-chart-solution-overrides'

const modules = import.meta.glob<RangeChartDefinition>('./charts/*.json', {
  eager: true,
  import: 'default',
})

export const RANGE_CHART_CATALOG: RangeChartDefinition[] = Object.values(modules).sort(
  (a, b) => a.situation.localeCompare(b.situation) || a.title.localeCompare(b.title),
)

const solutionOverrides = readStoredSolutionOverrides()
for (const chart of RANGE_CHART_CATALOG) {
  const override = solutionOverrides[chart.id]
  if (!override) continue
  const normalized = cloneSolutionPaint(override)
  chart.solutionPaint = normalized
  chart.solution = toActionSolution(normalized)
}

const TECHNICAL_POSITIONS = new Set(['IP', 'OOP'])
const POSITION_ORDER = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB']
const SITUATION_POSITION_ORDER: Record<string, string[]> = {
  [RANGE_SITUATION.SMALL_BLINDS_DEFENCE]: ['vs UTG', 'vs MP', 'vs CO', 'vs BTN'],
  [RANGE_SITUATION.BIG_BLINDS_DEFENCE]: ['vs UTG', 'vs MP', 'vs CO', 'vs BTN(2,5bb)', 'vs BTN(3bb)'],
  [RANGE_SITUATION.BLINDS_DEFENCE_VS_4BET]: [
    'SB|BB vs UTG',
    'SB|BB vs MP',
    'SB|BB vs CO',
    'BB vs SB',
    'SB|BB vs BU(2,5bb)',
    'SB|BB vs BU(3bb)',
  ],
  [RANGE_SITUATION.THREE_BET_IP]: ['vs RFI 15%', 'vs RFI 18%', 'vs RFI 26%'],
  [RANGE_SITUATION.DEFENCE_VS_THREE_BET_IP]: [
    'vs 3Bet 6%',
    'vs 3Bet 8%',
    'vs 3Bet 10%',
    'vs 3Bet 12%',
    'vs 3Bet 14%',
  ],
  [RANGE_SITUATION.DEFENCE_VS_THREE_BET_OOP]: [
    'vs 3Bet 8%',
    'vs 3Bet 10%',
    'vs 3Bet 12%',
    'vs 3Bet 18%(SB vs BB)',
  ],
}

function byOrder(order: string[], a: string, b: string): number {
  const ai = order.indexOf(a)
  const bi = order.indexOf(b)
  if (ai === -1 && bi === -1) return a.localeCompare(b)
  if (ai === -1) return 1
  if (bi === -1) return -1
  return ai - bi
}

function mapSituationName(chart: RangeChartDefinition): string {
  const s = chart.situation.toLowerCase()

  if (s.includes('open raise')) return RANGE_SITUATION.OPEN_RAISE_FI
  if (s.includes('isolate')) return RANGE_SITUATION.ISOLATE
  if (s.includes('small blind defense')) return RANGE_SITUATION.SMALL_BLINDS_DEFENCE
  if (s.includes('big blind defense')) return RANGE_SITUATION.BIG_BLINDS_DEFENCE
  if (s.includes('blinds defense vs 4bet')) return RANGE_SITUATION.BLINDS_DEFENCE_VS_4BET
  if (s.includes('3bet ip') && !s.includes('defense')) return RANGE_SITUATION.THREE_BET_IP
  if (s.includes('defense vs 3bet ip')) return RANGE_SITUATION.DEFENCE_VS_THREE_BET_IP
  if (s.includes('defense vs 3bet oop')) return RANGE_SITUATION.DEFENCE_VS_THREE_BET_OOP

  return chart.situation
}

function mapPositionLabel(chart: RangeChartDefinition): string {
  switch (chart.id) {
    case 'sb-vs-utg':
      return 'vs UTG'
    case 'sb-vs-mp':
      return 'vs MP'
    case 'sb-vs-co':
      return 'vs CO'
    case 'sb-vs-btn':
      return 'vs BTN'
    case 'bb-vs-utg':
      return 'vs UTG'
    case 'bb-vs-mp':
      return 'vs MP'
    case 'bb-vs-co':
      return 'vs CO'
    case 'bb-vs-btn-25':
      return 'vs BTN(2,5bb)'
    case 'bb-vs-btn-30':
      return 'vs BTN(3bb)'
    case 'bb-vs-sb':
      return 'vs SB'
    case 'blinds-vs-utg-4bet':
      return 'SB|BB vs UTG'
    case 'blinds-vs-mp-4bet':
      return 'SB|BB vs MP'
    case 'blinds-vs-co-4bet':
      return 'SB|BB vs CO'
    case 'bb-vs-sb-4bet':
      return 'BB vs SB'
    case 'blinds-vs-btn-25-4bet':
      return 'SB|BB vs BU(2,5bb)'
    case 'blinds-vs-btn-30-4bet':
      return 'SB|BB vs BU(3bb)'
    case '3bet-ip-15':
      return 'vs RFI 15%'
    case '3bet-ip-18':
      return 'vs RFI 18%'
    case '3bet-ip-26':
      return 'vs RFI 26%'
    case 'def-3bet-ip-6':
      return 'vs 3Bet 6%'
    case 'def-3bet-ip-8':
      return 'vs 3Bet 8%'
    case 'def-3bet-ip-10':
      return 'vs 3Bet 10%'
    case 'def-3bet-ip-12':
      return 'vs 3Bet 12%'
    case 'def-3bet-ip-14':
      return 'vs 3Bet 14%'
    case 'def-3bet-oop-8':
      return 'vs 3Bet 8%'
    case 'def-3bet-oop-10':
      return 'vs 3Bet 10%'
    case 'def-3bet-oop-12':
      return 'vs 3Bet 12%'
    case 'def-3bet-oop-18-sbbb':
      return 'vs 3Bet 18%(SB vs BB)'
    default:
      return chart.position
  }
}

export function getChartById(id: string): RangeChartDefinition | undefined {
  return RANGE_CHART_CATALOG.find((c) => c.id === id)
}

export function overrideChartSolution(
  chartId: string,
  solution: Record<string, CellPaint>,
): void {
  const chart = getChartById(chartId)
  if (!chart) return
  const normalized = cloneSolutionPaint(solution)
  chart.solutionPaint = normalized
  chart.solution = toActionSolution(normalized)
  solutionOverrides[chartId] = normalized
  writeStoredSolutionOverrides(solutionOverrides)
}

export function listPositions(): string[] {
  return [
    ...new Set(
      RANGE_CHART_CATALOG.map((c) => c.position).filter((p) => !TECHNICAL_POSITIONS.has(p)),
    ),
  ].sort((a, b) => byOrder(POSITION_ORDER, a, b))
}

export function listPositionsForSituation(situation: string | null): string[] {
  if (!situation) return listPositions()
  const situationOrder = SITUATION_POSITION_ORDER[situation]
  const positions = [
    ...new Set(
      RANGE_CHART_CATALOG.filter((c) => mapSituationName(c) === situation)
        .map((c) => mapPositionLabel(c))
        .filter((p) => !TECHNICAL_POSITIONS.has(p)),
    ),
  ].sort((a, b) => byOrder(situationOrder ?? POSITION_ORDER, a, b))
  return positions.length ? positions : listPositions()
}

export function listSituations(): string[] {
  return [...new Set(RANGE_CHART_CATALOG.map((c) => mapSituationName(c)))].sort(
    (a, b) => byOrder([...RANGE_SITUATION_ORDER], a, b),
  )
}

export function filterCharts(position: string | null, situation: string | null): RangeChartDefinition[] {
  return RANGE_CHART_CATALOG.filter((c) => {
    const situationName = mapSituationName(c)
    if (situation && situationName !== situation) return false
    if (position && mapPositionLabel(c) !== position) {
      return false
    }
    return true
  })
}

export function getSituationName(chart: RangeChartDefinition): string {
  return mapSituationName(chart)
}

function cloneSolutionPaint(
  solution: Record<string, CellPaint>,
): Record<string, CellPaint> {
  return Object.fromEntries(
    Object.entries(solution).map(([handKey, paint]) => [handKey, { ...paint }]),
  )
}

function toActionSolution(solution: Record<string, CellPaint>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(solution).map(([handKey, paint]) => [handKey, paintToActions(paint)]),
  )
}

function readStoredSolutionOverrides(): Record<string, Record<string, CellPaint>> {
  if (typeof window === 'undefined') return {}
  const raw = window.localStorage.getItem(SOLUTION_OVERRIDES_STORAGE_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return normalizeStoredSolutionOverrides(parsed as Record<string, unknown>)
  } catch {
    return {}
  }
}

function writeStoredSolutionOverrides(overrides: Record<string, Record<string, CellPaint>>): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(SOLUTION_OVERRIDES_STORAGE_KEY, JSON.stringify(overrides))
}

function normalizeStoredSolutionOverrides(
  source: Record<string, unknown>,
): Record<string, Record<string, CellPaint>> {
  const normalized: Record<string, Record<string, CellPaint>> = {}

  for (const [chartId, chartValue] of Object.entries(source)) {
    if (!chartValue || typeof chartValue !== 'object') continue
    const chartRecord = chartValue as Record<string, unknown>
    const normalizedChart: Record<string, CellPaint> = {}

    for (const [handKey, handValue] of Object.entries(chartRecord)) {
      if (Array.isArray(handValue)) {
        const actions = handValue.filter((id): id is string => typeof id === 'string' && id.length > 0)
        if (!actions.length) continue
        const share = 100 / actions.length
        const paint: CellPaint = {}
        for (const actionId of actions) {
          paint[actionId] = share
        }
        normalizedChart[handKey] = paint
        continue
      }

      if (!handValue || typeof handValue !== 'object') continue
      const paint: CellPaint = {}
      for (const [actionId, share] of Object.entries(handValue as Record<string, unknown>)) {
        if (typeof share !== 'number' || !Number.isFinite(share) || share <= 0) continue
        paint[actionId] = share
      }
      if (!Object.keys(paint).length) continue
      normalizedChart[handKey] = paint
    }

    if (Object.keys(normalizedChart).length) {
      normalized[chartId] = normalizedChart
    }
  }

  return normalized
}
