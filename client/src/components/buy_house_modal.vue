<script setup lang="ts">
    import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
    import { useI18n } from 'vue-i18n'

    const model = defineModel()
    const { t } = useI18n()

    const isLoading = ref(true)
    const hasError = ref(false)
    const isFetching = ref(false)
</script>

<template>
    <b-modal v-model="model" width="480px">
        <div class="card">
            <div class="card-header">
                <div class="card-header-title">Comprar casa</div>
            </div>

            <div class="card-content">
                <div class="text-center">
                    Carregando...
                </div>
            </div>
        </div>
    </b-modal>
</template>
