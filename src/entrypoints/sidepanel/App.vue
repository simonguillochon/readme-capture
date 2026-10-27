<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DsLink from '@/components/DsLink.vue';
import { readNotionConfig } from '@/config/notion-config';

// `null` tant que la configuration n'a pas été lue.
const configured = ref<boolean | null>(null);

onMounted(async () => {
  configured.value = (await readNotionConfig()) !== null;
});

const optionsUrl = browser.runtime.getURL('/options.html');

function openOptions() {
  browser.runtime.openOptionsPage();
}
</script>

<template>
  <main class="flex flex-col gap-4 p-4">
    <template v-if="configured === false">
      <p class="text-body text-text-primary">La connexion à Notion n'est pas configurée</p>
      <DsLink :href="optionsUrl" @click.prevent="openOptions">Ouvrir la page d'options</DsLink>
    </template>
  </main>
</template>
