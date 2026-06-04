<template>
  <div class="page-header-bar">
    <div class="page-header-bar__brand">
      <Menubar class="page-header-bar__menubar" :model="navItems" />
      <h1 class="page-header-bar__title">{{ title }}</h1>
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
  gap: var(--space-xs);
  min-width: 0;
}

.page-header-bar__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  order: 1;
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
  order: 2;
}

.page-header-bar__menubar:deep(.p-menubar) {
  border: none !important;
  box-shadow: none !important;
  overflow: visible;
  position: relative;
}

:deep(.p-menubar.page-header-bar__menubar) {
  border: none !important;
  box-shadow: none !important;
  overflow: visible;
  position: relative;
}

:deep(.page-header-bar__menubar .p-menubar-root-list),
:deep(.page-header-bar__menubar .p-menubar-submenu) {
  width: max-content !important;
  min-width: max-content !important;
}

@media (max-width: 960px) {
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

  .page-header-bar__menubar {
    order: 1;
  }

  .page-header-bar__title {
    order: 2;
  }
}

@media (max-width: 767px) {
  .page-header-bar__title {
    font-size: var(--font-size-md);
  }
}
</style>
