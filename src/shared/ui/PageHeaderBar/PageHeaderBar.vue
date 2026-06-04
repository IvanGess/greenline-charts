<template>
  <div class="page-header-bar">
    <div class="page-header-bar__brand">
      <span class="page-header-bar__logo" aria-hidden="true">◆</span>
      <h1 class="page-header-bar__title">{{ title }}</h1>
      <Menubar class="page-header-bar__menubar" :model="navItems" />
    </div>
    <div v-if="$slots.actions" class="page-header-bar__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar'
import type { MenuItem } from 'primevue/menuitem'

defineProps<{
  title: string
  navItems: MenuItem[]
}>()

defineOptions({
  name: 'PageHeaderBar',
})
</script>

<style scoped>
.page-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  flex-wrap: nowrap;
  position: relative;
  z-index: 3000;
}

.page-header-bar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-width: 0;
}

.page-header-bar__logo {
  color: var(--color-accent);
  font-size: 1.1rem;
  flex-shrink: 0;
  filter: drop-shadow(0 0 6px var(--color-accent-glow));
}

.page-header-bar__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.page-header-bar__actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.page-header-bar__menubar {
  flex: 0 0 auto;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.page-header-bar__menubar:deep(.p-menubar) {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  overflow: visible;
  position: relative;
}

:deep(.page-header-bar__menubar .p-menubar-root-list),
:deep(.page-header-bar__menubar .p-menubar-submenu) {
  width: max-content !important;
  min-width: max-content !important;
}

@media (max-width: 960px) {
  /* Burger appears before title: logo → burger → title */
  .page-header-bar__logo    { order: 1; }
  .page-header-bar__menubar { order: 2; }
  .page-header-bar__title   { order: 3; }

  .page-header-bar__menubar:deep(.p-menubar-mobile .p-menubar-root-list),
  .page-header-bar__menubar:deep(.p-menubar-mobile-active .p-menubar-root-list),
  .page-header-bar__menubar:deep(.p-menubar-mobile .p-menubar-submenu),
  .page-header-bar__menubar:deep(.p-menubar-mobile-active .p-menubar-submenu) {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    width: max-content;
    min-width: max-content;
    z-index: 9999 !important;
  }
}

@media (max-width: 767px) {
  .page-header-bar__title {
    font-size: var(--font-size-md);
  }
}
</style>
