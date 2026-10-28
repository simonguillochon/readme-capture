<script setup lang="ts">
// Atome Message du DS (Figma, page Components, nœud 643:31) : texte et bordure dans la couleur feedback de la variante.
// Usage propre à Readme Capture, validé par l'utilisatrice : pleine largeur au lieu des 320 px de l'atome.
const props = defineProps<{ variant: 'success' | 'warning' | 'error' }>();

const colors = {
  success: 'border-feedback-success text-feedback-success',
  warning: 'border-feedback-warning text-feedback-warning',
  error: 'border-feedback-error text-feedback-error',
};
</script>

<template>
  <p
    :role="props.variant === 'error' ? 'alert' : 'status'"
    class="w-full rounded-sm border bg-surface-elevated p-3 text-body-s"
    :class="colors[props.variant]"
  >
    <slot />
  </p>
</template>
