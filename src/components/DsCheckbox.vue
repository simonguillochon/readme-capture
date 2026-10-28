<script setup lang="ts">
// Atome Checkbox du DS (Figma, page Components, nœud 646:86) : case de 20 px dessinée sur un vrai input checkbox,
// relié à son libellé pour garder Tab et Espace, avec l'icône check affichée par-dessus quand la case est cochée.
import DsIcon from './DsIcon.vue';

const model = defineModel<boolean>({ default: false });

withDefaults(defineProps<{ label: string; disabled?: boolean }>(), { disabled: false });
</script>

<template>
  <label class="inline-flex items-center gap-2 text-body text-text-primary has-disabled:text-text-tertiary">
    <span class="grid size-[20px] shrink-0 place-items-center">
      <input
        v-model="model"
        type="checkbox"
        :disabled="disabled"
        class="peer col-start-1 row-start-1 size-[20px] appearance-none rounded-sm border border-border-default bg-surface-elevated enabled:hover:border-border-accent checked:border-0 checked:bg-accent enabled:checked:hover:bg-accent-hover disabled:border-border-subtle disabled:bg-surface-secondary disabled:checked:bg-border-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      <DsIcon
        name="check"
        class="pointer-events-none col-start-1 row-start-1 invisible size-4! text-text-inverse peer-checked:visible"
      />
    </span>
    {{ label }}
  </label>
</template>
