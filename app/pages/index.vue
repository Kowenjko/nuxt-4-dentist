<script lang="ts" setup>
const { logout } = useAuth()
//definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div>
    <button @click="logout">Logout</button>
  </div>
</template>
