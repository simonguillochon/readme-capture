<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import DsLink from '@/components/DsLink.vue';
import { finishCapture, loadCaptureStore, setConfiguredDatabase, useCaptureStore } from '@/capture/capture-store';
import { readNotionConfig, type NotionConfig } from '@/config/notion-config';
import CaptureForm from './CaptureForm.vue';

// `undefined` tant que la configuration n'a pas été lue, `null` si aucune n'est enregistrée.
const config = ref<NotionConfig | null | undefined>(undefined);
const store = useCaptureStore();

/**
 * Suit la configuration enregistrée dans la page d'options (US-10, design.md, décision 6) : les actions suivantes
 * l'utilisent, et une autre base abandonne la capture en cours.
 */
async function onStorageChanged(changes: Record<string, { newValue?: unknown }>, area: string) {
  if (area !== 'local' || !('notionConfig' in changes)) return;
  const next = (changes.notionConfig!.newValue as NotionConfig | undefined) ?? null;
  if (next === null) {
    setConfiguredDatabase(null);
  } else {
    await loadCaptureStore(next.databaseId);
    if (store.databaseId !== null && store.databaseId !== next.databaseId) await finishCapture();
  }
  config.value = next;
}

onMounted(async () => {
  const read = await readNotionConfig();
  // La capture conservée est reprise avant l'affichage du formulaire (US-09, design.md, décision 3).
  if (read) await loadCaptureStore(read.databaseId);
  config.value = read;
  browser.storage.onChanged.addListener(onStorageChanged);
});

onUnmounted(() => {
  browser.storage.onChanged.removeListener(onStorageChanged);
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
    <CaptureForm v-else-if="config" :key="store.resets" :config="config" />
  </main>
</template>
