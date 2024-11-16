import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'

import App from './App.vue'
import Buefy from 'buefy'
import './index.css'
import 'buefy/dist/buefy.css'
import router from './router'

const app = createApp(App)
const i18n = createI18n({
  locale: 'pt',
  messages: {
    pt: {
      errors: {
        sign_in: {
          invalid: 'Email ou senha inválidos.'
        },
        string: {
          empty: 'Não pode ficar vazio.'
        },
        user: {
          email_already_exists: 'Email já cadastrado.',
          password: {
            too_short: 'Deve ter pelo menos 6 caracteres.'
          },
          password_confirmation: {
            must_match: 'As senhas devem ser iguais.'
          }
        }
      }
    }
  }
})

app.use(Buefy)
app.use(router)
app.use(i18n)

app.mount('#app')
