<template>
  <section class="position-trainer">
    <div class="position-trainer__table">
      <div class="position-trainer__seats-wrap" aria-hidden="true">
        <div class="position-trainer__seats-table" />
        <span
          v-for="item in displaySeats"
          :key="item.slotClass"
          class="position-trainer__seat"
          :class="[item.slotClass, { 'position-trainer__seat--active': isSeatActive(item.seat) }]"
        >
          {{ item.seat }}
        </span>
      </div>
      <div class="position-trainer__cards">
        <article
          v-for="(card, index) in currentQuestion?.cards ?? []"
          :key="`${card.rank}-${card.suit}-${index}`"
          class="position-trainer__card"
          :style="cardStyle(card.suit)"
        >
          <span class="position-trainer__card-rank-corner">{{ card.rank }}</span>
          <span
            class="position-trainer__card-suit-corner"
            :class="{ 'position-trainer__card-suit--red': isRedSuit(card.suit) }"
          >
            {{ suitIcon(card.suit) }}
          </span>
          <span class="position-trainer__card-rank-main">{{ card.rank }}</span>
        </article>
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
          lastAnswerCorrect ? 'Верно!' : `Неверно. Правильные действия: ${expectedAnswerLabels.join(', ')}`
        }}
      </Message>
      <div class="position-trainer__footer">
        <span class="position-trainer__stats">Верно {{ correctCount }}/{{ askedCount }} ({{ positionAccuracy }}%)</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import Button from 'primevue/button'
import Message from 'primevue/message'

import type { PositionAnswerOption } from '../model/positionAnswerOptions'
import type { PositionQuestion } from '../model/usePositionTrainer'

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

const emit = defineEmits<{
  answer: [actionId: string]
}>()

defineOptions({
  name: 'PositionTrainerPanel',
})

const seats = ['UTG', 'MP', 'CO', 'BU', 'SB', 'BB'] as const
const seatSlots = [
  'position-trainer__seat--ep',
  'position-trainer__seat--mp',
  'position-trainer__seat--co',
  'position-trainer__seat--bu',
  'position-trainer__seat--sb',
  'position-trainer__seat--bb',
] as const

const trainedSeat = computed<(typeof seats)[number]>(() => {
  return extractPrimarySeat(props.chartPosition) ?? extractPrimarySeat(props.selectedPosition) ?? 'BU'
})

const displaySeats = computed(() => {
  const anchorIndex = seats.indexOf(trainedSeat.value)
  const startIndex = (anchorIndex - 3 + seats.length) % seats.length
  return seatSlots.map((slotClass, index) => ({
    seat: seats[(startIndex + index) % seats.length],
    slotClass,
  }))
})

function suitIcon(suit: 's' | 'h' | 'd' | 'c'): string {
  switch (suit) {
    case 's':
      return '♠'
    case 'h':
      return '♥'
    case 'd':
      return '♦'
    case 'c':
      return '♣'
  }
}

function isRedSuit(suit: 's' | 'h' | 'd' | 'c'): boolean {
  return suit === 'h' || suit === 'd'
}

function cardStyle(suit: 's' | 'h' | 'd' | 'c'): Record<string, string> {
  return {
    '--card-fill': suitColor(suit),
  }
}

function suitColor(suit: 's' | 'h' | 'd' | 'c'): string {
  switch (suit) {
    case 's':
      return '#222222'
    case 'd':
      return '#184A91'
    case 'h':
      return '#781208'
    case 'c':
      return '#288700'
  }
}

function isSeatActive(seat: (typeof seats)[number]): boolean {
  return seat === trainedSeat.value
}

function hasSeatTag(source: string | undefined, seat: (typeof seats)[number]): boolean {
  if (!source) return false
  const upper = source.toUpperCase()
  if (seat === 'BU') {
    return upper.includes('BU') || upper.includes('BTN')
  }
  return upper.includes(seat)
}

function extractPrimarySeat(source: string | undefined): (typeof seats)[number] | null {
  if (!source) return null
  for (const seat of seats) {
    if (hasSeatTag(source, seat)) return seat
  }
  return null
}
</script>

<style scoped>
.position-trainer {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  background: var(--color-surface-elevated);
}

.position-trainer__table {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.position-trainer__seats-wrap {
  position: relative;
  width: min(26rem, 100%);
  height: 11rem;
  margin-inline: auto;
}

.position-trainer__seats-table {
  position: absolute;
  inset: 1.75rem 0.75rem 1.5rem;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #31682a 0%, #234f1f 70%);
  border: 2px solid rgb(6 32 14 / 55%);
}

.position-trainer__seat {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 2px solid rgb(8 25 13 / 60%);
  background: #88a96f;
  color: #132f16;
  font-size: 0.85rem;
  font-weight: 700;
}

.position-trainer__seat--active {
  box-shadow: 0 0 0 3px rgb(255 229 122 / 45%);
  border-color: #d6be54;
}

.position-trainer__seat--ep {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.position-trainer__seat--mp {
  top: 1.1rem;
  right: 0.75rem;
}

.position-trainer__seat--co {
  bottom: 1.1rem;
  right: 0.75rem;
}

.position-trainer__seat--bu {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.position-trainer__seat--sb {
  bottom: 1.1rem;
  left: 0.75rem;
}

.position-trainer__seat--bb {
  top: 1.1rem;
  left: 0.75rem;
}

.position-trainer__cards {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.position-trainer__card {
  position: relative;
  width: 5rem;
  height: 7rem;
  border: 3px solid #060606;
  border-radius: 8px;
  background: var(--card-fill);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--space-sm);
  box-shadow: 3px 4px 0 rgb(0 0 0 / 35%);
}

.position-trainer__card-rank-corner {
  position: absolute;
  top: 0.4rem;
  left: 0.45rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 50%);
}

.position-trainer__card-suit-corner {
  position: absolute;
  top: 1.75rem;
  left: 0.45rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 50%);
}

.position-trainer__card-rank-main {
  font-size: 2.5rem;
  font-weight: 800;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 50%);
}

.position-trainer__card-suit--red {
  color: #f3f6f8;
}

.position-trainer__question {
  margin: 0;
  text-align: center;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.position-trainer__answers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--space-sm);
}

.position-trainer__answers :deep(.p-button) {
  justify-content: center;
}

.position-trainer__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
}

.position-trainer__stats {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

@media (max-width: 767px) {
  .position-trainer {
    padding: var(--space-sm);
    border-color: transparent;
    background: transparent;
  }

  .position-trainer__seats-wrap {
    width: 100%;
    max-width: 22rem;
  }

  .position-trainer__answers {
    grid-template-columns: 1fr;
  }

  .position-trainer__footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
