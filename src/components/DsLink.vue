<script setup lang="ts">
// Atome Link du DS v1.13 (Figma, page Components, nœud 308:21) : zone de 44 px de haut, icône Phosphor 24 px avant le texte
// au survol, focus en anneau 2 px accent décalé de 2 px.
import DsIcon from './DsIcon.vue';

defineProps<{ href: string }>();
</script>

<template>
  <a
    :href="href"
    class="group inline-flex min-h-[44px] items-center gap-2 font-sans text-[18px] leading-[1.6] font-regular text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
  >
    <span class="hidden group-hover:inline-flex"><DsIcon name="arrow-right" /></span>
    <slot />
  </a>
</template>
