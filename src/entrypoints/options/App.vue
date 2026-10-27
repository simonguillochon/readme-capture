<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DsButton from '@/components/DsButton.vue';
import DsField from '@/components/DsField.vue';
import DsInput from '@/components/DsInput.vue';
import DsMessage from '@/components/DsMessage.vue';
import DsPasswordInput from '@/components/DsPasswordInput.vue';
import { extractDatabaseId } from '@/config/database-id';
import { readNotionConfig, writeNotionConfig } from '@/config/notion-config';
import { MESSAGES } from '@/notion/errors';
import { VerificationError, verifyConnection } from '@/notion/verification';

const token = ref('');
const databaseUrl = ref('');
const message = ref<{ variant: 'success' | 'error'; text: string } | null>(null);

onMounted(async () => {
  const config = await readNotionConfig();
  if (config) {
    token.value = config.token;
    databaseUrl.value = config.databaseUrl;
  }
});

const canSave = computed(() => token.value.trim() !== '' && databaseUrl.value.trim() !== '');

async function save() {
  message.value = null;
  const savedToken = token.value.trim();
  const savedUrl = databaseUrl.value.trim();

  const databaseId = extractDatabaseId(savedUrl);
  if (!databaseId) {
    message.value = { variant: 'error', text: 'URL de base non reconnue' };
    return;
  }

  try {
    const { databaseTitle, dataSourceId } = await verifyConnection(savedToken, databaseId, () => {
      message.value = { variant: 'error', text: MESSAGES.rateLimited };
    });
    await writeNotionConfig({ token: savedToken, databaseUrl: savedUrl, databaseId, databaseTitle, dataSourceId });
    message.value = { variant: 'success', text: `Connexion vérifiée : ${databaseTitle}` };
  } catch (error) {
    if (!(error instanceof VerificationError)) throw error;
    message.value = { variant: 'error', text: error.message };
  }
}
</script>

<template>
  <main class="mx-auto flex max-w-reading flex-col gap-6 p-6">
    <form class="flex flex-col gap-6" @submit.prevent="save">
      <DsField label="Jeton d'intégration Notion" for="token">
        <DsPasswordInput id="token" v-model="token" />
      </DsField>
      <DsField label="URL de la base" for="database-url">
        <DsInput id="database-url" v-model="databaseUrl" type="text" />
      </DsField>
      <div>
        <DsButton type="submit" :disabled="!canSave">Enregistrer</DsButton>
      </div>
    </form>
    <DsMessage v-if="message" :variant="message.variant">{{ message.text }}</DsMessage>
  </main>
</template>
