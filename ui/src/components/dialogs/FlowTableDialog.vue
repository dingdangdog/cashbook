<template>
  <v-dialog v-model="showFlowTableDialog" :fullscreen="miniFullscreen()" max-width="1280px">
    <v-card>
      <v-card-title style="width: 100%; display: flex; justify-content: space-between">
        <h3>流水明细</h3>
        <v-btn variant="elevated" icon="mdi-close" @click="closeDialog"> </v-btn>
      </v-card-title>
      <v-card-text style="padding: 0.5rem;">
        <FlowTable :query="flowTableQuery" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { flowTableQuery, showFlowTableDialog } from '@/stores/flag'
import FlowTable from '@/components/FlowTable.vue'
import { miniFullscreen } from '@/utils/common';

const closeDialog = () => {
  showFlowTableDialog.value = false
}
</script>

<style scoped></style>
