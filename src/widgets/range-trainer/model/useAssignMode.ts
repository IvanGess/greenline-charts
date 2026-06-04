import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { overrideChartSolution } from '@entities/range'
import { chartSolutionToPaintMap } from '@shared/lib/poker'
import type { CellPaint, HandKey, RangeChartDefinition } from '@shared/lib/poker'

interface AssignPainterApi {
  userCells: Record<HandKey, CellPaint>
  resetUserCells: () => void
}

export function useAssignMode(
  currentChart: ComputedRef<RangeChartDefinition | undefined>,
  assignPainter: AssignPainterApi,
  mode: Ref<'ranges' | 'position'>,
  canStartInCurrentView: ComputedRef<boolean>,
) {
  const isAssignMode = ref(false)

  const canStartAssignMode = computed(
    () => !!currentChart.value && !isAssignMode.value && canStartInCurrentView.value,
  )
  const canSaveAssignedSolution = computed(() => !!currentChart.value && isAssignMode.value)

  function startAssignMode(): void {
    if (!canStartAssignMode.value) return
    mode.value = 'ranges'
    resetAssignDraft()
    isAssignMode.value = true
  }

  function cancelAssignMode(): void {
    isAssignMode.value = false
    assignPainter.resetUserCells()
  }

  function saveAssignedSolution(): void {
    const chart = currentChart.value
    if (!chart) return

    const nextSolution: Record<HandKey, CellPaint> = {}
    for (const [key, paint] of Object.entries(assignPainter.userCells)) {
      if (!Object.keys(paint).length) continue
      nextSolution[key] = { ...paint }
    }

    overrideChartSolution(chart.id, nextSolution)
  }

  function resetAssignDraft(): void {
    const chart = currentChart.value
    assignPainter.resetUserCells()
    if (!chart) return

    const cells = chartSolutionToPaintMap(chart)
    for (const [key, paint] of Object.entries(cells)) {
      if (!Object.keys(paint).length) continue
      assignPainter.userCells[key] = { ...paint }
    }
  }

  function refreshForChartChange(): void {
    if (isAssignMode.value) {
      resetAssignDraft()
    }
  }

  return {
    isAssignMode,
    canStartAssignMode,
    canSaveAssignedSolution,
    startAssignMode,
    cancelAssignMode,
    saveAssignedSolution,
    refreshForChartChange,
  }
}
