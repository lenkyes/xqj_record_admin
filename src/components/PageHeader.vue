<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  permission?: string
}>()
</script>

<template>
  <section class="page-header">
    <div>
      <span v-if="permission" class="permission-chip">{{ permission }}</span>
      <h2>{{ title }}</h2>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-actions">
      <slot name="actions" />
    </div>
  </section>
</template>
