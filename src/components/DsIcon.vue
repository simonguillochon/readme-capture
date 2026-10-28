<script setup lang="ts">
// Atome Icon du DS : icônes Phosphor Light exportées depuis Figma (page Components, cadre Icons 171:753).
// Les SVG sont appliqués en masque pour prendre la couleur du texte, comme le prévoit le DS pour le mode sombre.
import arrowRight from './icons/arrow-right-light.svg';
import check from './icons/check-light.svg';
import eye from './icons/eye-light.svg';
import eyeSlash from './icons/eye-slash-light.svg';

const icons = { 'arrow-right': arrowRight, check, eye, 'eye-slash': eyeSlash };

defineProps<{ name: keyof typeof icons }>();
</script>

<template>
  <span
    aria-hidden="true"
    class="inline-block size-6 shrink-0 bg-current"
    :style="{ mask: `url(&quot;${icons[name]}&quot;) center / contain no-repeat` }"
  />
</template>
