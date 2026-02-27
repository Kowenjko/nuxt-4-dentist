<script lang="ts" setup>
const { logout } = useAuth()
</script>

<template>
  <div class="home-page">Index Page <BaseButton @click="logout">Logout</BaseButton></div>
</template>
<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
