<script lang="ts" setup>
const { logout } = useAuth()
</script>

<template>Index <button @click="logout">Logout</button></template>
