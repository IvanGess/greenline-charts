<template>
  <div class="brush-toolbar">
    <div class="brush-toolbar__shares">
      <button
        type="button"
        class="brush-share-btn"
        :class="{ 'brush-share-btn--active': brushShare === 50 }"
        @click="emit('set-share', 50)"
      >
        50%
      </button>
      <button
        type="button"
        class="brush-share-btn"
        :class="{ 'brush-share-btn--active': brushShare === 25 }"
        @click="emit('set-share', 25)"
      >
        25%
      </button>
    </div>
    <div class="brush-toolbar__actions">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="brush-btn"
        :class="{ 'brush-btn--active': activeBrush.has(action.id) }"
        :style="{ '--brush-color': action.color }"
        @click="emit('toggle-action', action.id)"
      >
        <span class="brush-btn__swatch" />
        {{ action.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartAction } from '@shared/lib/poker'

defineProps<{
  actions: ChartAction[]
  activeBrush: Set<string>
  brushShare: 50 | 25 | null
}>()

const emit = defineEmits<{
  'toggle-action': [id: string]
  'set-share': [value: 50 | 25]
}>()

defineOptions({
  name: 'ActionBrushToolbar',
})
</script>

<style scoped>
.brush-toolbar {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.brush-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.brush-toolbar__shares {
  display: flex;
  gap: var(--space-sm);
}

.brush-share-btn {
  min-width: 4rem;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  cursor: pointer;
}

.brush-share-btn--active {
  border-color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 12%, white);
}

.brush-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  cursor: pointer;
  font: inherit;
  font-size: var(--font-size-sm);
  min-height: 2.5rem;
}

.brush-btn--active {
  border-color: var(--brush-color);
  box-shadow: 0 0 0 1px var(--brush-color);
}

.brush-btn__swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 2px;
  background: var(--brush-color);
}

@media (max-width: 767px) {
  .brush-toolbar {
    padding: var(--space-sm);
  }

  .brush-toolbar__actions {
    display: grid;
    grid-template-columns: 1fr;
  }

  .brush-toolbar__shares {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .brush-btn {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
