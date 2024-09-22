import './assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css' // Ensure you are using css-loader
import { zhHans } from 'vuetify/locale'
const app = createApp(App)

app.use(createPinia())

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark'
  },
  locale: {
    locale: 'zhHans',
    messages: { zhHans }
  }
})
app.use(vuetify)

app.mount('#app')
