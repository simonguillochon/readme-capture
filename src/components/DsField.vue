<script setup lang="ts">
// Libellé de champ : niveau Caption, couleur text-secondary, 8 px au-dessus du champ (choix validé par l'utilisatrice, hors DS).
defineProps<{ label: string; for: string }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <label :for="$props.for" class="text-caption text-text-secondary">{{ label }}</label>
    <slot />
  </div>
</template>
