<script lang="ts" setup>
const {
  title,
  sub,
  type = 'confirmed',
} = defineProps<{
  title: string
  sub: string
  type?: 'confirmed' | 'rating'
}>()
</script>

<template>
  <div :class="`chip chip-${type}`">
    <span v-if="type === 'confirmed'" class="chip-icon">✓</span>
    <span v-else class="chip-icon chip-star">★</span>
    <div>
      <div class="chip-title">{{ title }}</div>
      <div class="chip-sub">{{ sub }}</div>
    </div>
  </div>
</template>
<style scoped>
.chip {
  position: absolute;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 16px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--f2);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.08);
}
.chip-confirmed {
  bottom: -40px;
  left: -10px;
  animation: bob 5s ease-in-out infinite;
}
.chip-rating {
  bottom: -70px;
  right: 0;
  animation: bob 5s ease-in-out infinite 2.5s;
}
@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}
.chip-icon {
  font-size: 20px;
  flex-shrink: 0;
  color: var(--black-50);
}
.chip-star {
  color: var(--gol);
}
.chip-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--black-50);
}
.chip-sub {
  font-size: 11.5px;
  color: var(--i4);
  margin-top: 1px;
}

@media (max-width: 980px) {
  .chip {
    display: none;
  }
}
</style>
