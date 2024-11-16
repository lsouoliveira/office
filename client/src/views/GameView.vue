<script setup lang="ts">
    import { onMounted, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import apiClient from '../api_client'

    import Game from '../components/game.vue'

    const isLoading = ref(false)

    onMounted(() => {
        apiClient.get('/users/me')
            .then((e) => {
                isLoading.value = false
            })
            .catch((error) => {
                setTimeout(() => {
                    router.push('/login')
                }, 0)
            })
    })
</script>

<template>
    <game />
</template>
