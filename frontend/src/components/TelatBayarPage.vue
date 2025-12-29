<template>
  <div class="telat-bayar-page">
    <div class="page-header">
      <div>
        <h1>💰 Peserta Suka Telat Bayar</h1>
        <p>Daftar peserta yang ditandai sering telat bayar</p>
      </div>
    </div>

    <!-- Stats Card -->
    <div class="stats-grid">
      <div class="stat-card stat-danger">
        <div class="stat-icon">
          <AlertCircle :size="32" />
        </div>
        <div>
          <div class="stat-label">Total Peserta Telat Bayar</div>
          <div class="stat-value">{{ telatBayarData.length }}</div>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="controls-card">
      <div class="search-box">
        <Search class="icon-left" :size="20" />
        <input
          type="text"
          v-model="searchTerm"
          placeholder="Cari peserta, perusahaan, nomor WA, catatan..."
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat data...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredData.length === 0" class="empty-state">
      <CheckCircle :size="64" />
      <h3>Tidak Ada Peserta Telat Bayar</h3>
      <p>Belum ada peserta yang ditandai telat bayar</p>
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
              <th>Tanggal Invoice</th>
              <th>Catatan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredData" :key="item.id">
              <td>{{ item.no }}</td>
              <td class="font-medium">
                <div class="name-with-badge">
                  {{ item.nama_peserta }}
                  <span class="badge-telat-bayar">Telat Bayar</span>
                </div>
              </td>
              <td>{{ item.nama_perusahaan }}</td>
              <td>{{ item.nomor_whatsapp || '-' }}</td>
              <td>
                <span :class="getBadgeClass(item.materi_skema)">
                  {{ item.materi_skema }}
                </span>
              </td>
              <td>{{ item.tanggal_invoice }}</td>
              <td>
                <div class="catatan-cell">
                  {{ item.catatan_telat_bayar || '-' }}
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button 
                    @click="openEditModal(item)" 
                    class="btn-icon btn-edit"
                    title="Edit Catatan"
                  >
                    <Edit :size="16" />
                  </button>
                  <button 
                    @click="confirmUnmark(item)" 
                    class="btn-icon btn-danger"
                    title="Hapus Tanda"
                  >
                    <X :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Catatan Telat Bayar</h2>
          <button @click="showEditModal = false" class="close-btn">
            <X :size="24" />
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nama Peserta</label>
            <input type="text" :value="selectedItem?.nama_peserta" disabled class="input-disabled" />
          </div>
          <div class="form-group">
            <label>Catatan</label>
            <textarea 
              v-model="editCatatan" 
              rows="4"
              placeholder="Masukkan catatan telat bayar..."
              class="textarea-input"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showEditModal = false" class="btn-cancel">Batal</button>
          <button @click="saveEdit" :disabled="saving" class="btn-save">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, AlertCircle, CheckCircle, Edit, X } from 'lucide-vue-next'
import api from '../services/api'

const loading = ref(true)
const telatBayarData = ref([])
const searchTerm = ref('')
const showEditModal = ref(false)
const selectedItem = ref(null)
const editCatatan = ref('')
const saving = ref(false)

onMounted(async () => {
  await fetchTelatBayarData()
})

const fetchTelatBayarData = async () => {
  try {
    loading.value = true
    const response = await api.getTelatBayarData()
    telatBayarData.value = response.data || []
  } catch (error) {
    console.error('Error fetching telat bayar data:', error)
  } finally {
    loading.value = false
  }
}

const filteredData = computed(() => {
  if (!searchTerm.value) return telatBayarData.value
  
  const search = searchTerm.value.toLowerCase()
  return telatBayarData.value.filter(item => 
    item.nama_peserta?.toLowerCase().includes(search) ||
    item.nama_perusahaan?.toLowerCase().includes(search) ||
    item.nomor_whatsapp?.toLowerCase().includes(search) ||
    item.catatan_telat_bayar?.toLowerCase().includes(search)
  )
})

const getBadgeClass = (materi) => {
  if (!materi) return 'badge badge-default'
  if (materi.includes('BNSP')) return 'badge badge-bnsp'
  if (materi.includes('Kemnaker') || materi.includes('KEMNAKER')) return 'badge badge-kemnaker'
  return 'badge badge-default'
}

const openEditModal = (item) => {
  selectedItem.value = item
  editCatatan.value = item.catatan_telat_bayar || ''
  showEditModal.value = true
}

const saveEdit = async () => {
  try {
    saving.value = true
    await api.markTelatBayar(selectedItem.value.id, editCatatan.value)
    alert('Catatan berhasil diupdate')
    showEditModal.value = false
    await fetchTelatBayarData()
  } catch (error) {
    console.error('Error saving:', error)
    alert('Gagal menyimpan catatan')
  } finally {
    saving.value = false
  }
}

const confirmUnmark = (item) => {
  if (confirm(`Hapus tanda telat bayar untuk "${item.nama_peserta}"?`)) {
    unmarkTelatBayar(item.id)
  }
}

const unmarkTelatBayar = async (id) => {
  try {
    await api.unmarkTelatBayar(id)
    alert('Tanda telat bayar berhasil dihapus')
    await fetchTelatBayarData()
  } catch (error) {
    console.error('Error unmarking:', error)
    alert('Gagal menghapus tanda')
  }
}
</script>

<style scoped>
.telat-bayar-page {
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
  min-width: 1000px;
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
  background-color: #fef2f2;
}

td {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.name-with-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge-telat-bayar {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 600;
  background-color: #fee2e2;
  color: #991b1b;
  text-transform: uppercase;
}

.catatan-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.375rem;
  border: none;
  border-radius: 0.375rem;
  background-color: #f3f4f6;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background-color: #e5e7eb;
}

.btn-edit {
  color: #2563eb;
}

.btn-edit:hover {
  background-color: #eff6ff;
}

.btn-danger {
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fee2e2;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 32rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: bold;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.input-disabled {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  color: #6b7280;
  font-size: 0.875rem;
}

.textarea-input {
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.textarea-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-save {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background-color: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background-color: #f9fafb;
}

.btn-save {
  background-color: #2563eb;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-save:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>