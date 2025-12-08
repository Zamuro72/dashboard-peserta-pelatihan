<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <h1>Dashboard Peserta Pelatihan</h1>
        <button @click="handleLogout" class="logout-btn">
          <LogOut :size="18" />
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Peserta</div>
          <div class="stat-value">{{ stats.total }}</div>
        </div>
        <div class="stat-card stat-bnsp">
          <div class="stat-label">BNSP</div>
          <div class="stat-value">{{ stats.bnsp }}</div>
        </div>
        <div class="stat-card stat-kemnaker">
          <div class="stat-label">Kemnaker RI</div>
          <div class="stat-value">{{ stats.kemnaker }}</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-card">
        <div class="controls-grid">
          <!-- Search -->
          <div class="search-box">
            <Search class="icon-left" :size="20" />
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Cari peserta, perusahaan, materi..."
            />
          </div>

          <!-- Filter -->
          <div class="filter-box">
            <Filter class="icon-left" :size="20" />
            <select v-model="filterType">
              <option value="all">Semua Sertifikat</option>
              <option value="bnsp">BNSP</option>
              <option value="kemnaker">Kemnaker RI</option>
            </select>
          </div>

          <!-- Upload Button -->
          <button @click="showUploadModal = true" class="upload-btn">
            <Upload :size="20" />
            Upload Excel
          </button>
        </div>

        <!-- Results Info -->
        <div class="results-info">
          Menampilkan {{ pesertaData.length }} peserta
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div v-if="loading" class="loading">Loading data...</div>
        <div v-else-if="pesertaData.length === 0" class="no-data">
          Tidak ada data peserta
        </div>
        <div v-else class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Peserta</th>
                <th>Perusahaan</th>
                <th>Pelatihan</th>
                <th>Ujikom/Praktek</th>
                <th>Materi/Skema</th>
                <th>KSO/LSP</th>
                <th>SKL</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pesertaData" :key="item.id">
                <td>{{ item.no }}</td>
                <td class="font-medium">{{ item.nama_peserta }}</td>
                <td>{{ item.nama_perusahaan }}</td>
                <td>{{ item.pelatihan }}</td>
                <td>{{ item.ujikom_praktek }}</td>
                <td>
                  <span
                    :class="[
                      'badge',
                      item.materi_skema?.includes('BNSP') ? 'badge-bnsp' :
                      item.materi_skema?.includes('Kemnaker') || item.materi_skema?.includes('KEMNAKER') ? 'badge-kemnaker' : 'badge-default'
                    ]"
                  >
                    {{ item.materi_skema }}
                  </span>
                </td>
                <td>{{ item.kso_lsp }}</td>
                <td class="text-center">
                  {{ item.skl_sertifikat === 'v' ? '✓' : item.skl_sertifikat === 'x' ? '✗' : '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadModal
      v-if="showUploadModal"
      @close="showUploadModal = false"
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Search, Upload, LogOut, Filter } from 'lucide-vue-next'
import api from '../services/api'
import UploadModal from './UploadModal.vue'

const emit = defineEmits(['logout'])

const pesertaData = ref([])
const loading = ref(true)
const searchTerm = ref('')
const filterType = ref('all')
const showUploadModal = ref(false)
const stats = ref({ total: 0, bnsp: 0, kemnaker: 0 })

onMounted(() => {
  fetchPeserta()
  fetchStats()
})

watch([searchTerm, filterType], () => {
  fetchPeserta()
})

const fetchPeserta = async () => {
  try {
    loading.value = true
    const response = await api.getPeserta({
      search: searchTerm.value,
      filter: filterType.value
    })
    pesertaData.value = response.data
  } catch (error) {
    console.error('Error fetching peserta:', error)
    alert('Gagal memuat data peserta')
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await api.getStats()
    stats.value = response.stats
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    emit('logout')
  }
}

const handleUploadSuccess = () => {
  showUploadModal.value = false
  fetchPeserta()
  fetchStats()
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.header {
  background-color: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #dc2626;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #b91c1c;
}

.main-content {
  max-width: 80rem;
  margin: 0 auto;
  padding: 1.5rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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

.stat-bnsp .stat-value {
  color: #2563eb;
}

.stat-kemnaker .stat-value {
  color: #16a34a;
}

.controls-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.search-box,
.filter-box {
  position: relative;
}

.icon-left {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}

.search-box input,
.filter-box select {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  outline: none;
  font-size: 0.875rem;
}

.filter-box select {
  cursor: pointer;
  background-color: white;
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #16a34a;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upload-btn:hover {
  background-color: #15803d;
}

.results-info {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.table-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading,
.no-data {
  padding: 3rem;
  text-align: center;
  color: #6b7280;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  text-transform: uppercase;
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
}

.font-medium {
  font-weight: 500;
}

.text-center {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.badge-bnsp {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-kemnaker {
  background-color: #dcfce7;
  color: #166534;
}

.badge-default {
  background-color: #f3f4f6;
  color: #1f2937;
}
</style>