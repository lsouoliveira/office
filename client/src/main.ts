import { createApp } from 'vue'
import App from './App.vue'
import Buefy from 'buefy'
import './index.css'
import 'buefy/dist/buefy.css'
import router from './router'

const app = createApp(App)

app.use(Buefy)
app.use(router)

app.mount('#app')
