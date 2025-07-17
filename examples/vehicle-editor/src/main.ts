import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import './scss/styles.scss'
import { attachPiniaScope, DefaultStoreBehavior, setDefaultStoreBehavior } from 'pinia-scope'

const app = createApp(App)
const pinia = createPinia()

attachPiniaScope(pinia)
app.use(pinia)
setDefaultStoreBehavior(DefaultStoreBehavior.componentScoped)
app.mount('#app')
