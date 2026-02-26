<script lang="ts" setup>
const { logout } = useAuth()
</script>

<template>
  <div class="home-page">
    Index Page
    <!-- <button @click="logout">Logout</button> -->
  </div>
</template>
<style scoped>
.home-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
