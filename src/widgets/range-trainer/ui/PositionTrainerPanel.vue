<template>
  <section class="position-trainer">
    <PokerTableSeats :display-seats="displaySeats" :active-seat="trainedSeat" />

    <div class="position-trainer__cards">
      <PlayingCard
        v-for="(card, index) in currentQuestion?.cards ?? []"
        :key="`${card.rank}-${card.suit}-${index}`"
        :rank="card.rank"
        :suit="card.suit"
      />
    </div>

    <p class="position-trainer__question">Что делаем в этой ситуации?</p>

    <div class="position-trainer__answers">
      <Button
        v-for="option in positionAnswerOptions"
        :key="option.id"
        :label="option.label"
        severity="secondary"
        @click="emit('answer', option.id)"
      />
    </div>

    <Message
      v-if="lastAnswerCorrect !== null"
      :severity="lastAnswerCorrect ? 'success' : 'error'"
      :closable="false"
    >
      {{
        lastAnswerCorrect
          ? 'Верно!'
          : `Неверно. Правильные действия: ${expectedAnswerLabels.join(', ')}`
      }}
    </Message>

    <div class="position-trainer__footer">
      <TrainerStatsBar
        :correct-count="correctCount"
        :asked-count="askedCount"
        :accuracy="positionAccuracy"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import Button from 'primevue/button'
import Message from 'primevue/message'

import { PlayingCard } from '@shared/ui'

import type { PositionAnswerOption } from '../model/positionAnswerOptions'
import type { PositionQuestion } from '../model/usePositionTrainer'
import PokerTableSeats from './PokerTableSeats.vue'
import type { DisplaySeat } from './PokerTableSeats.vue'
import TrainerStatsBar from './TrainerStatsBar.vue'

const SEATS = ['UTG', 'MP', 'CO', 'BU', 'SB', 'BB'] as const
type Seat = (typeof SEATS)[number]

const SEAT_SLOTS = [
  'poker-table-seats__seat--ep',
  'poker-table-seats__seat--mp',
  'poker-table-seats__seat--co',
  'poker-table-seats__seat--bu',
  'poker-table-seats__seat--sb',
  'poker-table-seats__seat--bb',
] as const

const props = defineProps<{
  currentQuestion: PositionQuestion | null
  positionAnswerOptions: PositionAnswerOption[]
  lastAnswerCorrect: boolean | null
  expectedAnswerLabels: string[]
  askedCount: number
  correctCount: number
  positionAccuracy: number
  chartPosition?: string
  selectedPosition: string
}>()

const emit = defineEmits<{ answer: [actionId: string] }>()

defineOptions({ name: 'PositionTrainerPanel' })

const trainedSeat = computed<Seat>(() =>
  extractPrimarySeat(props.chartPosition) ?? extractPrimarySeat(props.selectedPosition) ?? 'BU',
)

const displaySeats = computed<DisplaySeat[]>(() => {
  const anchorIndex = SEATS.indexOf(trainedSeat.value)
  const startIndex = (anchorIndex - 3 + SEATS.length) % SEATS.length
  return SEAT_SLOTS.map((slotClass, i) => ({
    seat: SEATS[(startIndex + i) % SEATS.length],
    slotClass,
  }))
})

function hasSeatTag(source: string | undefined, seat: Seat): boolean {
  if (!source) return false
  const upper = source.toUpperCase()
  return seat === 'BU'
    ? upper.includes('BU') || upper.includes('BTN')
    : upper.includes(seat)
}

function extractPrimarySeat(source: string | undefined): Seat | null {
  if (!source) return null
  return SEATS.find((s) => hasSeatTag(source, s)) ?? null
}
</script>

<style scoped>
.position-trainer {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-md);
}

.position-trainer__cards {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.position-trainer__question {
  margin: 0;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text);
}

.position-trainer__answers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--space-sm);
}

.position-trainer__answers :deep(.p-button) {
  justify-content: center;
}

.position-trainer__footer {
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

@media (max-width: 767px) {
  .position-trainer {
    padding: var(--space-sm);
    border-color: var(--color-border-subtle);
  }

  .position-trainer__answers {
    grid-template-columns: 1fr;
  }
}
</style>
