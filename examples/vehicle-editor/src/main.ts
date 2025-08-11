import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

import './scss/styles.scss'
import { attachPiniaScope } from 'pinia-scope'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate);

attachPiniaScope(pinia)
app.use(pinia)
app.mount('#app')
