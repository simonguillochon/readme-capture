<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DsLink from '@/components/DsLink.vue';
import { readNotionConfig, type NotionConfig } from '@/config/notion-config';
import CaptureForm from './CaptureForm.vue';

// `undefined` tant que la configuration n'a pas été lue, `null` si aucune n'est enregistrée.
const config = ref<NotionConfig | null | undefined>(undefined);

onMounted(async () => {
  config.value = await readNotionConfig();
});

const optionsUrl = browser.runtime.getURL('/options.html');

function openOptions() {
  browser.runtime.openOptionsPage();
}
</script>

<template>
  <main class="flex flex-col gap-4 p-4">
    <template v-if="config === null">
      <p class="text-body text-text-primary">La connexion à Notion n'est pas configurée</p>
      <DsLink :href="optionsUrl" @click.prevent="openOptions">Ouvrir la page d'options</DsLink>
    </template>
    <CaptureForm v-else-if="config" :config="config" />
  </main>
</template>
