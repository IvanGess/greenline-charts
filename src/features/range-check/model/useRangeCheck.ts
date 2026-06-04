import { computed, type Ref } from 'vue'

import type { CellPaint, HandKey, RangeChartDefinition } from '@shared/lib/poker'
import { countMistakes, validateUserRange } from '@shared/lib/poker'

export function useRangeCheck(
  chart: Ref<RangeChartDefinition | undefined>,
  userCells: Record<HandKey, CellPaint>,
  showCheck: Ref<boolean>,
) {
  const checkResults = computed(() => {
    if (!showCheck.value || !chart.value) return null
    return validateUserRange(chart.value, userCells)
  })

  const mistakeCount = computed(() => {
    if (!checkResults.value) return 0
    return countMistakes(checkResults.value)
  })

  function runCheck(): void {
    showCheck.value = true
  }

  return {
    checkResults,
    mistakeCount,
    runCheck,
  }
}
