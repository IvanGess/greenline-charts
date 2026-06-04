<template>
  <section class="trainer-filters">
    <div class="trainer-filters__grid">
      <FloatLabel variant="on" class="trainer-filters__field">
        <Select
          input-id="position_select"
          :model-value="selectedPosition"
          :options="positionOptions"
          class="trainer-filters__input"
          :disabled="positionSelectDisabled"
          @update:model-value="onPositionChange"
        />
        <label for="position_select">Позиция</label>
      </FloatLabel>
      <FloatLabel variant="on" class="trainer-filters__field">
        <Select
          input-id="situation_select"
          :model-value="selectedSituation"
          :options="situationOptions"
          class="trainer-filters__input"
          @update:model-value="onSituationChange"
        />
        <label for="situation_select">Ситуация</label>
      </FloatLabel>
    </div>
    <label v-if="showRandomPositionToggle" class="trainer-filters__toggle">
      <Checkbox
        input-id="random_position_toggle"
        :model-value="randomPositionEnabled"
        binary
        @update:model-value="onRandomPositionToggle"
      />
      <span>Рандомная позиция</span>
    </label>

    <ActionBrushToolbar
      v-if="showBrushToolbar && actions.length"
      :actions="actions"
      :active-brush="activeBrush"
      :brush-share="brushShare"
      @toggle-action="emit('toggle-action', $event)"
      @set-share="emit('set-share', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import Checkbox from 'primevue/checkbox'
import FloatLabel from 'primevue/floatlabel'
import Select from 'primevue/select'

import { ActionBrushToolbar } from '@features/range-paint'
import type { ChartAction } from '@shared/lib/poker'

defineProps<{
  selectedPosition: string
  selectedSituation: string
  positionOptions: string[]
  situationOptions: string[]
  actions: ChartAction[]
  activeBrush: Set<string>
  brushShare: 50 | 25 | null
  showBrushToolbar: boolean
  showRandomPositionToggle: boolean
  randomPositionEnabled: boolean
  positionSelectDisabled: boolean
}>()

const emit = defineEmits<{
  'update:selectedPosition': [value: string]
  'update:selectedSituation': [value: string]
  'update:randomPositionEnabled': [value: boolean]
  'toggle-action': [actionId: string]
  'set-share': [value: 50 | 25]
}>()

defineOptions({
  name: 'TrainerFilters',
})

function onPositionChange(value: unknown): void {
  emit('update:selectedPosition', String(value ?? ''))
}

function onSituationChange(value: unknown): void {
  emit('update:selectedSituation', String(value ?? ''))
}

function onRandomPositionToggle(value: unknown): void {
  emit('update:randomPositionEnabled', Boolean(value))
}
</script>

<style scoped>
.trainer-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.trainer-filters__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-md);
}

.trainer-filters__field {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.trainer-filters__input {
  width: 100%;
}

.trainer-filters__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

@media (max-width: 1023px) {
  .trainer-filters {
    padding: var(--space-md);
  }

  .trainer-filters__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .trainer-filters {
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    box-shadow: none;
    border-color: rgb(0 0 0 / 6%);
  }

  .trainer-filters__grid {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }
}
</style>
