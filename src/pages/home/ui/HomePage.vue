<template>
  <PageLayout>
    <template #header>
      <h1 class="home-page__title">Greenline Charts</h1>
    </template>

    <section class="home-page__hero">
      <p class="home-page__lead">
        Vue 3 · Composition API · TypeScript · PrimeVue · Feature-Sliced Design
      </p>
      <Button label="Начать" icon="pi pi-arrow-right" icon-pos="right" @click="onStart" />
    </section>

    <template #footer>
      <span class="home-page__muted">Слой pages/home — точка входа для главной страницы</span>
    </template>
  </PageLayout>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

import { PageLayout } from '@shared/ui'

defineOptions({
  name: 'HomePage',
})

function onStart(): void {
  // Placeholder: навигация или инициализация фичи подключится здесь
}
</script>

<style scoped>
.home-page__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.home-page__hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-lg);
}

.home-page__lead {
  margin: 0;
  max-width: 36rem;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
}

.home-page__muted {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
