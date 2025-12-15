<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-content logout-modal">
      <!-- Icon Header -->
      <div class="modal-icon-header">
        <div class="icon-circle">
          <LogOut :size="32" />
        </div>
      </div>

      <!-- Content -->
      <div class="modal-body">
        <h2>Konfirmasi Logout</h2>
        <p>Apakah Anda yakin ingin keluar dari dashboard?</p>
        <p class="info-text">Anda perlu login kembali untuk mengakses dashboard.</p>
      </div>

      <!-- Footer Actions -->
      <div class="modal-footer">
        <button @click="emit('cancel')" class="btn-cancel">
          <X :size="18" />
          Batal
        </button>
        <button @click="emit('confirm')" class="btn-logout">
          <LogOut :size="18" />
          Ya, Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LogOut, X } from 'lucide-vue-next'

const emit = defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 9999;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 28rem;
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Icon Header */
.modal-icon-header {
  display: flex;
  justify-content: center;
  padding: 2rem 1.5rem 1rem;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
}

.icon-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(220, 38, 38, 0.4);
  }
}

.icon-circle svg {
  animation: iconRotate 3s ease-in-out infinite;
}

@keyframes iconRotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.modal-body h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.modal-body p {
  font-size: 0.9375rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.info-text {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-logout {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* Cancel Button */
.btn-cancel {
  background-color: white;
  border: 2px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background-color: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-cancel:active {
  transform: translateY(0);
}

/* Logout Button */
.btn-logout {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-logout:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.btn-logout:active {
  transform: translateY(0);
}

/* Ripple Effect */
.btn-cancel::before,
.btn-logout::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-cancel:active::before,
.btn-logout:active::before {
  width: 300px;
  height: 300px;
}

/* Icon Animation on Hover */
.btn-cancel:hover svg {
  transform: rotate(90deg);
}

.btn-logout:hover svg {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0) rotate(0);
  }
  25% {
    transform: translateX(-5px) rotate(-5deg);
  }
  75% {
    transform: translateX(5px) rotate(5deg);
  }
}

/* Mobile Responsive */
@media (max-width: 640px) {
  .modal-content {
    margin: 1rem;
  }

  .modal-icon-header {
    padding: 1.5rem 1rem 0.75rem;
  }

  .icon-circle {
    width: 64px;
    height: 64px;
  }

  .icon-circle svg {
    width: 24px;
    height: 24px;
  }

  .modal-body h2 {
    font-size: 1.25rem;
  }

  .modal-body p {
    font-size: 0.875rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-cancel,
  .btn-logout {
    width: 100%;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .modal-content {
    background-color: #1f2937;
  }

  .modal-body h2 {
    color: #f9fafb;
  }

  .modal-body p {
    color: #d1d5db;
  }

  .info-text {
    color: #9ca3af;
  }

  .modal-footer {
    background-color: #111827;
    border-top-color: #374151;
  }

  .btn-cancel {
    background-color: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }

  .btn-cancel:hover {
    background-color: #4b5563;
    border-color: #6b7280;
  }
}
</style>