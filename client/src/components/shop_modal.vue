<script setup lang="ts">
    import { defineModel, ref, onMounted, onUnmounted, computed, useTemplateRef } from 'vue'
    import { useI18n } from 'vue-i18n'
    import spriteJson from './../game/data/sprites.json'
    import { useToast } from 'vue-toast-notification';
    import 'vue-toast-notification/dist/theme-sugar.css';

    const model = defineModel()
    const { t } = useI18n()
    const $toast = useToast();

    const isLoading = ref(true)
    const shop = ref(null)
    const inventory = ref(null)
    const hasError = ref(false)
    const isFetching = ref(false)

    onMounted(async () => {
        try {
            inventory.value = await getPlayerInventory()
            shop.value = await getShop()
            isLoading.value = false
        } catch (error) {
            hasError.value = true
        }
    })

    const getPlayerInventory = async () => {
        const response = await window.gameClient.getPlayerInventory()

        return response.body.inventory 
    }

    const getShop = async () => {
        const response = await window.gameClient.getShop()

        return response.body
    }

    const formatPrice = (price) => {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const formattedProducts = computed(() => {
        return shop.value?.products.map((product) => {
            const spriteData = spriteJson[product.itemTypeId]
            const states = spriteData.states
            const mainImageIndex = 0
            const imageIndex = states.length > 1 ? 1 : 0

            const tileSize = spriteData.tileSize || 48
            const imageX = states[imageIndex] % spriteData.tilesetWidth * tileSize
            const imageY = Math.floor(states[imageIndex] / spriteData.tilesetWidth) * tileSize
            const mainImageX = states[mainImageIndex] % spriteData.tilesetWidth * tileSize
            const mainImageY = Math.floor(states[mainImageIndex] / spriteData.tilesetWidth) * tileSize
            const scale = (48 / tileSize) * 2

            return {
                ...product,
                price: formatPrice(product.price),
                promotional_price: formatPrice(2 * product.price),
                imageUrl: spriteData?.tileset,
                imageX,
                imageY,
                mainImageX,
                mainImageY,
                width: spriteData?.width * tileSize,
                height: spriteData?.height * tileSize,
                playerOwns: inventory.value?.some((item) => item.item.itemType.id === product.itemTypeId),
                tileSize,
                scale
            }
        })
    })

    const handleBuy = async (product) => {
        if (isFetching.value) {
            return
        }

        isFetching.value = true

        try {
            await window.gameClient.buyItem(product.itemTypeId)
            inventory.value = await getPlayerInventory()
        } catch (error) {
            if (error.status == 400) {
                $toast.open({
                    message: 'Você não tem dinheiro suficiente para comprar este produto.',
                    type: 'error',
                    duration: 5000
                })
            } else {
                $toast.open({
                    message: 'Ocorreu um erro ao comprar o produto.',
                    type: 'error',
                    duration: 5000
                })
            }
        } finally {
            isFetching.value = false
        }
    }
</script>

<template>
    <b-modal v-model="model">
        <div class="bg-white rounded-lg h-[800px] overflow-y-auto">
            <header class="p-4 border-b">
                <div class="flex items-center justify-center">
                    <h1 class="text-xl font-extrabold uppercase">Lojinha</h1>
                </div>
            </header>

            <div class="p-6">
                <section class="text-center">
                    <div class="text-xl text-red-500 bg-gray-900 p-4 font-bold uppercase">
                        Promoção Black Friday
                    </div>
                </section>

                <section class="grid grid-cols-4 gap-6 mt-10" v-if="!isLoading">
                    <div class="space-y-3" v-for="product in formattedProducts" :key="product.itemTypeId">
                        <div class="bg-neutral-100 flex items-center justify-center p-4 h-56 group">
                            <div class="w-full h-full group-hover:hidden" :style="{ width: `${product.width}px`, height: `${product.height}px`, backgroundImage: `url(${product.imageUrl})`, backgroundPosition: `-${product.mainImageX}px -${product.mainImageY}px`, transform: `scale(${product.scale})`, imageRendering: 'pixelated' }">
                            </div>

                            <div class="w-full h-full hidden group-hover:block" :style="{ width: `${product.width}px`, height: `${product.height}px`, backgroundImage: `url(${product.imageUrl})`, backgroundPosition: `-${product.imageX}px -${product.imageY}px`, transform: `scale(${product.scale})`, imageRendering: 'pixelated' }">
                            </div>
                        </div>

                        <div class="font-semibold text-center leading-none">
                            {{ product.name }}
                        </div>

                        <div class="text-gray-500 text-center leading-none text-sm">
                            De: {{ product.promotional_price }}
                        </div>

                        <div class="text-gray-500 text-center leading-none font-bold">
                            Por: {{ product.price }}
                        </div>

                        <div>
                            <b-button class="w-full" icon-left="cart-arrow-down" size="is-small" v-if="!product.playerOwns" @click="handleBuy(product)">
                                Comprar
                            </b-button>

                            <b-button class="w-full" icon-left="cart-arrow-down" size="is-small" v-else disabled>
                                Comprado
                            </b-button>
                        </div>
                    </div>
                </section>

                <section class="grid grid-cols-4 gap-6" v-if="isLoading">
                    <div class="space-y-3" v-for="index in 12" :key="index">
                        <div class="flex items-center justify-center h-56">
                          <b-skeleton width="100%" height="224px" animated="animated"></b-skeleton>
                        </div>

                        <div>
                            <b-skeleton width="100%" height="24px" animated="animated"></b-skeleton>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </b-modal>
</template>
