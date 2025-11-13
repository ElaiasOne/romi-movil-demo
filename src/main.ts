// src/main.ts
import { createApp } from 'vue'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// ⬇️ Agregar:
import { addIcons } from 'ionicons'
import {
  pricetagsOutline, peopleOutline, statsChartOutline, cubeOutline,
  receiptOutline, cashOutline, cardOutline, add
} from 'ionicons/icons'

addIcons({
  'pricetags-outline': pricetagsOutline,
  'people-outline': peopleOutline,
  'stats-chart-outline': statsChartOutline,
  'cube-outline': cubeOutline,
  'receipt-outline': receiptOutline,
  'cash-outline': cashOutline,
  'card-outline': cardOutline,
  'add': add,
})


// Ionic core css
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/display.css'

// Optional CSS utils
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'

import './theme.css'

const app = createApp(App).use(IonicVue).use(createPinia()).use(router)

router.isReady().then(() => app.mount('#app'))
