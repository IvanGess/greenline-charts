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

import { useActivePainter } from './useActivePainter'
import { useAssignMode } from './useAssignMode'
import { usePositionTrainer } from './usePositionTrainer'

export type ReviewView = 'solution' | 'user'
export type TrainerMode = 'ranges' | 'position'

export function useTrainerSession() {
  // --- Filters ---
  const allSituations = listSituations()
  const selectedSituation = ref<string>(allSituations[0] ?? '')
  const selectedPosition = ref<string>('')
  const randomPositionEnabled = ref(false)
  const skipPositionRefreshOnChartChange = ref(false)

  const situationOptions = computed(() => listSituations())
  const positionOptions = computed(() => listPositionsForSituation(selectedSituation.value))

  watch(
    positionOptions,
    (positions) => {
      if (!positions.length) { selectedPosition.value = ''; return }
      if (!positions.includes(selectedPosition.value)) selectedPosition.value = positions[0]
    },
    { immediate: true },
  )

  watch(selectedSituation, () => {
    const positions = positionOptions.value
    if (positions.length) selectedPosition.value = positions[0]
  }, { immediate: true })

  // --- Chart selection ---
  const filteredCharts = computed(() =>
    filterCharts(selectedPosition.value || null, selectedSituation.value || null),
  )
  const currentChart = computed(() => filteredCharts.value[0])

  // --- Mode ---
  const mode = ref<TrainerMode>('ranges')
  const reviewView = ref<ReviewView>('solution')
  const isPositionMode = computed(() => mode.value === 'position')

  // --- Painters ---
  const mainPainter = useRangePainter(() => currentChart.value)
  const assignPainter = useRangePainter(() => currentChart.value)

  // --- Check ---
  const { checkResults, mistakeCount, runCheck } = useRangeCheck(
    currentChart,
    mainPainter.userCells,
    mainPainter.showCheck,
  )

  // --- Assign mode ---
  const canStartAssignInCurrentView = computed(
    () => !(mainPainter.showCheck.value && reviewView.value === 'solution'),
  )
  const assignMode = useAssignMode(currentChart, assignPainter, mode, canStartAssignInCurrentView)
  const { isAssignMode, canStartAssignMode, canSaveAssignedSolution, startAssignMode, cancelAssignMode, saveAssignedSolution } = assignMode

  // --- Active painter proxy (removes all if/else isAssignMode branching) ---
  const activePainter = useActivePainter(mainPainter, assignPainter, isAssignMode)

  // --- Position trainer ---
  const positionTrainer = usePositionTrainer(currentChart, selectedSituation, {
    beforeNextHand: () => {
      if (mode.value === 'position' && randomPositionEnabled.value) {
        assignRandomPosition()
      }
    },
  })

  // --- Watchers ---
  watch(() => currentChart.value?.id, () => {
    assignMode.refreshForChartChange()
    if (isPositionMode.value && !skipPositionRefreshOnChartChange.value) {
      positionTrainer.refreshForChartChange()
    }
  })

  watch(mainPainter.showCheck, (on) => {
    if (!on) reviewView.value = 'solution'
  })

  // --- Derived display state ---
  const isReviewingSolution = computed(
    () => !isAssignMode.value && mainPainter.showCheck.value && reviewView.value === 'solution',
  )

  const displayCells = computed((): Record<HandKey, CellPaint> => {
    if (isAssignMode.value) return assignPainter.userCells
    if (!mainPainter.showCheck.value) return mainPainter.userCells
    if (reviewView.value === 'user') return mainPainter.userCells

    const chart = currentChart.value
    if (!chart) return {}

    const out = chartSolutionToPaintMap(chart)
    const check = checkResults.value
    if (check) {
      for (const [key, result] of Object.entries(check)) {
        if (result.state === 'extra' && result.actual.length) {
          const share = 100 / result.actual.length
          out[key] = Object.fromEntries(result.actual.map((id) => [id, share]))
        }
      }
    }
    return out
  })

  const gridReadonly = computed(() => !isAssignMode.value && isReviewingSolution.value)

  // --- Primary button ---
  const primaryButtonLabel = computed(() => {
    if (!mainPainter.showCheck.value) return 'Проверить'
    return reviewView.value === 'solution' ? 'Просмотреть ответ' : 'Проверить'
  })

  const primaryButtonIcon = computed(() => {
    if (!mainPainter.showCheck.value) return 'pi pi-check'
    return reviewView.value === 'solution' ? 'pi pi-user' : 'pi pi-check'
  })

  function onPrimaryAction(): void {
    if (isAssignMode.value) return
    if (!mainPainter.showCheck.value) {
      runCheck()
      reviewView.value = 'solution'
      return
    }
    reviewView.value = reviewView.value === 'solution' ? 'user' : 'solution'
  }

  function clearAll(): void {
    if (isAssignMode.value || isPositionMode.value) return
    reviewView.value = 'solution'
    mainPainter.clearAll()
  }

  // --- Navigation ---
  function switchToPositionMode(): void {
    cancelAssignMode()
    mode.value = 'position'
    positionTrainer.ensureQuestion()
  }

  function switchToRangeMode(): void {
    cancelAssignMode()
    mode.value = 'ranges'
  }

  // --- Random position ---
  const isPositionSelectDisabled = computed(
    () => mode.value === 'position' && randomPositionEnabled.value,
  )

  function setRandomPositionEnabled(value: boolean): void {
    randomPositionEnabled.value = value
    if (value && mode.value === 'position') positionTrainer.nextPositionHand()
  }

  function assignRandomPosition(): void {
    const options = positionOptions.value
    if (!options.length) return
    if (options.length === 1) { selectedPosition.value = options[0]; return }
    const candidates = options.filter((o) => o !== selectedPosition.value)
    const pool = candidates.length ? candidates : options
    skipPositionRefreshOnChartChange.value = true
    selectedPosition.value = pool[Math.floor(Math.random() * pool.length)]
    queueMicrotask(() => { skipPositionRefreshOnChartChange.value = false })
  }

  return {
    filters: {
      selectedPosition,
      selectedSituation,
      positionOptions,
      situationOptions,
      filteredCharts,
      randomPositionEnabled,
      isPositionSelectDisabled,
      setRandomPositionEnabled,
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
      actionsById: mainPainter.actionsById,
      checkResults,
      checkResultsForGrid: computed(() => (isAssignMode.value ? null : checkResults.value)),
      mistakeCount,
      clearAll,
      ...activePainter,
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
    position: {
      ...positionTrainer,
    },
  }
}
