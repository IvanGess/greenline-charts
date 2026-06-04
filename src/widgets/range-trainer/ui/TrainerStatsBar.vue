<template>
  <div class="trainer-stats-bar">
    <span class="trainer-stats-bar__item">
      <span class="trainer-stats-bar__value">{{ correctCount }}</span>
      <span class="trainer-stats-bar__label">верно</span>
    </span>
    <span class="trainer-stats-bar__divider">/</span>
    <span class="trainer-stats-bar__item">
      <span class="trainer-stats-bar__value">{{ askedCount }}</span>
      <span class="trainer-stats-bar__label">всего</span>
    </span>
    <span
      class="trainer-stats-bar__accuracy"
      :class="{ 'trainer-stats-bar__accuracy--good': accuracy >= 80 }"
    >
      {{ accuracy }}%
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  correctCount: number
  askedCount: number
  accuracy: number
}>()

defineOptions({ name: 'TrainerStatsBar' })
</script>

<style scoped>
.trainer-stats-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
}

.trainer-stats-bar__item {
  display: flex;
  align-items: baseline;
  gap: 0.25em;
}

.trainer-stats-bar__value {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.trainer-stats-bar__label {
  color: var(--color-text-muted);
}

.trainer-stats-bar__divider {
  color: var(--color-border);
  font-size: var(--font-size-lg);
}

.trainer-stats-bar__accuracy {
  margin-left: var(--space-sm);
  padding: 0.2em 0.6em;
  border-radius: var(--radius-md);
  font-weight: 700;
  background: var(--color-surface-soft);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.trainer-stats-bar__accuracy--good {
  color: var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 10%, var(--color-surface-soft));
  border-color: color-mix(in srgb, var(--color-accent) 30%, transparent);
}
</style>
