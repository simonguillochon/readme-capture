<script setup lang="ts">
// Message de succès ou d'erreur (forme validée par l'utilisatrice, hors DS) : bloc bordé en couleur sémantique.
defineProps<{ variant: 'success' | 'error' }>();
</script>

<template>
  <p
    :role="variant === 'error' ? 'alert' : 'status'"
    class="rounded-sm border bg-surface-elevated p-3 text-body-s text-text-primary"
    :class="variant === 'error' ? 'border-error' : 'border-success'"
  >
    <slot />
  </p>
</template>
