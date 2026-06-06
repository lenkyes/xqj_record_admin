<script setup lang="ts">
import { statusLabel, statusType } from '@/utils/format'

defineProps<{
  status?: string
}>()
</script>

<template>
  <el-tag :type="statusType(status)" effect="light" round>
    {{ statusLabel(status) }}
  </el-tag>
</template>
