<script setup lang="ts">
// Message de succès, d'avertissement ou d'erreur (forme validée par l'utilisatrice, hors DS) : bloc bordé en couleur sémantique.
const props = defineProps<{ variant: 'success' | 'warning' | 'error' }>();

const borders = { success: 'border-success', warning: 'border-warning', error: 'border-error' };
</script>

<template>
  <p
    :role="props.variant === 'error' ? 'alert' : 'status'"
    class="rounded-sm border bg-surface-elevated p-3 text-body-s text-text-primary"
    :class="borders[props.variant]"
  >
    <slot />
  </p>
</template>
