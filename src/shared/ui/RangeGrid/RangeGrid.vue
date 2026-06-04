<template>
  <div
    ref="gridRef"
    class="range-grid"
    :class="{
      'range-grid--compressed': isCompressed,
      'range-grid--success': borderState === 'success',
      'range-grid--error': borderState === 'error',
    }"
    :style="gridStyle"
    role="grid"
    aria-label="Матрица рук"
  >
    <RangeGridCell
      v-for="cell in flatCells"
      :key="cell.key"
      :label="cell.label"
      :actions="displayCells[cell.key] ?? {}"
      :actions-by-id="actionsById"
      :check-state="checkResults?.[cell.key]?.state"
      :highlight-errors="highlightErrors"
      :readonly="readonly"
      @click="emit('cell-click', cell.key)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

import { HAND_MATRIX } from '@shared/lib/poker'
import type { CellCheckResult, CellPaint, ChartAction, HandKey } from '@shared/lib/poker'

import RangeGridCell from './RangeGridCell.vue'

defineProps<{
  displayCells: Record<HandKey, CellPaint>
  actionsById: Map<string, ChartAction>
  checkResults?: Record<HandKey, CellCheckResult> | null
  borderState?: 'success' | 'error' | null
  highlightErrors?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  'cell-click': [key: HandKey]
}>()

defineOptions({
  name: 'RangeGrid',
})

const flatCells = computed(() => HAND_MATRIX.flat())
const gridRef = ref<HTMLElement | null>(null)
const isCompressed = ref(false)
const compressedWidthPx = ref<number | null>(null)

const gridStyle = computed(() => {
  if (!isCompressed.value || !compressedWidthPx.value) return undefined
  const width = `${compressedWidthPx.value}px`
  return { width, minWidth: width }
})

function updateCompression(): void {
  const grid = gridRef.value
  if (!grid) return

  const isMobile = window.matchMedia('(max-width: 767px)').matches
  const rootFontPx = Number.parseFloat(
    window.getComputedStyle(document.documentElement).fontSize,
  )

  const cellRem = isMobile ? 2 : 3
  const gapPx = isMobile ? 1 : 2
  const borderPx = isMobile ? 1 : 2
  const requiredWidth = cellRem * rootFontPx * 13 + gapPx * 12 + borderPx * 2

  // Measure the actual available container width excluding its own padding
  const parent = grid.parentElement
  let availableWidth: number
  if (parent) {
    const style = window.getComputedStyle(parent)
    const paddingLeft = Number.parseFloat(style.paddingLeft) || 0
    const paddingRight = Number.parseFloat(style.paddingRight) || 0
    availableWidth = parent.clientWidth - paddingLeft - paddingRight
  } else {
    availableWidth = window.visualViewport?.width ?? document.documentElement.clientWidth ?? window.innerWidth
  }

  if (requiredWidth > availableWidth) {
    isCompressed.value = true
    compressedWidthPx.value = Math.floor(availableWidth)
  } else {
    isCompressed.value = false
    compressedWidthPx.value = null
  }
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateCompression()
  window.addEventListener('resize', updateCompression)
  window.visualViewport?.addEventListener('resize', updateCompression)

  // Also watch the parent container — it can resize independently of the viewport
  // when the sidebar changes width (e.g. tablet breakpoint switches column sizes)
  const parent = gridRef.value?.parentElement
  if (parent && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateCompression)
    resizeObserver.observe(parent)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCompression)
  window.visualViewport?.removeEventListener('resize', updateCompression)
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.range-grid {
  --cell-size-base: 3rem;
  display: grid;
  grid-template-columns: repeat(13, var(--cell-size-base));
  gap: 2px;
  width: max-content;
  min-width: max-content;
  margin-inline: auto;
  background: var(--color-border);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

/* Compressed mode works at any breakpoint, not just mobile */
.range-grid--compressed {
  grid-template-columns: repeat(13, minmax(0, 1fr));
}

.range-grid--success {
  border-color: var(--color-accent-strong);
  box-shadow: 0 0 0 4px var(--color-accent-glow);
}

.range-grid--error {
  border-color: #c62828;
  box-shadow: 0 0 0 4px rgb(198 40 40 / 26%);
}

@media (max-width: 767px) {
  .range-grid {
    --cell-size-base: 2rem;
    gap: 1px;
    border-width: 1px;
  }
}
</style>
