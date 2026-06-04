<template>
  <PageLayout>
    <template #header>
      <PageHeaderBar title="Тренажёр рэнжей" :nav-items="navigationItems">
        <template #actions>
          <Button
            icon="pi pi-cog"
            severity="secondary"
            text
            rounded
            aria-label="Настройки назначения ренжей"
            @click="toggleAssignMenu"
          />
          <Menu ref="assignMenuRef" :model="assignMenuItems" :popup="true" />
        </template>
      </PageHeaderBar>
    </template>

    <RangeTrainer ref="rangeTrainerRef" />
  </PageLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'

import { RangeTrainer } from '@widgets/range-trainer'
import type { RangeTrainerExpose } from '@widgets/range-trainer'
import { PageHeaderBar, PageLayout } from '@shared/ui'

defineOptions({
  name: 'TrainerPage',
})

const rangeTrainerRef = ref<RangeTrainerExpose | null>(null)
const assignMenuRef = ref<InstanceType<typeof Menu> | null>(null)

const assignMenuItems = computed<MenuItem[]>(() => [
  {
    label: 'Назначить',
    icon: 'pi pi-pencil',
    command: () => rangeTrainerRef.value?.startAssignMode(),
  },
])

const navigationItems = computed<MenuItem[]>(() => [
  {
    label: 'Ренджи',
    command: () => rangeTrainerRef.value?.switchToRangeMode(),
  },
  {
    label: 'Позиция',
    command: () => rangeTrainerRef.value?.switchToPositionMode(),
  },
])

function toggleAssignMenu(event: Event): void {
  assignMenuRef.value?.toggle(event)
}
</script>
