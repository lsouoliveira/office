<script setup lang="ts">
    import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
    import { useI18n } from 'vue-i18n'

    const model = defineModel()
    const { t } = useI18n()
    const selectedNumber = ref(null)
    const lastResults = ref({
        data: [],
        isLoading: true
    })
    const playerTicket = ref({
        ticket: null,
        isLoading: true
    })
    const nextLottery = ref({
        lottery: null,
        isLoading: false
    })

    onMounted(async () => {
        fetchLastResults()
        fetchPlayerTicket()
        fetchNextLottery()
    })

    const getLastResults = async () => {
        const response = await window.gameClient.getLastLotteryResults()

        return response.body.data
    }

    const getPlayerTicket = async () => {
        const response = await window.gameClient.getPlayerLotteryTicket()

        return response.body
    }

    const getNextLottery = async () => {
        const response = await window.gameClient.getNextLottery()

        return response.body
    }

    const fetchLastResults = async () => {
        lastResults.value.isLoading = true
        lastResults.value.data = await getLastResults()
        lastResults.value.isLoading = false
    }

    const fetchPlayerTicket = async () => {
        playerTicket.value.isLoading = true
        try {
            playerTicket.value.ticket = await getPlayerTicket()
        } catch (error) {
            if (error.response.status === 404) {
                playerTicket.value.ticket = null
            }
        }
        playerTicket.value.isLoading = false
    }

    const fetchNextLottery = async () => {
        nextLottery.value.isLoading = true
        nextLottery.value.lottery = await getNextLottery()
        nextLottery.value.isLoading = false
    }

    const handleLottery = async () => {
        try {
            await window.gameClient.buyLotteryTicket(selectedNumber.value)
            fetchPlayerTicket()
            fetchLastResults()
            fetchNextLottery()
        } catch (error) {
            console.error(error)
        }
    }
</script>

<template>
    <b-modal v-model="model">
        <div class="h-[480px] rounded-lg overflow-y-auto">
            <div class="card">
                <div class="card-header">
                    <div class="card-header-title">Loteria</div>
                </div>

                <div class="card-content grid grid-cols-2 gap-4">
                    <div class="space-y-4" v-if="!playerTicket.isLoading && !playerTicket.ticket">
                        <div class="font-bold text-center text-lg">
                            Escolha 1 número
                        </div>

                        <div class="grid grid-cols-4 gap-2 max-w-64 mx-auto">
                            <div :class="['lottery-item', { 'lottery-item--selected': selectedNumber === number }]" @click="selectedNumber = number" v-for="number in 16" :key="number">{{ number }}</div>
                        </div>

                        <div>
                            <b-button type="is-primary" @click="handleLottery" expanded :disabled="!selectedNumber">Jogar</b-button>
                        </div>
                    </div>

                    <div class="space-y-4" v-if="playerTicket.isLoading">
                        <div class="font-bold text-center text-lg">
                            <b-skeleton width="100%" height="24px" animated="animated"></b-skeleton>
                        </div>

                        <div>
                            <b-skeleton width="100%" height="128px" animated="animated"></b-skeleton>
                        </div>

                        <div>
                            <b-skeleton width="100%" height="32px" animated="animated"></b-skeleton>
                        </div>
                    </div>

                    <div class="space-y-4 h-full" v-if="playerTicket.ticket">
                        <div class="flex items-center justify-center">
                            <div class="space-y-4">
                                <div>
                                    <div class="text-center font-bold">
                                        Prêmio do próximo sorteio
                                    </div>

                                    <div class="text-center" v-if="nextLottery.isLoading">
                                        <b-skeleton width="100%" height="24px" animated="animated"></b-skeleton>
                                    </div>

                                    <div class="text-center" v-if="!nextLottery.isLoading">
                                        {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(nextLottery.lottery.prize) }}
                                    </div>
                                </div>

                                <div>
                                    <div class="text-center font-bold">
                                        Horário do sorteio
                                    </div>

                                    <div class="text-center">
                                        15:00
                                    </div>
                                </div>

                                <div>
                                    <div class="text-center font-bold">
                                        Seu número
                                    </div>

                                    <div class="text-center" v-if="playerTicket.isLoading">
                                        <b-skeleton width="100%" height="24px" animated="animated"></b-skeleton>
                                    </div>

                                    <div class="text-center" v-if="!playerTicket.isLoading">
                                        {{ playerTicket.ticket.number }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4 border-l px-4">
                        <div class="font-bold text-center text-lg whitespace-nowrap">
                            Os últimos 5 resultados
                        </div>

                        <div>
                            <div class="text-center leading-none hidden" v-if="!lastResults.isLoading && !lastResults.data.length">
                                Ainda não houveram resultados
                            </div>

                            <div v-if="lastResults.isLoading">
                                <b-skeleton width="100%" height="24px" animated="animated" v-for="index in 5" :key="index"></b-skeleton>
                            </div>

                            <div class="divide-y">
                                <div v-if="!lastResults.isLoading && lastResults.data.length" v-for="result in lastResults.data" :key="result.id" class="flex flex-col gap-2 p-2">
                                    <div class="flex justify-between text-sm">
                                        <div class="flex flex-col gap-2">
                                            <div class="font-bold leading-none">
                                                Sorteio #{{ result.id }}
                                            </div>

                                            <div class="leading-none text-xs text-gray-500">
                                                {{ new Date(result.created_at).toLocaleDateString() }}
                                            </div>
                                        </div>

                                        <div class="flex flex-col gap-2">
                                            <div class="font-bold leading-none text-right">
                                                Número sorteado: {{ result.number }}
                                            </div>

                                            <div class="leading-none text-xs text-gray-500 text-right">
                                                {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.prize) }}
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="result.winners.length">
                                        <ul>
                                            <li class="text-xs list-disc" v-for="winner in result.winners" :key="winner.id">
                                                Teste
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </b-modal>
</template>

<style scoped>
.lottery-item {
  @apply bg-gray-50 border-2 p-2 flex items-center justify-center font-bold rounded-lg cursor-pointer aspect-square
}

.lottery-item--selected {
  @apply bg-blue-500 text-white border-2 border-blue-600
}
</style>
