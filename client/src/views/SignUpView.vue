<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import { useI18n } from 'vue-i18n'
    import { useRouter } from 'vue-router'

    import apiClient from '../api_client'

    const { t } = useI18n()
    const router = useRouter()

    const baseError = ref('')
    const name = ref({
        value: '',
        error: ''
    })
    const email = ref({
        value: '',
        error: ''
    })
    const password = ref({
        value: '',
        error: ''
    })
    const passwordConfirmation = ref({
        value: '',
        error: ''
    })
    const fieldToRef = {
        name: name,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
    }
    const isLoading = ref(false)

    const handleSubmit = () => {
        isLoading.value = true

        apiClient.post('/users/sign_up', {
            name: name.value.value,
            email: email.value.value,
            password: password.value.value,
            password_confirmation: passwordConfirmation.value.value
        }).then(() => {
            isLoading.value = false

            setTimeout(() => {
              router.push('/login')
            }, 0)
        }).catch((error) => {
            const { response } = error
            const { data } = response

            clearFieldsErrors()
            data.errors.forEach(mapErrorToField)

            isLoading.value = false
        })
    }

    const clearFieldsErrors = () => {
        for (const field in fieldToRef) {
            fieldToRef[field].value.error = ''
        }

        baseError.value = ''
    }

    const mapErrorToField = (error) => {
        const { field, code } = error

        if (field in fieldToRef) {
            fieldToRef[field].value.error = t(`errors.${code}`)
        } else {
            baseError.value = t(`errors.${code}`)
        }
    }
</script>

<template>
    <div class="w-full h-full has-background-light">
        <div class="flex items-center justify-center h-full p-4">
            <form action="" @submit.prevent="handleSubmit">
                <div class="card">
                    <div class="card-content">
                        <b-field label="Nome" :message="name.error" :type="name.error ? 'is-danger' : ''" @input="name.error = ''">
                            <b-input
                                    type="text"
                                    placeholder="Seu nome"
                                    v-model="name.value">
                            </b-input>
                        </b-field>

                        <b-field label="Email" :message="email.error" :type="email.error ? 'is-danger' : ''" @input="email.error = ''">
                            <b-input
                                    type="email"
                                    placeholder="Seu email"
                                    v-model="email.value"
                                    required>
                            </b-input>
                        </b-field>

                        <b-field label="Senha" :message="password.error" :type="password.error ? 'is-danger' : ''" @input="password.error = ''">
                            <b-input
                                    type="password"
                                    v-model="password.value"
                                    password-reveal
                                    placeholder="Sua senha"
                                    required>
                            </b-input>
                        </b-field>

                        <b-field label="Confirmação de senha" :message="passwordConfirmation.error" :type="passwordConfirmation.error ? 'is-danger' : ''" @input="passwordConfirmation.error = ''">
                            <b-input
                                    type="password"
                                    v-model="passwordConfirmation.value"
                                    password-reveal
                                    placeholder="Sua senha"
                                    required>
                            </b-input>
                        </b-field>

                        <b-button
                                label="Criar conta"
                                native-type="submit"
                                type="is-primary" expanded :loading="isLoading" />

                            <div class="mt-4 text-center">
                                Já tem uma conta? <RouterLink to="/">Login</RouterLink>
                            </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
