<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  data: unknown
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const pretty = computed(() => JSON.stringify(props.data || {}, null, 2))
</script>

<template>
  <el-drawer v-model="visible" :title="title" size="520px" class="json-drawer">
    <pre>{{ pretty }}</pre>
  </el-drawer>
</template>
