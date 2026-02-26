<script lang="ts" setup>
const { logout } = useAuth()
</script>

<template>
  <div>
    <button @click="logout">Logout</button>
  </div>
</template>
