<template>
  <div class="page-layout">
    <header v-if="$slots.header" class="page-layout__header">
      <slot name="header" />
    </header>
    <main class="page-layout__main">
      <slot />
    </main>
    <footer v-if="$slots.footer" class="page-layout__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PageLayout',
})
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.page-layout__header,
.page-layout__footer {
  padding: var(--space-md) var(--space-lg);
  background: rgb(12 24 16 / 88%);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.page-layout__header {
  position: relative;
  z-index: 2000;
  overflow: visible;
}

.page-layout__footer {
  border-bottom: none;
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.page-layout__main {
  flex: 1;
  width: 100%;
  max-width: var(--content-max-width);
  margin-inline: auto;
  padding: var(--space-xl) var(--space-lg);
  position: relative;
  z-index: 1;
}

@media (max-width: 1023px) {
  .page-layout__header,
  .page-layout__footer {
    padding: var(--space-sm) var(--space-md);
  }

  .page-layout__main {
    padding: var(--space-lg) var(--space-md);
  }
}

@media (max-width: 767px) {
  .page-layout__header,
  .page-layout__footer {
    padding: var(--space-xs) var(--space-sm);
  }

  .page-layout__main {
    padding: var(--space-sm);
  }
}
</style>
