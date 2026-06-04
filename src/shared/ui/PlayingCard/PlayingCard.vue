<template>
  <article class="playing-card" :style="{ '--card-fill': cardFill }">
    <span class="playing-card__rank-corner">{{ rank }}</span>
    <span class="playing-card__suit-corner" :class="{ 'playing-card__suit--red': isRed }">
      {{ suitIcon }}
    </span>
    <span class="playing-card__rank-main">{{ rank }}</span>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Suit = 's' | 'h' | 'd' | 'c'

const props = defineProps<{
  rank: string
  suit: Suit
}>()

defineOptions({ name: 'PlayingCard' })

const SUIT_ICONS: Record<Suit, string> = { s: '♠', h: '♥', d: '♦', c: '♣' }

const SUIT_COLORS: Record<Suit, string> = {
  s: '#1a1a1a',
  d: '#0f3a7a',
  h: '#6b0e07',
  c: '#1a5c00',
}

const suitIcon = computed(() => SUIT_ICONS[props.suit])
const cardFill = computed(() => SUIT_COLORS[props.suit])
const isRed = computed(() => props.suit === 'h' || props.suit === 'd')
</script>

<style scoped>
.playing-card {
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

.playing-card__rank-corner {
  position: absolute;
  top: 0.4rem;
  left: 0.45rem;
  font-size: 1.3rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}

.playing-card__suit-corner {
  position: absolute;
  top: 1.75rem;
  left: 0.45rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}

.playing-card__suit--red {
  color: #f3a0a0;
}

.playing-card__rank-main {
  font-size: 2.5rem;
  font-weight: 800;
  color: #f3f6f8;
  line-height: 1;
  text-shadow: 0 1px 0 rgb(0 0 0 / 60%);
}
</style>
