<script setup lang="ts">
// Atome Field label du DS (Figma, page Components, nœud 643:22) : niveau Caption, couleur text-secondary, 8 px au-dessus du champ.
defineProps<{ label: string; for: string }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="$props.for" class="text-caption text-text-secondary">{{ label }}</label>
    <slot />
  </div>
</template>
