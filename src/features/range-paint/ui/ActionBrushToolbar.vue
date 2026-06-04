<template>
  <div class="brush-toolbar">
    <p class="brush-toolbar__label">Кисть / доля</p>
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
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-soft);
}

.brush-toolbar__label {
  margin: 0 0 var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.brush-toolbar__actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.brush-toolbar__shares {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

.brush-share-btn {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
}

.brush-share-btn--active {
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent), inset 0 0 8px var(--color-accent-glow);
}

.brush-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-elevated);
  color: var(--color-text);
  cursor: pointer;
  font: inherit;
  font-size: var(--font-size-sm);
  min-height: 2.25rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.brush-btn--active {
  border-color: var(--brush-color);
  box-shadow: 0 0 0 1px var(--brush-color), inset 0 0 10px color-mix(in srgb, var(--brush-color) 18%, transparent);
}

.brush-btn__swatch {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 2px;
  background: var(--brush-color);
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .brush-toolbar {
    padding: var(--space-sm);
  }

  .brush-btn {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
