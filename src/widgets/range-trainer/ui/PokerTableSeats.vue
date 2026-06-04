<template>
  <div class="poker-table-seats" aria-hidden="true">
    <div class="poker-table-seats__felt" />
    <span
      v-for="item in displaySeats"
      :key="item.slotClass"
      class="poker-table-seats__seat"
      :class="[item.slotClass, { 'poker-table-seats__seat--active': item.seat === activeSeat }]"
    >
      {{ item.seat }}
    </span>
  </div>
</template>

<script setup lang="ts">
export interface DisplaySeat {
  seat: string
  slotClass: string
}

defineProps<{
  displaySeats: DisplaySeat[]
  activeSeat: string
}>()

defineOptions({ name: 'PokerTableSeats' })
</script>

<style scoped>
.poker-table-seats {
  position: relative;
  width: min(26rem, 100%);
  height: 11rem;
  margin-inline: auto;
}

.poker-table-seats__felt {
  position: absolute;
  inset: 1.75rem 0.75rem 1.5rem;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 30%, #284f22 0%, #1a3a16 70%);
  border: 2px solid rgb(0 0 0 / 55%);
  box-shadow:
    inset 0 2px 12px rgb(0 0 0 / 40%),
    0 4px 16px rgb(0 0 0 / 50%);
}

.poker-table-seats__seat {
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

.poker-table-seats__seat--active {
  background: var(--color-accent);
  color: #0c1810;
  border-color: var(--color-accent-strong);
  box-shadow: 0 0 0 3px var(--color-accent-glow), 0 0 12px var(--color-accent-glow);
}

/* Seat positions around the table */
.poker-table-seats__seat--ep  { top: 0; left: 50%; transform: translateX(-50%); }
.poker-table-seats__seat--mp  { top: 1.1rem; right: 0.75rem; }
.poker-table-seats__seat--co  { bottom: 1.1rem; right: 0.75rem; }
.poker-table-seats__seat--bu  { bottom: 0; left: 50%; transform: translateX(-50%); }
.poker-table-seats__seat--sb  { bottom: 1.1rem; left: 0.75rem; }
.poker-table-seats__seat--bb  { top: 1.1rem; left: 0.75rem; }
</style>
