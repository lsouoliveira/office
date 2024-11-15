<script setup lang="ts">
</script>

<template>
    <div class="w-full h-full has-background-light">
        <div class="flex items-center justify-center h-full p-4">
            <form action="">
                <div class="card">
                    <div class="card-content">
                        <b-field label="Email">
                            <b-input
                                    type="email"
                                    :value="email"
                                    placeholder="Seu email"
                                    required>
                            </b-input>
                        </b-field>

                        <b-field label="Senha">
                            <b-input
                                    type="password"
                                    :value="password"
                                    password-reveal
                                    placeholder="Sua senha"
                                    required>
                            </b-input>
                        </b-field>

                        <b-button
                                label="Entrar"
                                type="is-primary" expanded />

                            <div class="mt-4 text-center">
                                Não tem uma conta? <RouterLink to="/signup">Cadastre-se</RouterLink>
                            </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>
