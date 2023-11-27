<template>
  <div class="calendar-container">
    <CalendarChart />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const CalendarChart = defineAsyncComponent(() => import('@/components/charts/CalendarChart.vue'))
</script>

<style></style>
