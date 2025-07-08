import {createApp} from 'vue'
import App from './App.vue'
import {createPinia} from "pinia";

// Import our custom CSS
import './scss/styles.scss'

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.mount('#app')
