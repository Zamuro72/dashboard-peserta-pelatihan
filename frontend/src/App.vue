<template>
  <div id="app">
    <!-- Hourglass Loader -->
    <div v-if="showLoader" class="loader-overlay">
      <div class="loader-content">
        <div class="hourglass-loader">
          <div class="hourglass">
            <div class="hourglass-top"></div>
            <div class="hourglass-middle"></div>
            <div class="hourglass-bottom"></div>
          </div>
        </div>
        <h2 class="loader-text">Dashboard Peserta Pelatihan</h2>
        <p class="loader-subtext">Memuat aplikasi...</p>
      </div>
    </div>

    <!-- Main App -->
    <div v-else>
      <LoginPage v-if="!isLoggedIn" @login="handleLogin" />
      <Dashboard v-else @logout="handleLogout" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import LoginPage from './components/LoginPage.vue'
import Dashboard from './components/Dashboard.vue'
import api from './services/api'

const isLoggedIn = ref(false)
const showLoader = ref(true)

onMounted(async () => {
  // Show loader for 5 seconds
  setTimeout(async () => {
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
    showLoader.value = false
  }, 5000)
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

/* Loader Overlay */
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loader-content {
  text-align: center;
  animation: fadeIn 0.5s ease-in;
}

.loader-text {
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
  animation: pulse 2s ease-in-out infinite;
}

.loader-subtext {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

/* Hourglass Animation */
.hourglass-loader {
  display: inline-block;
}

.hourglass {
  width: 80px;
  height: 120px;
  position: relative;
  animation: rotate 5s linear infinite;
}

.hourglass-top,
.hourglass-middle,
.hourglass-bottom {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.hourglass-top {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-top: 50px solid rgba(255, 255, 255, 0.9);
  top: 0;
  animation: fillTop 5s ease-in-out infinite;
}

.hourglass-middle {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  animation: sandFlow 2s ease-in-out infinite;
}

.hourglass-bottom {
  width: 0;
  height: 0;
  border-left: 40px solid transparent;
  border-right: 40px solid transparent;
  border-bottom: 50px solid rgba(255, 255, 255, 0.9);
  bottom: 0;
  animation: fillBottom 5s ease-in-out infinite;
}

/* Animations */
@keyframes rotate {
  0%, 90% {
    transform: rotate(0deg);
  }
  95%, 100% {
    transform: rotate(180deg);
  }
}

@keyframes fillTop {
  0% {
    border-top-width: 50px;
  }
  90% {
    border-top-width: 0px;
  }
  100% {
    border-top-width: 0px;
  }
}

@keyframes fillBottom {
  0% {
    border-bottom-width: 0px;
  }
  90% {
    border-bottom-width: 50px;
  }
  100% {
    border-bottom-width: 50px;
  }
}

@keyframes sandFlow {
  0%, 100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  25% {
    opacity: 1;
    transform: translate(-50%, -80%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  75% {
    opacity: 1;
    transform: translate(-50%, 20%) scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>