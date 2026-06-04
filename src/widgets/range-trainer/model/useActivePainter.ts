import { computed, type Ref } from 'vue'

import type { useRangePainter } from '@features/range-paint'
import type { HandKey } from '@shared/lib/poker'

type PainterInstance = ReturnType<typeof useRangePainter>

/**
 * Selects the correct painter (main vs assign) and proxies all
 * paint-related operations to it — removing the dual if/else pattern
 * from useTrainerSession.
 */
export function useActivePainter(
  mainPainter: PainterInstance,
  assignPainter: PainterInstance,
  isAssignMode: Ref<boolean>,
) {
  const activePainter = computed<PainterInstance>(() =>
    isAssignMode.value ? assignPainter : mainPainter,
  )

  const activeBrush = computed(() => activePainter.value.activeBrush.value)
  const brushShare = computed(() => activePainter.value.brushShare.value)

  function setBrushShare(value: 50 | 25): void {
    activePainter.value.setBrushShare(value)
  }

  function toggleBrushAction(actionId: string): void {
    activePainter.value.toggleBrushAction(actionId)
  }

  function paintCell(key: HandKey): void {
    activePainter.value.paintCell(key)
  }

  return { activeBrush, brushShare, setBrushShare, toggleBrushAction, paintCell }
}
