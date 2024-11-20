<script setup lang="ts">
    import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import apiClient from '../api_client'

const { t } = useI18n()
const router = useRouter()

const baseError = ref('')
const email = ref({
  value: ''
})
const password = ref({
  value: ''
})
const isLoading = ref(false)

const fieldToRef = {
  email: email,
  password: password
}

const handleSubmit = () => {
  isLoading.value = true

  apiClient.post('/users/sign_in', {
    email: email.value.value,
    password: password.value.value
  })
    .then((e) => {
        const { access_token } = e.data

        localStorage.setItem('token', access_token)

        isLoading.value = false

        setTimeout(() => {
          router.push('/')
        }, 0)
    })
    .catch((error) => {
      const { response } = error
      const { data } = response

      baseError.value = t('errors.sign_in.invalid')

      isLoading.value = false
    })
}
</script>

<template>
    <div class="w-full h-full has-background-light">
        <div class="flex items-center justify-center h-full p-4">

            <form @submit.prevent="handleSubmit">
                <div class="card">
                    <div class="card-content">
                        <b-message type="is-danger" v-if="baseError">
                            {{ baseError }}
                        </b-message>

                        <b-field label="Email" @input="baseError = ''">
                            <b-input
                                    type="email"
                                    v-model="email.value"
                                    placeholder="Seu email"
                                    required>
                            </b-input>
                        </b-field>

                        <b-field label="Senha" @input="baseError = ''">
                            <b-input
                                    type="password"
                                    v-model="password.value"
                                    password-reveal
                                    placeholder="Sua senha"
                                    required>
                            </b-input>
                        </b-field>

                        <b-button
                                label="Entrar"
                                native-type="submit"
                                type="is-primary"
                                expanded
                                :loading="isLoading"
                                />

                            <div class="mt-4 text-center">
                                Não tem uma conta? <RouterLink to="/signup">Cadastre-se</RouterLink>
                            </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
