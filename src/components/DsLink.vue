<script setup lang="ts">
// Atome Link du DS (Figma, page Components, nœud 308:21) : icône Phosphor 24 px avant le texte au survol.
import DsIcon from './DsIcon.vue';

defineProps<{ href: string }>();
</script>

<template>
  <a
    :href="href"
    class="group inline-flex items-center gap-2 font-sans text-[18px] leading-[1.6] font-regular text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
  >
    <span class="hidden group-hover:inline-flex"><DsIcon name="arrow-right" /></span>
    <slot />
  </a>
</template>
