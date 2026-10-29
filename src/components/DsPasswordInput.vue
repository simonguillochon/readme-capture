<script setup lang="ts">
// Atome Password Input du DS v1.13 (Figma, page Components, nœud 645:82) : Input de 44 px suivi d'un Icon Button ghost md
// de 44 × 44 px, espacés de 8 px.
import { ref } from 'vue';
import DsInput from './DsInput.vue';
import DsIconButton from './DsIconButton.vue';

const model = defineModel<string>({ default: '' });

defineProps<{
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}>();

const visible = ref(false);
</script>

<template>
  <div class="flex items-center gap-2">
    <DsInput
      :id="id"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :disabled="disabled"
      :invalid="invalid"
      autocomplete="off"
      spellcheck="false"
    />
    <DsIconButton
      variant="ghost"
      :icon="visible ? 'eye-slash' : 'eye'"
      :label="visible ? 'Masquer' : 'Afficher'"
      :pressed="visible"
      :disabled="disabled"
      @click="visible = !visible"
    />
  </div>
</template>
