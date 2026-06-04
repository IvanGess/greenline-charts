import { RANGE_SITUATION } from '@entities/range'
import type { RangeChartDefinition } from '@shared/lib/poker'

export interface PositionAnswerOption {
  id: string
  label: string
}

export function buildPositionAnswerOptions(
  chart: RangeChartDefinition,
  selectedSituation: string,
): PositionAnswerOption[] {
  if (selectedSituation === RANGE_SITUATION.OPEN_RAISE_FI) {
    const hasRaise = chart.actions.some((action) => action.id === 'raise')
    const hasRaiseSituational = chart.actions.some((action) => action.id === 'raise_situational')
    const options: PositionAnswerOption[] = [{ id: 'fold', label: 'Фолд' }]
    if (hasRaise) {
      options.push({ id: 'raise', label: 'Рэйз' })
    }
    if (hasRaiseSituational) {
      options.push({ id: 'raise_situational', label: 'Рэйз в фиша/фолд' })
    }
    return options
  }

  if (selectedSituation === RANGE_SITUATION.ISOLATE) {
    const callAction = chart.actions.find((action) => action.id === 'complete' || action.id === 'call')
    const raiseAction = chart.actions.find((action) => action.id === 'iso' || action.id === 'isolate')
    const options: PositionAnswerOption[] = [{ id: 'fold', label: 'Фолд' }]
    if (callAction) {
      options.push({ id: callAction.id, label: 'Колл' })
    }
    if (raiseAction) {
      options.push({ id: raiseAction.id, label: 'Рэйз' })
    }
    return options
  }

  if (selectedSituation === RANGE_SITUATION.SMALL_BLINDS_DEFENCE) {
    const actionOptions = chart.actions
      .filter((action) => action.id !== 'fold')
      .map((action) => ({ id: action.id, label: action.label }))
    return [{ id: 'fold', label: 'Фолд' }, ...actionOptions]
  }

  if (selectedSituation === RANGE_SITUATION.BIG_BLINDS_DEFENCE) {
    const callAction = chart.actions.find((action) => action.id === 'call')
    const threeBetAction = chart.actions.find((action) => action.id === 'threebet')
    const options: PositionAnswerOption[] = [{ id: 'fold', label: 'Фолд' }]
    if (callAction) {
      options.push({ id: callAction.id, label: 'Колл' })
    }
    if (threeBetAction) {
      options.push({ id: threeBetAction.id, label: '3 бет' })
    }
    return options
  }

  if (selectedSituation === RANGE_SITUATION.BLINDS_DEFENCE_VS_4BET) {
    const callSituationalAction = chart.actions.find((action) => action.id === 'call_situational')
    const callAction = chart.actions.find((action) => action.id === 'call')
    const fiveBetPushAction = chart.actions.find((action) => action.id === 'fivebet_push')
    const options: PositionAnswerOption[] = [{ id: 'fold', label: 'Фолд' }]
    if (callSituationalAction) {
      options.push({ id: callSituationalAction.id, label: 'Фолд vs тайт/колл' })
    }
    if (callAction) {
      options.push({ id: callAction.id, label: 'Колл 4 бета' })
    }
    if (fiveBetPushAction) {
      options.push({ id: fiveBetPushAction.id, label: '5бет пуш' })
    }
    return options
  }

  if (selectedSituation === RANGE_SITUATION.THREE_BET_IP) {
    const middleActions = chart.actions
      .filter((action) => action.id !== 'fold' && action.id !== 'fivebet_push')
      .map((action) => ({ id: action.id, label: action.label }))
    const fiveBetPushAction = chart.actions.find((action) => action.id === 'fivebet_push')
    const options: PositionAnswerOption[] = [{ id: 'fold', label: 'Фолд' }, ...middleActions]
    if (fiveBetPushAction) {
      options.push({ id: fiveBetPushAction.id, label: fiveBetPushAction.label })
    }
    return options
  }

  if (
    selectedSituation === RANGE_SITUATION.DEFENCE_VS_THREE_BET_IP ||
    selectedSituation === RANGE_SITUATION.DEFENCE_VS_THREE_BET_OOP
  ) {
    const actionOptions = chart.actions
      .filter((action) => action.id !== 'fold')
      .map((action) => ({ id: action.id, label: action.label }))
    return [{ id: 'fold', label: 'Фолд' }, ...actionOptions]
  }

  const options: PositionAnswerOption[] = chart.actions.map((action) => ({
    id: action.id,
    label: action.label,
  }))
  if (!options.some((option) => option.id === 'fold')) {
    options.push({
      id: 'fold',
      label: 'Фолд',
    })
  }
  return options
}
