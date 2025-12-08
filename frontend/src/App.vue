<template>
  <div id="app">
    <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
    <Dashboard v-else @logout="handleLogout" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginPage from './components/LoginPage.vue'
import Dashboard from './components/Dashboard.vue'
import api from './services/api'

const isLoggedIn = ref(false)

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      await api.verifyToken(token)
      isLoggedIn.value = true
    } catch (error) {
      localStorage.removeItem('token')
      isLoggedIn.value = false
    }
  }
})

const handleLogin = (token) => {
  localStorage.setItem('token', token)
  isLoggedIn.value = true
}

const handleLogout = () => {
  localStorage.removeItem('token')
  isLoggedIn.value = false
}
</script>

<style>
#app {
  min-height: 100vh;
}
</style>