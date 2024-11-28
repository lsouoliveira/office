<script setup lang="ts">
    import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
    import { useI18n } from 'vue-i18n'

    const model = defineModel()
    const { t } = useI18n()

    const isLoading = ref(true)
    const items = ref([])
    const player = ref(null)
    const hasError = ref(false)
    const isFetching = ref(false)

    onMounted(async () => {
        try {
            const playerInventoryData = await getPlayerInventory()
            const playerData = await getPlayer()


            items.value = playerInventoryData
            player.value = playerData
        } catch (error) {
            hasError.value = true
        } finally {
            isLoading.value = false
        }
    })

    const getPlayerInventory = async () => {
        const { body } = await window.gameClient.getPlayerInventory()

        return body.inventory
    }

    const getPlayer = async () => {
        const response = await window.gameClient.getPlayer()

        return response.body.player
    }

    const formattedItems = computed(() => {
        return items.value.map((item) => {
            const isEquipped = player.value?.helmetSlot?.id === item.item.id || 
                                 player.value?.glassesSlot?.id === item.item.id || 
                                 player.value?.faceMaskSlot?.id === item.item.id || 
                                 player.value?.rightHandSlot?.id === item.item.id
            const isEquipable = item.item.itemType.equipmentId !== null && !isEquipped

            return {
                id: item.item.id,
                itemTypeId: item.item.itemType.id,
                isEquipable,
                isEquipped
            }
        })
    })

    const handleEquipItem = async (item) => {
        if (isFetching.value) {
            return
        }

        isFetching.value = true

        try {
            await window.gameClient.equipItem(item.id)
            await updateInventory()
        } catch (error) {
            console.error(error)
        } finally {
            isFetching.value = false
        }
    }

    const handleUnequipItem = async (item) => {
        if (isFetching.value) {
            return
        }

        isFetching.value = true

        try {
            await window.gameClient.unequipItem(item.id)
            await updateInventory()
        } catch (error) {
            console.error(error)
        } {
            isFetching.value = false
        }
    }

    const updateInventory = async () => {
        try {
            const playerInventoryData = await getPlayerInventory()
            const playerData = await getPlayer()

            items.value = playerInventoryData
            player.value = playerData
        } catch (error) {
            console.error(error)
        }
    }
</script>

<template>
    <b-modal v-model="model" width="480px">
        <div class="card">
            <div class="card-header">
                <div class="card-header-title">Mochila</div>
            </div>

            <div class="card-content">
                <div class="text-center" v-if="isLoading">
                    Carregando...
                </div>

                <div v-else>
                    <div v-if="hasError" class="text-center">
                        Erro ao carregar mochila
                    </div>

                    <div v-else>
                        <div class="text-center" v-if="items.length === 0">
                            Mochila vazia
                        </div>

                        <div v-else>
                            <div class="divide-y">
                                <div v-for="item in formattedItems" :key="item.id" class="flex items-center justify-between p-2">
                                    <div class="font-semibold">
                                        {{ t(`items.${item.itemTypeId}`) }}
                                    </div>

                                    <div class="flex gap-2">
                                        <b-button v-if="item.isEquipable" type="is-primary" size="is-small" @click="handleEquipItem(item)">Equipar</b-button>
                                        <b-button v-if="item.isEquipped" type="is-danger" size="is-small" @click="handleUnequipItem(item)">Remover</b-button>
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
