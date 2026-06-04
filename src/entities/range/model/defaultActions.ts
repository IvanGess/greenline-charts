import type { ChartAction } from '@shared/lib/poker'

/** Палитра в духе GreenCharts — подстройте под PDF при импорте. */
export const DEFAULT_CHART_ACTIONS: ChartAction[] = [
  { id: 'raise', label: 'Рейз / открытие', color: '#c0392b' },
  { id: 'call', label: 'Колл', color: '#2980b9' },
  { id: 'threebet', label: '3-бет', color: '#8e44ad' },
  { id: 'fold', label: 'Фолд', color: '#7f8c8d' },
]
