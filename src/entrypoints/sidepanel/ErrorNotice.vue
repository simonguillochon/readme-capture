<script setup lang="ts">
// Message d'erreur Notion du panneau, suivi de l'action qui permet d'y remédier (US-10, design.md, décision 4).
import DsButton from '@/components/DsButton.vue';
import DsLink from '@/components/DsLink.vue';
import DsMessage from '@/components/DsMessage.vue';
import type { ErrorAction } from '@/notion/error-actions';

withDefaults(defineProps<{ message: string; action: ErrorAction | null; busy?: boolean }>(), { busy: false });

const emit = defineEmits<{ retry: []; finish: [] }>();

const optionsUrl = browser.runtime.getURL('/options.html');

function openOptions() {
  void browser.runtime.openOptionsPage();
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <DsMessage variant="error">{{ message }}</DsMessage>
    <div v-if="action === 'retry' || action === 'reload-themes' || action === 'finish'">
      <DsButton v-if="action === 'retry'" variant="secondary" size="sm" :disabled="busy" @click="emit('retry')">Réessayer</DsButton>
      <DsButton v-else-if="action === 'reload-themes'" variant="secondary" size="sm" :disabled="busy" @click="emit('retry')">
        Recharger les thèmes
      </DsButton>
      <DsButton v-else variant="secondary" size="sm" :disabled="busy" @click="emit('finish')">Terminer la capture</DsButton>
    </div>
    <DsLink v-else-if="action === 'options'" :href="optionsUrl" @click.prevent="openOptions">Ouvrir la page d'options</DsLink>
  </div>
</template>
