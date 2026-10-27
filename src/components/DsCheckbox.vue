<script setup lang="ts">
// Case à cocher (composant hors DS, validé par l'utilisatrice, design.md décision 9) :
// case native colorée avec le token accent, contour de focus des autres atomes, libellé en Body.
const model = defineModel<boolean>({ default: false });

withDefaults(defineProps<{ label: string; disabled?: boolean }>(), { disabled: false });
</script>

<template>
  <label class="inline-flex items-center gap-2 text-body text-text-primary has-disabled:opacity-60">
    <input
      v-model="model"
      type="checkbox"
      :disabled="disabled"
      class="size-4 shrink-0 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    />
    {{ label }}
  </label>
</template>
