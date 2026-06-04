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
        <div class="position-trainer__stats">
          <span class="position-trainer__stats-item">
            <span class="position-trainer__stats-value">{{ correctCount }}</span>
            <span class="position-trainer__stats-label">верно</span>
          </span>
          <span class="position-trainer__stats-divider">/</span>
          <span class="position-trainer__stats-item">
            <span class="position-trainer__stats-value">{{ askedCount }}</span>
            <span class="position-trainer__stats-label">всего</span>
          </span>
          <span
            class="position-trainer__stats-accuracy"
            :class="{ 'position-trainer__stats-accuracy--good': positionAccuracy >= 80 }"
          >
            {{ positionAccuracy }}%
          </span>
        </div>
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
      return '#1a1a1a'
    case 'd':
      return '#0f3a7a'
    case 'h':
      return '#6b0e07'
    case 'c':
      return '#1a5c00'
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
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-md);
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
  background: radial-gradient(circle at 30% 30%, #284f22 0%, #1a3a16 70%);
  border: 2px solid rgb(0 0 0 / 55%);
  box-shadow:
    inset 0 2px 12px rgb(0 0 0 / 40%),
    0 4px 16px rgb(0 0 0 / 50%);
}

.position-trainer__seat {
  position: absolute;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  border: 2px solid var(--color-border);
  background: var(--color-surface-soft);
  color: var(--color-text-muted);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.position-trainer__seat--active {
  background: var(--color-accent);
  color: #0c1810;
  border-color: var(--color-accent-strong);
  box-shadow: 0 0 0 3px var(--color-accent-glow), 0 0 12px var(--color-accent-glow);
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
  border: 2px solid rgb(255 255 255 / 12%);
  border-radius: 8px;
  background: var(--card-fill);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: var(--space-sm);
  box-shadow: 3px 4px 12px rgb(0 0 0 / 60%);
}

.position-trainer__card-rank-corner {
  position: absolute;
  top: 0.4rem;
  left: 0.45rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}

.position-trainer__card-suit-corner {
  position: absolute;
  top: 1.75rem;
  left: 0.45rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}

.position-trainer__card-rank-main {
  font-size: 2.5rem;
  font-weight: 800;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}

.position-trainer__card-suit--red {
  color: #f3a0a0;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-border);
}

.position-trainer__stats {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.position-trainer__stats-item {
  display: flex;
  align-items: baseline;
  gap: 0.25em;
}

.position-trainer__stats-value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.position-trainer__stats-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.position-trainer__stats-divider {
  color: var(--color-border);
  font-size: var(--font-size-lg);
}

.position-trainer__stats-accuracy {
  margin-left: var(--space-sm);
  padding: 0.2em 0.6em;
  border-radius: var(--radius-md);
  font-weight: 700;
  font-size: var(--font-size-md);
  background: var(--color-surface-soft);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.position-trainer__stats-accuracy--good {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-soft));
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
}

@media (max-width: 767px) {
  .position-trainer {
    padding: var(--space-sm);
    border-color: var(--color-border-subtle);
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
