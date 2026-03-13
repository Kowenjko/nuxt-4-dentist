<script lang="ts" setup>
const { title, subtitle } = defineProps<{ title: string; subtitle: string }>()
</script>

<template>
  <div>
    <h1 class="page-title">{{ title }}</h1>
    <p class="page-sub">{{ subtitle }}</p>
  </div>
</template>
<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.page-sub {
  font-size: 12.5px;
  color: var(--text-3);
  margin-top: 3px;
}
</style>
