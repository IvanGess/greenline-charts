import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import type { App } from 'vue'

const GreenlinePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f0fdf5',
      100: '#dcfce8',
      200: '#b9f8d2',
      300: '#86efad',
      400: '#4ade80',
      500: '#38d970',
      600: '#28bf5c',
      700: '#1ea34a',
      800: '#1a803c',
      900: '#166833',
      950: '#0c3d1c',
    },
  },
})

export function setupPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: GreenlinePreset,
      options: {
        darkModeSelector: '.app-dark',
      },
    },
  })
}
