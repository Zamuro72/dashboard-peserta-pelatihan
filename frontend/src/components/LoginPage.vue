<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Dashboard Peserta</h1>
        <p>Sistem Manajemen Pelatihan</p>
      </div>

      <div class="login-form">
        <div class="form-group">
          <label>Username</label>
          <input
            type="text"
            v-model="username"
            @keyup.enter="handleLogin"
            placeholder="Masukkan username"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input
            type="password"
            v-model="password"
            @keyup.enter="handleLogin"
            placeholder="Masukkan password"
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="login-button"
        >
          {{ loading ? 'Loading...' : 'Login' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

const emit = defineEmits(['login'])

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    const response = await api.login(username.value, password.value)
    emit('login', response.token)
  } catch (err) {
    error.value = err.response?.data?.error || 'Login gagal. Silakan coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-box {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 28rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.login-button {
  width: 100%;
  background-color: #2563eb;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.login-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.login-footer p {
  margin: 0.25rem 0;
}
</style>