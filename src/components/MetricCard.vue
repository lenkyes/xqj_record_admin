<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: string | number
  note?: string
  tone?: string
  icon?: Component
}>()
</script>

<template>
  <article class="metric-card" :style="{ '--tone': tone || '#36c6a5' }">
    <div class="metric-icon">
      <component :is="icon" v-if="icon" :size="21" />
    </div>
    <div>
      <span>{{ title }}</span>
      <strong>{{ value }}</strong>
      <small v-if="note">{{ note }}</small>
    </div>
  </article>
</template>
