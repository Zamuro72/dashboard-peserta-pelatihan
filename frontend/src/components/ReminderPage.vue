<!-- frontend/src/components/ReminderPage.vue -->
<template>
  <div class="reminder-page">
    <div class="page-header">
      <div>
        <h1>🔔 Reminder Sertifikat</h1>
        <p>Sertifikat yang akan expired dalam 3 bulan</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card stat-warning">
        <div class="stat-icon">
          <AlertTriangle :size="32" />
        </div>
        <div>
          <div class="stat-label">Akan Expired</div>
          <div class="stat-value">{{ reminderData.length }}</div>
        </div>
      </div>
      
      <div class="stat-card stat-danger">
        <div class="stat-icon">
          <XCircle :size="32" />
        </div>
        <div>
          <div class="stat-label">Sudah Expired</div>
          <div class="stat-value">{{ expiredData.length }}</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="controls-card">
      <div class="search-box">
        <Search class="icon-left" :size="20" />
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Cari peserta, perusahaan, nomor WA..."
        />
      </div>

      <div class="filter-tabs">
        <button 
          @click="activeTab = 'reminder'"
          :class="['tab-btn', { active: activeTab === 'reminder' }]"
        >
          <AlertTriangle :size="18" />
          Akan Expired ({{ filteredReminderData.length }})
        </button>
        <button 
          @click="activeTab = 'expired'"
          :class="['tab-btn', { active: activeTab === 'expired' }]"
        >
          <XCircle :size="18" />
          Sudah Expired ({{ filteredExpiredData.length }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data reminder...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="currentData.length === 0" class="empty-state">
      <CheckCircle :size="64" />
      <h3>Tidak Ada {{ activeTab === 'reminder' ? 'Reminder' : 'Sertifikat Expired' }}</h3>
      <p>{{ activeTab === 'reminder' ? 'Semua sertifikat masih aman' : 'Tidak ada sertifikat yang expired' }}</p>
    </div>

    <!-- Table -->
    <div v-else class="table-card">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Peserta</th>
              <th>Perusahaan</th>
              <th>Nomor WhatsApp</th>
              <th>Materi/Skema</th>
              <th>Tanggal Terima Sertifikat</th>
              <th>Expired Date</th>
              <th>Sisa Waktu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in currentData" :key="item.id">
              <td>{{ item.no }}</td>
              <td class="font-medium">{{ item.nama_peserta }}</td>
              <td>{{ item.nama_perusahaan }}</td>
              <td>{{ item.nomor_whatsapp || '-' }}</td>
              <td>
                <span :class="getBadgeClass(item.materi_skema)">
                  {{ item.materi_skema }}
                </span>
              </td>
              <td>{{ formatDate(item.sertifikat_diterima_peserta) }}</td>
              <td>{{ formatDate(item.expired_date) }}</td>
              <td>
                <span :class="getRemainingClass(item)">
                  {{ item.remaining_text }}
                </span>
              </td>
              <td>
                <span :class="getStatusClass(item)">
                  {{ item.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, AlertTriangle, XCircle, CheckCircle } from 'lucide-vue-next'
import api from '../services/api'

const loading = ref(true)
const reminderData = ref([])
const expiredData = ref([])
const searchTerm = ref('')
const activeTab = ref('reminder')

onMounted(async () => {
  await fetchReminderData()
})

const fetchReminderData = async () => {
  try {
    loading.value = true
    const response = await api.getReminderData()
    reminderData.value = response.reminder || []
    expiredData.value = response.expired || []
  } catch (error) {
    console.error('Error fetching reminder data:', error)
  } finally {
    loading.value = false
  }
}

const filteredReminderData = computed(() => {
  if (!searchTerm.value) return reminderData.value
  
  const search = searchTerm.value.toLowerCase()
  return reminderData.value.filter(item => 
    item.nama_peserta?.toLowerCase().includes(search) ||
    item.nama_perusahaan?.toLowerCase().includes(search) ||
    item.nomor_whatsapp?.toLowerCase().includes(search) ||
    item.materi_skema?.toLowerCase().includes(search)
  )
})

const filteredExpiredData = computed(() => {
  if (!searchTerm.value) return expiredData.value
  
  const search = searchTerm.value.toLowerCase()
  return expiredData.value.filter(item => 
    item.nama_peserta?.toLowerCase().includes(search) ||
    item.nama_perusahaan?.toLowerCase().includes(search) ||
    item.nomor_whatsapp?.toLowerCase().includes(search) ||
    item.materi_skema?.toLowerCase().includes(search)
  )
})

const currentData = computed(() => {
  return activeTab.value === 'reminder' ? filteredReminderData.value : filteredExpiredData.value
})

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  
  // Parse DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.split(/[\/\-]/)
  if (parts.length !== 3) return dateStr
  
  const day = parts[0].padStart(2, '0')
  const month = parts[1].padStart(2, '0')
  const year = parts[2]
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${day} ${months[parseInt(month) - 1]} ${year}`
}

const getBadgeClass = (materi) => {
  if (!materi) return 'badge badge-default'
  if (materi.includes('BNSP')) return 'badge badge-bnsp'
  if (materi.includes('Kemnaker') || materi.includes('KEMNAKER')) return 'badge badge-kemnaker'
  return 'badge badge-default'
}

const getRemainingClass = (item) => {
  if (item.is_expired) return 'remaining-text expired'
  if (item.days_remaining <= 30) return 'remaining-text critical'
  if (item.days_remaining <= 60) return 'remaining-text warning'
  return 'remaining-text normal'
}

const getStatusClass = (item) => {
  if (item.is_expired) return 'status-badge status-expired'
  if (item.days_remaining <= 30) return 'status-badge status-critical'
  if (item.days_remaining <= 60) return 'status-badge status-warning'
  return 'status-badge status-normal'
}
</script>

<style scoped>
.reminder-page {
  padding: 1.5rem;
  max-width: 80rem;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #6b7280;
  font-size: 0.9375rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-warning .stat-icon {
  color: #f59e0b;
}

.stat-danger .stat-icon {
  color: #dc2626;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #1f2937;
}

.controls-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.icon-left {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.875rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
}

.loading-state {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6b7280;
  font-size: 0.9375rem;
}

.empty-state {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 3rem;
  text-align: center;
}

.empty-state svg {
  margin: 0 auto 1rem;
  color: #10b981;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
}

.table-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
}

thead {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

tbody tr:hover {
  background-color: #f9fafb;
}

td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.font-medium {
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge-bnsp {
  background-color: #eef2ff;
  color: #2563eb;
}

.badge-kemnaker {
  background-color: #ecfdf5;
  color: #16a34a;
}

.badge-default {
  background-color: #f3f4f6;
  color: #6b7280;
}

.remaining-text {
  font-weight: 600;
}

.remaining-text.expired {
  color: #dc2626;
}

.remaining-text.critical {
  color: #dc2626;
}

.remaining-text.warning {
  color: #f59e0b;
}

.remaining-text.normal {
  color: #10b981;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-expired {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-critical {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-warning {
  background-color: #fef3c7;
  color: #d97706;
}

.status-normal {
  background-color: #d1fae5;
  color: #065f46;
}
</style>