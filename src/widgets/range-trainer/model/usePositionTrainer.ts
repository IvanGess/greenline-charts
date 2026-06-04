import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { paintToActions } from '@shared/lib/poker'
import type { HandKey, RangeChartDefinition } from '@shared/lib/poker'

import { buildPositionAnswerOptions } from './positionAnswerOptions'
import type { PositionAnswerOption } from './positionAnswerOptions'

interface DeckCard {
  rank: string
  suit: 's' | 'h' | 'd' | 'c'
}

export interface PositionQuestion {
  cards: [DeckCard, DeckCard]
  handKey: HandKey
}

interface UsePositionTrainerOptions {
  beforeNextHand?: () => void
}

export function usePositionTrainer(
  currentChart: ComputedRef<RangeChartDefinition | undefined>,
  selectedSituation: Ref<string>,
  options?: UsePositionTrainerOptions,
) {
  const currentQuestion = ref<PositionQuestion | null>(null)
  const lastAnswerCorrect = ref<boolean | null>(null)
  const expectedAnswerLabels = ref<string[]>([])
  const lastAnsweredActionId = ref<string | null>(null)
  const askedCount = ref(0)
  const correctCount = ref(0)

  const positionAccuracy = computed(() => {
    if (askedCount.value === 0) return 0
    return Math.round((correctCount.value / askedCount.value) * 100)
  })

  const positionAnswerOptions = computed<PositionAnswerOption[]>(() => {
    const chart = currentChart.value
    if (!chart) return []
    return buildPositionAnswerOptions(chart, selectedSituation.value)
  })

  function ensureQuestion(): void {
    if (!currentQuestion.value) {
      nextPositionHand()
    }
  }

  function refreshForChartChange(): void {
    nextPositionHand()
  }

  function nextPositionHand(): void {
    options?.beforeNextHand?.()
    if (!currentChart.value) {
      currentQuestion.value = null
      return
    }
    const [cardA, cardB] = pickTwoUniqueCards()
    currentQuestion.value = {
      cards: [cardA, cardB],
      handKey: toHandKey(cardA, cardB),
    }
    lastAnswerCorrect.value = null
    expectedAnswerLabels.value = []
    lastAnsweredActionId.value = null
  }

  function answerPositionAction(actionId: string): void {
    const chart = currentChart.value
    const question = currentQuestion.value
    if (!chart || !question) return

    const expectedActionIds = expectedActionsForHand(chart, question.handKey)
    const isCorrect = expectedActionIds.includes(actionId)
    askedCount.value += 1
    if (isCorrect) {
      correctCount.value += 1
    }

    const labelsById = new Map(positionAnswerOptions.value.map((option) => [option.id, option.label]))
    expectedAnswerLabels.value = expectedActionIds.map((id) => labelsById.get(id) ?? id)
    lastAnswerCorrect.value = isCorrect
    lastAnsweredActionId.value = actionId

    if (isCorrect) {
      nextPositionHand()
    }
  }

  return {
    currentQuestion,
    lastAnswerCorrect,
    expectedAnswerLabels,
    lastAnsweredActionId,
    askedCount,
    correctCount,
    positionAccuracy,
    positionAnswerOptions,
    answerPositionAction,
    nextPositionHand,
    ensureQuestion,
    refreshForChartChange,
  }
}

const DECK_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
const DECK_SUITS: DeckCard['suit'][] = ['s', 'h', 'd', 'c']

function pickTwoUniqueCards(): [DeckCard, DeckCard] {
  const deck: DeckCard[] = []
  for (const rank of DECK_RANKS) {
    for (const suit of DECK_SUITS) {
      deck.push({ rank, suit })
    }
  }
  const first = deck[Math.floor(Math.random() * deck.length)]
  let second = deck[Math.floor(Math.random() * deck.length)]
  while (second.rank === first.rank && second.suit === first.suit) {
    second = deck[Math.floor(Math.random() * deck.length)]
  }
  return [first, second]
}

function toHandKey(cardA: DeckCard, cardB: DeckCard): HandKey {
  if (cardA.rank === cardB.rank) {
    return `${cardA.rank}${cardB.rank}`
  }
  const rankAIndex = DECK_RANKS.indexOf(cardA.rank as (typeof DECK_RANKS)[number])
  const rankBIndex = DECK_RANKS.indexOf(cardB.rank as (typeof DECK_RANKS)[number])
  const [high, low] = rankAIndex < rankBIndex ? [cardA.rank, cardB.rank] : [cardB.rank, cardA.rank]
  const suited = cardA.suit === cardB.suit ? 's' : 'o'
  return `${high}${low}${suited}`
}

function expectedActionsForHand(chart: RangeChartDefinition, handKey: HandKey): string[] {
  const fromPaint = paintToActions(chart.solutionPaint?.[handKey] ?? {})
  if (fromPaint.length) return fromPaint
  const fromSolution = chart.solution[handKey] ?? []
  if (fromSolution.length) return [...fromSolution]
  return ['fold']
}
