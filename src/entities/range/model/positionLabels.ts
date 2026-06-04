import type { RangeChartDefinition } from '@shared/lib/poker'
import { RANGE_SITUATION } from './situations'

/** Ordered position labels per situation for the filter dropdown. */
export const SITUATION_POSITION_ORDER: Partial<Record<string, string[]>> = {
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

/** Maps chart `id` → the human-readable position label shown in the filter. */
const CHART_POSITION_LABELS: Record<string, string> = {
  'sb-vs-utg': 'vs UTG',
  'sb-vs-mp': 'vs MP',
  'sb-vs-co': 'vs CO',
  'sb-vs-btn': 'vs BTN',
  'bb-vs-utg': 'vs UTG',
  'bb-vs-mp': 'vs MP',
  'bb-vs-co': 'vs CO',
  'bb-vs-btn-25': 'vs BTN(2,5bb)',
  'bb-vs-btn-30': 'vs BTN(3bb)',
  'bb-vs-sb': 'vs SB',
  'blinds-vs-utg-4bet': 'SB|BB vs UTG',
  'blinds-vs-mp-4bet': 'SB|BB vs MP',
  'blinds-vs-co-4bet': 'SB|BB vs CO',
  'bb-vs-sb-4bet': 'BB vs SB',
  'blinds-vs-btn-25-4bet': 'SB|BB vs BU(2,5bb)',
  'blinds-vs-btn-30-4bet': 'SB|BB vs BU(3bb)',
  '3bet-ip-15': 'vs RFI 15%',
  '3bet-ip-18': 'vs RFI 18%',
  '3bet-ip-26': 'vs RFI 26%',
  'def-3bet-ip-6': 'vs 3Bet 6%',
  'def-3bet-ip-8': 'vs 3Bet 8%',
  'def-3bet-ip-10': 'vs 3Bet 10%',
  'def-3bet-ip-12': 'vs 3Bet 12%',
  'def-3bet-ip-14': 'vs 3Bet 14%',
  'def-3bet-oop-8': 'vs 3Bet 8%',
  'def-3bet-oop-10': 'vs 3Bet 10%',
  'def-3bet-oop-12': 'vs 3Bet 12%',
  'def-3bet-oop-18-sbbb': 'vs 3Bet 18%(SB vs BB)',
}

export function getPositionLabel(chart: RangeChartDefinition): string {
  return CHART_POSITION_LABELS[chart.id] ?? chart.position
}
