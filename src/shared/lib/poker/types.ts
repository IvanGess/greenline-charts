/** Действие на чарте (цвет на сетке). */
export interface ChartAction {
  id: string
  label: string
  color: string
}

/** Ключ ячейки: AA, AKs, AKo, … */
export type HandKey = string

/** Набор действий в одной руке (1–3 для смешанной стратегии). */
export type CellActions = ChartAction['id'][]
/** Закраска ответа пользователя: actionId -> доля ячейки в процентах. */
export type CellPaint = Partial<Record<ChartAction['id'], number>>

export interface RangeChartDefinition {
  id: string
  title: string
  position: PokerPosition | string
  situation: string
  /** Порядок важен для легенды и разбиения ячейки. */
  actions: ChartAction[]
  solution: Record<HandKey, CellActions>
  /** Runtime override: actionId -> доля ячейки в процентах. */
  solutionPaint?: Record<HandKey, CellPaint>
}

export type PokerPosition =
  | 'UTG'
  | 'UTG1'
  | 'MP'
  | 'HJ'
  | 'CO'
  | 'BTN'
  | 'SB'
  | 'BB'

export type CellCheckState = 'correct' | 'missing' | 'extra' | 'wrong-mix' | 'idle'

export interface CellCheckResult {
  state: CellCheckState
  expected: CellActions
  actual: CellActions
}
