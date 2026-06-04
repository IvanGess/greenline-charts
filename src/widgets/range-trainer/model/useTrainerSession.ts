import { computed, ref, watch } from 'vue'

import {
  filterCharts,
  listPositionsForSituation,
  listSituations,
} from '@entities/range'
import { useRangeCheck } from '@features/range-check'
import { useRangePainter } from '@features/range-paint'
import { chartSolutionToPaintMap } from '@shared/lib/poker'
import type { CellPaint, HandKey } from '@shared/lib/poker'

import { useAssignMode } from './useAssignMode'
import { usePositionTrainer } from './usePositionTrainer'

export type ReviewView = 'solution' | 'user'
export type TrainerMode = 'ranges' | 'position'

export function useTrainerSession() {
  const allSituations = listSituations()
  const selectedSituation = ref<string>(allSituations[0] ?? '')
  const selectedPosition = ref<string>('')
  const mode = ref<TrainerMode>('ranges')
  const reviewView = ref<ReviewView>('solution')
  const situationOptions = computed(() => listSituations())
  const positionOptions = computed(() => listPositionsForSituation(selectedSituation.value))

  watch(
    positionOptions,
    (positions) => {
      if (!positions.length) {
        selectedPosition.value = ''
        return
      }
      if (!positions.includes(selectedPosition.value)) {
        selectedPosition.value = positions[0]
      }
    },
    { immediate: true },
  )

  watch(
    selectedSituation,
    () => {
      const positions = positionOptions.value
      if (positions.length) {
        selectedPosition.value = positions[0]
      }
    },
    { immediate: true },
  )

  const filteredCharts = computed(() =>
    filterCharts(selectedPosition.value || null, selectedSituation.value || null),
  )

  const currentChart = computed(() => filteredCharts.value[0])
  const isPositionMode = computed(() => mode.value === 'position')

  const painter = useRangePainter(() => currentChart.value)
  const assignPainter = useRangePainter(() => currentChart.value)
  const { checkResults, mistakeCount, runCheck } = useRangeCheck(
    currentChart,
    painter.userCells,
    painter.showCheck,
  )
  const positionTrainer = usePositionTrainer(currentChart, selectedSituation)
  const canStartAssignInCurrentView = computed(
    () => !(painter.showCheck.value && reviewView.value === 'solution'),
  )
  const assignMode = useAssignMode(
    currentChart,
    assignPainter,
    mode,
    canStartAssignInCurrentView,
  )
  const {
    isAssignMode,
    canStartAssignMode,
    canSaveAssignedSolution,
    startAssignMode,
    cancelAssignMode,
    saveAssignedSolution,
  } = assignMode

  watch(
    () => currentChart.value?.id,
    () => {
      assignMode.refreshForChartChange()
      if (isPositionMode.value) {
        positionTrainer.refreshForChartChange()
      }
    },
  )

  watch(painter.showCheck, (on) => {
    if (!on) reviewView.value = 'solution'
  })

  const isReviewingSolution = computed(
    () => !isAssignMode.value && painter.showCheck.value && reviewView.value === 'solution',
  )

  const displayCells = computed((): Record<HandKey, CellPaint> => {
    if (isAssignMode.value) {
      return assignPainter.userCells
    }
    if (!painter.showCheck.value) {
      return painter.userCells
    }
    if (reviewView.value === 'user') {
      return painter.userCells
    }
    const chart = currentChart.value
    if (!chart) return {}
    const out = chartSolutionToPaintMap(chart)
    const check = checkResults.value
    if (check) {
      for (const [key, result] of Object.entries(check)) {
        if (result.state === 'extra') {
          const actual = result.actual
          if (!actual.length) continue
          const share = 100 / actual.length
          out[key] = {}
          for (const actionId of actual) {
            out[key][actionId] = share
          }
        }
      }
    }
    return out
  })

  const gridReadonly = computed(() => (isAssignMode.value ? false : isReviewingSolution.value))

  function runCheckAndShowSolution(): void {
    runCheck()
    reviewView.value = 'solution'
  }

  function onPrimaryAction(): void {
    if (isAssignMode.value) return
    if (!painter.showCheck.value) {
      runCheckAndShowSolution()
      return
    }
    reviewView.value = reviewView.value === 'solution' ? 'user' : 'solution'
  }

  const primaryButtonLabel = computed(() => {
    if (isAssignMode.value) return 'Проверить'
    if (!painter.showCheck.value) return 'Проверить'
    return reviewView.value === 'solution' ? 'Просмотреть ответ' : 'Проверить'
  })

  const primaryButtonIcon = computed(() => {
    if (isAssignMode.value) return 'pi pi-check'
    if (!painter.showCheck.value) return 'pi pi-check'
    return reviewView.value === 'solution' ? 'pi pi-user' : 'pi pi-check'
  })

  function clearAll(): void {
    if (isAssignMode.value) return
    if (isPositionMode.value) return
    reviewView.value = 'solution'
    painter.clearAll()
  }

  const activeBrush = computed(() =>
    isAssignMode.value ? assignPainter.activeBrush.value : painter.activeBrush.value,
  )

  const brushShare = computed(() =>
    isAssignMode.value ? assignPainter.brushShare.value : painter.brushShare.value,
  )

  const checkResultsForGrid = computed(() => (isAssignMode.value ? null : checkResults.value))

  function setBrushShare(value: 50 | 25): void {
    if (isAssignMode.value) {
      assignPainter.setBrushShare(value)
      return
    }
    painter.setBrushShare(value)
  }

  function toggleBrushAction(actionId: string): void {
    if (isAssignMode.value) {
      assignPainter.toggleBrushAction(actionId)
      return
    }
    painter.toggleBrushAction(actionId)
  }

  function paintCell(key: HandKey): void {
    if (isAssignMode.value) {
      assignPainter.paintCell(key)
      return
    }
    painter.paintCell(key)
  }

  function switchToPositionMode(): void {
    cancelAssignMode()
    mode.value = 'position'
    positionTrainer.ensureQuestion()
  }

  function switchToRangeMode(): void {
    cancelAssignMode()
    mode.value = 'ranges'
  }

  return {
    filters: {
      selectedPosition,
      selectedSituation,
      positionOptions,
      situationOptions,
      filteredCharts,
    },
    modes: {
      mode,
      reviewView,
      currentChart,
      isPositionMode,
      isReviewingSolution,
    },
    range: {
      displayCells,
      gridReadonly,
      primaryButtonLabel,
      primaryButtonIcon,
      onPrimaryAction,
      activeBrush,
      brushShare,
      actionsById: painter.actionsById,
      checkResults,
      checkResultsForGrid,
      mistakeCount,
      setBrushShare,
      toggleBrushAction,
      paintCell,
      clearAll,
    },
    assign: {
      isAssignMode,
      canStartAssignMode,
      canSaveAssignedSolution,
      startAssignMode,
      cancelAssignMode,
      saveAssignedSolution,
    },
    navigation: {
      switchToPositionMode,
      switchToRangeMode,
    },
    position: positionTrainer,
  }
}
