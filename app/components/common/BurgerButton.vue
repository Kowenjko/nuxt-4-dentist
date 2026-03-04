<script lang="ts" setup>
const { menu } = defineProps<{ menu: boolean }>()
</script>

<template>
  <button class="burger" :class="{ open: menu }" v-bind="$attrs" aria-label="Меню">
    <span /><span /><span />
  </button>
</template>
<style scoped>
.burger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  margin-left: auto;
}
.burger span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--ink);
  border-radius: 2px;
  transition: all 0.2s;
}
.burger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.burger.open span:nth-child(2) {
  opacity: 0;
}
.burger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}
</style>
