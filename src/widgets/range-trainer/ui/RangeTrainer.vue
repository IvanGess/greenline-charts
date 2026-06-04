<template>
  <div id="range-trainer" class="range-trainer">
    <TrainerFilters
      class="range-trainer__sidebar"
      :selected-position="selectedPosition"
      :selected-situation="selectedSituation"
      :position-options="positionOptions"
      :situation-options="situationOptions"
      :actions="currentChart?.actions ?? []"
      :active-brush="activeBrush"
      :brush-share="brushShare"
      :show-brush-toolbar="Boolean(currentChart) && !isPositionMode"
      :show-random-position-toggle="isPositionMode"
      :random-position-enabled="randomPositionEnabled"
      :position-select-disabled="isPositionSelectDisabled"
      @update:selected-position="selectedPosition = $event"
      @update:selected-situation="selectedSituation = $event"
      @update:random-position-enabled="setRandomPositionEnabled"
      @toggle-action="toggleBrushAction"
      @set-share="setBrushShare"
    />

    <div class="range-trainer__content">
      <template v-if="currentChart">
        <PositionTrainerPanel
          v-if="isPositionMode"
          :current-question="currentQuestion"
          :position-answer-options="positionAnswerOptions"
          :last-answer-correct="lastAnswerCorrect"
          :expected-answer-labels="expectedAnswerLabels"
          :asked-count="askedCount"
          :correct-count="correctCount"
          :position-accuracy="positionAccuracy"
          :chart-position="currentChart.position"
          :selected-position="selectedPosition"
          @answer="answerPositionAction"
        />

        <div v-else class="range-trainer__grid-wrap">
          <RangeGrid
            :display-cells="displayCells"
            :actions-by-id="actionsById"
            :check-results="checkResultsForGrid"
            :border-state="gridBorderState"
            :highlight-errors="isReviewingSolution"
            :readonly="gridReadonly"
            @cell-click="paintCell"
          />
          <div class="range-trainer__toolbar">
            <template v-if="isAssignMode">
              <Button label="Отменить" severity="secondary" outlined @click="cancelAssignMode" />
              <Button
                label="Сохранить"
                icon="pi pi-save"
                :disabled="!canSaveAssignedSolution"
                @click="saveAssignedSolution"
              />
            </template>
            <template v-else>
              <Button :label="primaryButtonLabel" :icon="primaryButtonIcon" @click="onPrimaryAction" />
              <Button label="Очистить" severity="secondary" outlined @click="clearAll" />
            </template>
          </div>
        </div>
      </template>

      <Message v-else severity="warn" :closable="false">
        Выберите чарт с непустым эталоном.
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import Button from 'primevue/button'
import Message from 'primevue/message'

import { RangeGrid } from '@shared/ui'

import { useTrainerSession } from '../model/useTrainerSession'
import type { RangeTrainerExpose } from '../model/types'
import PositionTrainerPanel from './PositionTrainerPanel.vue'
import TrainerFilters from './TrainerFilters.vue'

defineOptions({
  name: 'RangeTrainer',
})

const session = useTrainerSession()
const {
  selectedPosition,
  selectedSituation,
  positionOptions,
  situationOptions,
  randomPositionEnabled,
  isPositionSelectDisabled,
  setRandomPositionEnabled,
} = session.filters
const { currentChart, isPositionMode, isReviewingSolution } = session.modes
const {
  displayCells,
  gridReadonly,
  primaryButtonLabel,
  primaryButtonIcon,
  onPrimaryAction,
  activeBrush,
  brushShare,
  actionsById,
  checkResults,
  checkResultsForGrid,
  mistakeCount,
  setBrushShare,
  toggleBrushAction,
  paintCell,
  clearAll,
} = session.range
const {
  isAssignMode,
  canStartAssignMode,
  canSaveAssignedSolution,
  startAssignMode,
  cancelAssignMode,
  saveAssignedSolution,
} = session.assign
const { switchToPositionMode, switchToRangeMode } = session.navigation
const {
  currentQuestion,
  positionAnswerOptions,
  answerPositionAction,
  lastAnswerCorrect,
  expectedAnswerLabels,
  askedCount,
  correctCount,
  positionAccuracy,
} = session.position

const gridBorderState = computed<'success' | 'error' | null>(() => {
  if (isPositionMode.value || isAssignMode.value) return null
  if (!checkResults.value) return null
  return mistakeCount.value === 0 ? 'success' : 'error'
})

const exposedApi: RangeTrainerExpose = {
  startAssignMode,
  canStartAssignMode: () => canStartAssignMode.value,
  switchToRangeMode,
  switchToPositionMode,
}

defineExpose<RangeTrainerExpose>(exposedApi)
</script>

<style scoped>
.range-trainer {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-lg);
  align-items: start;
}

.range-trainer__content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.range-trainer__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.range-trainer__grid-wrap {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-md);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-md);
}

@media (max-width: 1023px) {
  .range-trainer {
    grid-template-columns: 240px 1fr;
  }
}

@media (max-width: 767px) {
  .range-trainer {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .range-trainer__grid-wrap {
    padding: var(--space-sm);
    border-color: var(--color-border-subtle);
    background: var(--color-surface-elevated);
  }

  .range-trainer__toolbar {
    display: grid;
    grid-template-columns: 1fr;
    width: 100%;
  }

  .range-trainer__toolbar :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
