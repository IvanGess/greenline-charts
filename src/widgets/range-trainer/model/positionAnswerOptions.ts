import { RANGE_SITUATION } from '@entities/range'
import type { RangeChartDefinition } from '@shared/lib/poker'

export interface PositionAnswerOption {
  id: string
  label: string
}

type OptionsBuilder = (chart: RangeChartDefinition) => PositionAnswerOption[]

const FOLD: PositionAnswerOption = { id: 'fold', label: 'Фолд' }

function findAction(chart: RangeChartDefinition, ...ids: string[]) {
  return chart.actions.find((a) => ids.includes(a.id))
}

function allNonFold(chart: RangeChartDefinition): PositionAnswerOption[] {
  return chart.actions.filter((a) => a.id !== 'fold').map((a) => ({ id: a.id, label: a.label }))
}

const SITUATION_BUILDERS: Record<string, OptionsBuilder> = {
  [RANGE_SITUATION.OPEN_RAISE_FI]: (chart) => {
    const opts = [FOLD]
    if (findAction(chart, 'raise')) opts.push({ id: 'raise', label: 'Рэйз' })
    if (findAction(chart, 'raise_situational')) opts.push({ id: 'raise_situational', label: 'Рэйз в фиша/фолд' })
    return opts
  },

  [RANGE_SITUATION.ISOLATE]: (chart) => {
    const opts = [FOLD]
    const call = findAction(chart, 'complete', 'call')
    const raise = findAction(chart, 'iso', 'isolate')
    if (call) opts.push({ id: call.id, label: 'Колл' })
    if (raise) opts.push({ id: raise.id, label: 'Рэйз' })
    return opts
  },

  [RANGE_SITUATION.SMALL_BLINDS_DEFENCE]: (chart) => [FOLD, ...allNonFold(chart)],

  [RANGE_SITUATION.BIG_BLINDS_DEFENCE]: (chart) => {
    const opts = [FOLD]
    const call = findAction(chart, 'call')
    const threebet = findAction(chart, 'threebet')
    if (call) opts.push({ id: call.id, label: 'Колл' })
    if (threebet) opts.push({ id: threebet.id, label: '3 бет' })
    return opts
  },

  [RANGE_SITUATION.BLINDS_DEFENCE_VS_4BET]: (chart) => {
    const opts = [FOLD]
    const callSit = findAction(chart, 'call_situational')
    const call = findAction(chart, 'call')
    const push = findAction(chart, 'fivebet_push')
    if (callSit) opts.push({ id: callSit.id, label: 'Фолд vs тайт/колл' })
    if (call) opts.push({ id: call.id, label: 'Колл 4 бета' })
    if (push) opts.push({ id: push.id, label: '5бет пуш' })
    return opts
  },

  [RANGE_SITUATION.THREE_BET_IP]: (chart) => {
    const middle = chart.actions
      .filter((a) => a.id !== 'fold' && a.id !== 'fivebet_push')
      .map((a) => ({ id: a.id, label: a.label }))
    const push = findAction(chart, 'fivebet_push')
    const opts = [FOLD, ...middle]
    if (push) opts.push({ id: push.id, label: push.label })
    return opts
  },

  [RANGE_SITUATION.DEFENCE_VS_THREE_BET_IP]: (chart) => [FOLD, ...allNonFold(chart)],
  [RANGE_SITUATION.DEFENCE_VS_THREE_BET_OOP]: (chart) => [FOLD, ...allNonFold(chart)],
}

function buildFallback(chart: RangeChartDefinition): PositionAnswerOption[] {
  const opts = chart.actions.map((a) => ({ id: a.id, label: a.label }))
  if (!opts.some((o) => o.id === 'fold')) opts.push(FOLD)
  return opts
}

export function buildPositionAnswerOptions(
  chart: RangeChartDefinition,
  selectedSituation: string,
): PositionAnswerOption[] {
  return (SITUATION_BUILDERS[selectedSituation] ?? buildFallback)(chart)
}
