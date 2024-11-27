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
      },
      items: {
        '100000': 'Boné vermelho',
        '100001': 'Boné McLaren',
        '100002': 'Balaclava',
        '100003': 'Gorro',
        '100004': 'Barba',
        '100005': 'Abelha',
        '100006': 'Raio',
        '100007': 'Chapéu de Chef',
        '100008': 'Chapéu de Detetive',
        '100009': 'Boné Dino',
        '100010': 'Óculos',
        '100011': 'Joaninha',
        '100012': 'Máscara Médica',
        '100013': 'Monóculo',
        '100014': 'Bigode',
        '100015': 'Chapéu de Festa 01',
        '100016': 'Chapéu de Festa 04',
        '100017': 'Chapéu de Policial',
        '100018': 'Boné Azul',
        '100019': 'Boné Verde',
        '100020': 'Boné Branco',
        '100021': 'Boné Rosa',
        '100022': 'Cérebro de Zumbi',
        '100023': 'Varinha de Bétula',
        '100024': 'Varinha de Azevinho',
        '100025': 'Varinha de Salgueiro',
        '100026': 'Varinha de Nogueira',
        '100027': 'Varinha de Teixo',
        '100028': 'Varinha de Carvalho',
        '100029': 'Boné Nacional',
        '100030': 'Capacete Lendário'
      }
    }
  }
})

app.use(Buefy)
app.use(router)
app.use(i18n)

app.mount('#app')
