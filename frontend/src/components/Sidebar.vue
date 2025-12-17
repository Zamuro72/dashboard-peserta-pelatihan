<!-- frontend/src/components/Sidebar.vue -->
<template>
  <div>
    <!-- Overlay -->
    <div 
      v-if="isOpen" 
      class="sidebar-overlay" 
      @click="emit('close')"
    ></div>

    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-open': isOpen }]">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <img src="https://image2url.com/images/1765176740412-f6d15c8a-0308-4b9a-a335-aa11bec98115.png" alt="Logo" />
          <span>Dashboard</span>
        </div>
        <button @click="emit('close')" class="close-sidebar">
          <X :size="24" />
        </button>
      </div>

      <nav class="sidebar-nav">
        <button 
          @click="navigateTo('dashboard')"
          :class="['nav-item', { active: currentPage === 'dashboard' }]"
        >
          <LayoutDashboard :size="20" />
          <span>Dashboard</span>
        </button>

        <button 
          @click="navigateTo('reminder')"
          :class="['nav-item', { active: currentPage === 'reminder' }]"
        >
          <Bell :size="20" />
          <span>Reminder Sertifikat</span>
          <span v-if="reminderCount > 0" class="badge-count">{{ reminderCount }}</span>
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { X, LayoutDashboard, Bell } from 'lucide-vue-next'

defineProps({
  isOpen: Boolean,
  currentPage: String,
  reminderCount: Number
})

const emit = defineEmits(['close', 'navigate'])

const navigateTo = (page) => {
  emit('navigate', page)
}
</script>

<style scoped>
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background-color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-logo img {
  height: 32px;
  width: auto;
}

.sidebar-logo span {
  font-size: 1.125rem;
  font-weight: bold;
  color: #1f2937;
}

.close-sidebar {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.close-sidebar:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
  position: relative;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-item span:first-of-type {
  flex: 1;
}

.badge-count {
  background-color: #dc2626;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}

.nav-item.active .badge-count {
  background-color: white;
  color: #667eea;
}

@media (max-width: 640px) {
  .sidebar {
    width: 100%;
    max-width: 280px;
  }
}
</style>