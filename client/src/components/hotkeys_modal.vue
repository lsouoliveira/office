<script setup lang="ts">
    import { defineModel, ref, onMounted, computed, useTemplateRef } from 'vue'
    import { useI18n } from 'vue-i18n'

    const model = defineModel()
    const { t } = useI18n()
    const hotkeys = ref([
        {
            label: 'ctrl + 1',
            value: '',
            name: 'ctrl1'
        },
        {
            label: 'ctrl + 2',
            value: '',
            name: 'ctrl2'
        },
        {
            label: 'ctrl + 3',
            value: '',
            name: 'ctrl3'
        },
        {
            label: 'ctrl + 4',
            value: '',
            name: 'ctrl4'
        },
        {
            label: 'ctrl + 5',
            value: '',
            name: 'ctrl5'
        },
    ])

    onMounted(async () => {
        hotkeys.value.forEach((hotkey) => {
            hotkey.value = getHotkeys().find((h) => h.name === hotkey.name)?.value || ''
        })
    })

    const getHotkeys = () => {
        try {
            return JSON.parse(localStorage.getItem('hotkeys')) || []
        } catch(e) {
            return []
        }
    }

    const handleHotkey = (e) => {
        const { name, value } = e.target

        hotkeys.value = hotkeys.value.map((hotkey) => {
            if (hotkey.name === name) {
                hotkey.value = value
            }

            return hotkey
        })

        localStorage.setItem('hotkeys', JSON.stringify(hotkeys.value))
    }
</script>

<template>
    <b-modal v-model="model" width="480px">
        <div class="card">
            <div class="card-header">
                <div class="card-header-title">Atalhos</div>
            </div>

            <div class="card-content">
              <b-field :label="hotkey.label" v-for="hotkey in hotkeys" :key="hotkey">
                <b-input
                  type="text"
                  :name="hotkey.name"
                  :value="hotkey.value"
                  @input="handleHotkey"
                />
              </b-field>
            </div>
        </div>
    </b-modal>
</template>
