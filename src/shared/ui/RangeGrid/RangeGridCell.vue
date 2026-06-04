<template>
  <button
    type="button"
    class="range-cell"
    :class="cellClass"
    :style="{ background: background }"
    :title="title"
    :disabled="readonly"
    @click="emit('click')"
  >
    <span class="range-cell__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { actionsToGradient } from '@shared/lib/poker'
import type { CellCheckState, CellPaint, ChartAction } from '@shared/lib/poker'

const props = defineProps<{
  label: string
  actions: CellPaint
  actionsById: Map<string, ChartAction>
  checkState?: CellCheckState
  highlightErrors?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

defineOptions({
  name: 'RangeGridCell',
})

const background = computed(() =>
  Object.keys(props.actions).length > 0
    ? actionsToGradient(props.actions, props.actionsById)
    : getDefaultCellBackground(props.label),
)

const isError = computed(
  () =>
    props.checkState === 'missing' ||
    props.checkState === 'extra' ||
    props.checkState === 'wrong-mix',
)

const cellClass = computed(() => {
  if (props.highlightErrors && isError.value) {
    return 'range-cell--error'
  }
  return null
})

const title = computed(() => {
  const ids = Object.keys(props.actions).filter((id) => Number(props.actions[id] ?? 0) > 0)
  if (!ids.length) return props.label
  return `${props.label}: ${ids.join(', ')}`
})

function getDefaultCellBackground(label: string): string {
  if (label.length === 2 && label[0] === label[1]) {
    // Диагональ: карманные пары
    return '#bcc4bf'
  }

  if (label.endsWith('s')) {
    // Над диагональю: suited
    return '#d2d9d5'
  }

  // Под диагональю: offsuit
  return '#e3e9e6'
}
</script>

<style scoped>
.range-cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 1;
  padding: 0;
  border: 0;
  border-radius: 4px;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  box-shadow: inset 0 0 0 1px rgb(26 46 36 / 12%);
  overflow: hidden;
  cursor: pointer;
  font: inherit;
  font-size: clamp(0.42rem, 1.25vw, 0.75rem);
  line-height: 1;
}

.range-cell::after {
  content: '';
  position: absolute;
  inset: 1px;
  border: 2px solid transparent;
  pointer-events: none;
}

.range-cell:disabled {
  cursor: default;
}

.range-cell__label {
  position: relative;
  z-index: 1;
  color: #000;
  text-shadow: none;
  pointer-events: none;
}

.range-cell--error {
  z-index: 1;
}

.range-cell--error::after {
  inset: 0;
  border-width: 3px;
  border-color: #000;
}
</style>
