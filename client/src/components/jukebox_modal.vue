<script setup lang="ts">
    import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
    import { useToast } from 'vue-toast-notification';

    const model = defineModel()
    const $toast = useToast();
    const isFetching = ref(false)
    const musicSheet = ref("")

    const handlePlay = async () => {
        if (isFetching.value) {
            return
        }

        isFetching.value = true

        try {
            await playJukebox(musicSheet.value)
        } catch(error) {
            if (error.status == 400) {
                $toast.open({
                    message: 'Você não tem dinheiro suficiente para tocar uma música.',
                    type: 'error',
                    duration: 5000
                })
            } else {
                $toast.open({
                    message: 'Ocorreu um erro ao tocar a música.',
                    type: 'error',
                    duration: 5000
                })
            }
        } finally {
            musicSheet.value = ""
            isFetching.value = false
        }
    }

    const playJukebox = async (musicSheet: string) => {
        const response = await window.gameClient.playJukebox(musicSheet)

        return response.body.data
    }
</script>

<template>
    <b-modal v-model="model" width="480px">
        <div class="card">
            <div class="card-header">
                <div class="card-header-title">Jukebox</div>
            </div>

            <div class="card-content space-y-4">
                <b-input
                  type="textarea"
                  v-model="musicSheet"
                />

                <b-button expanded type="is-primary" @click="handlePlay" :disabled="isFetching">
                  Tocar
                </b-button>
            </div>
        </div>
    </b-modal>
</template>
