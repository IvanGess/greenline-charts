import 'primeicons/primeicons.css'
import '@shared/styles/index.css'

import { createApp } from 'vue'

import App from './App.vue'
import { setupPrimeVue } from './providers'

const app = createApp(App)

setupPrimeVue(app)

app.mount('#app')
