<template>
  <div id="range-trainer" class="range-trainer">
    <TrainerFilters
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
  switchToCheckMode: switchToRangeMode,
  switchToRangeMode,
  switchToPositionMode,
}

defineExpose<RangeTrainerExpose>(exposedApi)
</script>

<style scoped>
.range-trainer {
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
}

.range-trainer__grid-wrap {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-sm);
  background: var(--color-surface-elevated);
}

@media (max-width: 767px) {
  .range-trainer {
    gap: var(--space-sm);
  }

  .range-trainer__grid-wrap {
    padding: 0;
    border-color: transparent;
    background: transparent;
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
