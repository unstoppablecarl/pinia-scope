import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import './scss/styles.scss'
import { attachPiniaScope } from 'pinia-scope'

const app = createApp(App)
const pinia = createPinia()

attachPiniaScope(pinia, { autoInjectScope: true })
app.use(pinia)
app.mount('#app')
