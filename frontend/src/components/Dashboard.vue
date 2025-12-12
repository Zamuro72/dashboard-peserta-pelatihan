<template>
	<div class="dashboard">
		<!-- Header -->
		<div class="header">
			<div class="header-content">
				<div class="logo-wrap">
					<img src="https://image2url.com/images/1765176740412-f6d15c8a-0308-4b9a-a335-aa11bec98115.png" alt="Logo" class="dashboard-logo" />
					<h1>Dashboard Peserta Pelatihan</h1>
				</div>
				<div class="header-actions">
					<button @click="showUploadModal = true" class="upload-btn-header">
						<Upload :size="18" />
						Upload
					</button>
					<button @click="handleLogout" class="logout-btn">
						<LogOut :size="18" />
						Logout
					</button>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="main-content">
			<!-- File Selection Area -->
			<div class="file-selection-card">
				<div class="selection-header">
					<h2>📁 Pilih File Data</h2>
					<p>Pilih tahun dan file untuk melihat data peserta</p>
				</div>

				<div v-if="loadingYears" class="loading-selection">
					Memuat data...
				</div>

				<div v-else-if="arsipYears.length === 0" class="no-files-yet">
					<FileSpreadsheet :size="48" />
					<p>Belum ada file data</p>
					<button @click="showUploadModal = true" class="upload-btn-large">
						<Upload :size="20" />
						Upload File Excel Pertama
					</button>
				</div>

				<div v-else class="file-selection-content">
					<!-- Year Selector -->
					<div class="year-selector">
						<label>Tahun:</label>
						<select v-model="selectedYear" @change="onYearChange" class="year-select">
							<option value="">-- Pilih Tahun --</option>
							<option v-for="year in arsipYears" :key="year" :value="year">
								{{ year }}
							</option>
						</select>
					</div>

					<!-- File List -->
					<div v-if="selectedYear" class="file-list-section">
						<div v-if="loadingFiles" class="loading-files-small">
							Memuat file...
						</div>
						<div v-else-if="arsipFiles.length === 0" class="no-files-small">
							Tidak ada file di tahun {{ selectedYear }}
						</div>
						<div v-else class="file-cards">
							<div 
								v-for="file in arsipFiles" 
								:key="file.id" 
								@click="selectFile(file)"
								:class="['file-card', { active: selectedFileId === file.id }]"
							>
								<div class="file-card-icon">
									<FileSpreadsheet :size="32" />
								</div>
								<div class="file-card-info">
									<div class="file-card-name">{{ file.name }}</div>
									<div class="file-card-meta">
										<span>{{ file.pesertaCount }} peserta</span>
										<span>{{ formatFileSize(file.size) }}</span>
									</div>
									<div class="file-card-date">{{ formatDate(file.uploadedAt) }}</div>
								</div>
								<div class="file-card-actions" @click.stop>
									<button @click="downloadFile(file)" class="btn-icon" title="Download">
										<Download :size="16" />
									</button>
									<button @click="confirmDeleteFile(file)" class="btn-icon btn-danger" title="Hapus">
										<Trash2 :size="16" />
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Data Display Area (hanya muncul kalau ada file dipilih) -->
			<div v-if="selectedFileId" class="data-section">
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
					</div>

					<!-- Results Info & Delete Button -->
					<div class="results-actions">
						<div class="results-info">
							Menampilkan {{ pesertaData.length }} peserta
							<span v-if="selectedIds.length > 0" class="selected-count">
								({{ selectedIds.length }} dipilih)
							</span>
						</div>
						
						<button 
							v-if="selectedIds.length > 0"
							@click="handleDeleteSelected"
							class="delete-btn"
						>
							<Trash2 :size="18" />
							Hapus ({{ selectedIds.length }})
						</button>
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
									<th class="checkbox-col">
										<input 
											type="checkbox" 
											:checked="isAllSelected"
											@change="toggleSelectAll"
											class="checkbox-input"
										/>
									</th>
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
								<tr v-for="item in pesertaData" :key="item.id" :class="{ 'row-selected': selectedIds.includes(item.id) }">
									<td class="checkbox-col">
										<input 
											type="checkbox" 
											:checked="selectedIds.includes(item.id)"
											@change="toggleSelect(item.id)"
											class="checkbox-input"
										/>
									</td>
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
		</div>

		<!-- Upload Modal -->
		<UploadModal
			v-if="showUploadModal"
			@close="showUploadModal = false"
			@success="handleUploadSuccess"
		/>

		<!-- Delete Confirmation Modal -->
		<div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
			<div class="modal-content delete-modal">
				<div class="modal-header">
					<h2>Konfirmasi Hapus</h2>
				</div>
				<div class="modal-body">
					<p>Apakah Anda yakin ingin menghapus <strong>{{ selectedIds.length }}</strong> peserta?</p>
					<p class="warning-text">⚠️ Tindakan ini tidak dapat dibatalkan!</p>
				</div>
				<div class="modal-footer">
					<button @click="showDeleteModal = false" class="btn-cancel">
						Batal
					</button>
					<button @click="confirmDelete" :disabled="deleting" class="btn-delete">
						{{ deleting ? 'Menghapus...' : 'Hapus' }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Search, Upload, LogOut, Filter, Trash2, FileSpreadsheet, Download } from 'lucide-vue-next'
import api from '../services/api'
import UploadModal from './UploadModal.vue'

const emit = defineEmits(['logout'])

const pesertaData = ref([])
const loading = ref(false)
const searchTerm = ref('')
const filterType = ref('all')
const showUploadModal = ref(false)
const stats = ref({ total: 0, bnsp: 0, kemnaker: 0 })

// File selection states
const loadingYears = ref(true)
const loadingFiles = ref(false)
const arsipYears = ref([])
const selectedYear = ref('')
const arsipFiles = ref([])
const selectedFileId = ref(null)

// Delete states
const selectedIds = ref([])
const showDeleteModal = ref(false)
const deleting = ref(false)

// Computed
const isAllSelected = computed(() => {
	return pesertaData.value.length > 0 && selectedIds.value.length === pesertaData.value.length
})

onMounted(() => {
	fetchArsipYears()
})

watch([searchTerm, filterType], () => {
	if (selectedFileId.value) {
		fetchPeserta()
	}
	selectedIds.value = []
})

const fetchArsipYears = async () => {
	try {
		loadingYears.value = true
		const response = await api.getArsipYears()
		arsipYears.value = response.years
	} catch (error) {
		console.error('Error fetching years:', error)
		alert('Gagal memuat data arsip')
	} finally {
		loadingYears.value = false
	}
}

const onYearChange = async () => {
	if (!selectedYear.value) {
		arsipFiles.value = []
		selectedFileId.value = null
		pesertaData.value = []
		return
	}

	try {
		loadingFiles.value = true
		selectedFileId.value = null
		pesertaData.value = []
		const response = await api.getArsipFiles(selectedYear.value)
		arsipFiles.value = response.files
	} catch (error) {
		console.error('Error fetching files:', error)
		alert('Gagal memuat file')
	} finally {
		loadingFiles.value = false
	}
}

const selectFile = (file) => {
	selectedFileId.value = file.id
	fetchPeserta()
	fetchStats()
}

const fetchPeserta = async () => {
	if (!selectedFileId.value) return

	try {
		loading.value = true
		const response = await api.getPeserta({
			arsip_id: selectedFileId.value,
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
	if (!selectedFileId.value) return

	try {
		const response = await api.getStats(selectedFileId.value)
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
	fetchArsipYears()
	// Reset selections
	selectedYear.value = ''
	selectedFileId.value = null
	arsipFiles.value = []
	pesertaData.value = []
}

// Delete functions
const toggleSelect = (id) => {
	const index = selectedIds.value.indexOf(id)
	if (index > -1) {
		selectedIds.value.splice(index, 1)
	} else {
		selectedIds.value.push(id)
	}
}

const toggleSelectAll = () => {
	if (isAllSelected.value) {
		selectedIds.value = []
	} else {
		selectedIds.value = pesertaData.value.map(item => item.id)
	}
}

const handleDeleteSelected = () => {
	if (selectedIds.value.length === 0) return
	showDeleteModal.value = true
}

const confirmDelete = async () => {
	try {
		deleting.value = true
		
		const deletePromises = selectedIds.value.map(id => api.deletePeserta(id))
		await Promise.all(deletePromises)
		
		alert(`Berhasil menghapus ${selectedIds.value.length} peserta`)
		selectedIds.value = []
		showDeleteModal.value = false
		
		await fetchPeserta()
		await fetchStats()
		
	} catch (error) {
		console.error('Error deleting peserta:', error)
		alert('Gagal menghapus beberapa peserta. Silakan coba lagi.')
	} finally {
		deleting.value = false
	}
}

// File actions
const downloadFile = async (file) => {
	try {
		await api.downloadArsipFile(file.year, file.id)
	} catch (error) {
		console.error('Error downloading file:', error)
		alert('Gagal mendownload file')
	}
}

const confirmDeleteFile = (file) => {
	if (confirm(`Hapus file "${file.name}"?\n\nSemua data peserta (${file.pesertaCount}) dari file ini akan ikut terhapus!\n\nTindakan ini tidak dapat dibatalkan!`)) {
		deleteFile(file)
	}
}

const deleteFile = async (file) => {
	try {
		await api.deleteArsipFile(file.year, file.id)
		alert('File dan data peserta berhasil dihapus')
		
		// Reset if deleted file was selected
		if (selectedFileId.value === file.id) {
			selectedFileId.value = null
			pesertaData.value = []
		}
		
		// Refresh
		await onYearChange()
		await fetchArsipYears()
	} catch (error) {
		console.error('Error deleting file:', error)
		alert('Gagal menghapus file')
	}
}

const formatFileSize = (bytes) => {
	if (bytes === 0) return '0 Bytes'
	const k = 1024
	const sizes = ['Bytes', 'KB', 'MB']
	const i = Math.floor(Math.log(bytes) / Math.log(k))
	return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
	return new Date(date).toLocaleString('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	})
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
	position: sticky;
	top: 0;
	z-index: 10;
}

.header-content {
	max-width: 80rem;
	margin: 0 auto;
	padding: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo-wrap {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.dashboard-logo {
	height: 40px;
	width: auto;
}

.header h1 {
	font-size: 1.5rem;
	font-weight: bold;
	color: #1f2937;
}

.header-actions {
	display: flex;
	gap: 0.75rem;
}

.upload-btn-header {
	display: flex;
	align-items: center;
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

.upload-btn-header:hover {
	background-color: #15803d;
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

/* File Selection Card */
.file-selection-card {
	background-color: white;
	border-radius: 0.5rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	padding: 1.5rem;
	margin-bottom: 1.5rem;
}

.selection-header {
	margin-bottom: 1.5rem;
}

.selection-header h2 {
	font-size: 1.25rem;
	font-weight: bold;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.selection-header p {
	color: #6b7280;
	font-size: 0.875rem;
}

.loading-selection {
	text-align: center;
	padding: 2rem;
	color: #6b7280;
}

.no-files-yet {
	text-align: center;
	padding: 3rem 1rem;
	color: #6b7280;
}

.no-files-yet svg {
	margin: 0 auto 1rem;
	color: #9ca3af;
}

.no-files-yet p {
	margin-bottom: 1.5rem;
	font-size: 1rem;
}

.upload-btn-large {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	background-color: #16a34a;
	color: white;
	padding: 0.75rem 1.5rem;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	font-size: 1rem;
	font-weight: 500;
	transition: background-color 0.2s;
}

.upload-btn-large:hover {
	background-color: #15803d;
}

.file-selection-content {
	display: flex;
	flex-direction: column;
	gap: 1.5rem;
}

.year-selector {
	display: flex;
	align-items: center;
	gap: 1rem;
}

.year-selector label {
	font-weight: 500;
	color: #374151;
}

.year-select {
	padding: 0.5rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	font-size: 0.875rem;
	min-width: 150px;
	cursor: pointer;
}

.loading-files-small,
.no-files-small {
	text-align: center;
	padding: 1rem;
	color: #6b7280;
	font-size: 0.875rem;
}

.file-cards {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 1rem;
}

.file-card {
	display: flex;
	align-items: flex-start;
	gap: 1rem;
	padding: 1rem;
	border: 2px solid #e5e7eb;
	border-radius: 0.5rem;
	cursor: pointer;
	transition: all 0.2s;
}

.file-card:hover {
	border-color: #2563eb;
	background-color: #f9fafb;
}

.file-card.active {
	border-color: #2563eb;
	background-color: #eff6ff;
}

.file-card-icon {
	color: #16a34a;
	flex-shrink: 0;
}

.file-card-info {
	flex: 1;
	min-width: 0;
}

.file-card-name {
	font-weight: 500;
	color: #1f2937;
	margin-bottom: 0.25rem;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.file-card-meta {
	display: flex;
	gap: 0.75rem;
	font-size: 0.75rem;
	color: #2563eb;
	font-weight: 500;
	margin-bottom: 0.25rem;
}

.file-card-date {
	font-size: 0.75rem;
	color: #6b7280;
}

.file-card-actions {
	display: flex;
	gap: 0.25rem;
	flex-shrink: 0;
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

.btn-danger {
	color: #dc2626;
}

.btn-danger:hover {
	background-color: #fee2e2;
}

/* Data Section */
.data-section {
	animation: fadeIn 0.3s;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
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

.results-actions {
	margin-top: 1rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.results-info {
	font-size: 0.875rem;
	color: #6b7280;
}

.selected-count {
	color: #2563eb;
	font-weight: 500;
}

.delete-btn {
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

.delete-btn:hover {
	background-color: #b91c1c;
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

.checkbox-col {
	width: 40px;
	text-align: center;
}

.checkbox-input {
	cursor: pointer;
	width: 16px;
	height: 16px;
}

tbody tr {
	border-bottom: 1px solid #e5e7eb;
	transition: background-color 0.2s;
}

tbody tr:hover {
	background-color: #f9fafb;
}

tbody tr.row-selected {
	background-color: #eff6ff;
}

td {
	padding: 0.75rem 1rem;
	font-size: 0.875rem;
}

.font-medium { font-weight: 500; }
.text-center { text-align: center; }

.badge { 
	display: inline-block; 
	padding: 0.25rem 0.5rem; 
	border-radius: 9999px; 
	font-size: 0.75rem; 
}
.badge-bnsp { background-color: #eef2ff; color: #2563eb; }
.badge-kemnaker { background-color: #ecfdf5; color: #16a34a; }
.badge-default { background-color: #f3f4f6; color: #6b7280; }

/* Modals */
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
	max-width: 28rem;
}

.delete-modal .modal-header {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.delete-modal .modal-header h2 {
	font-size: 1.25rem;
	font-weight: bold;
	color: #1f2937;
}

.delete-modal .modal-body {
	padding: 1.5rem;
}

.delete-modal .modal-body p {
	margin: 0.5rem 0;
	color: #374151;
}

.warning-text {
	color: #dc2626;
	font-weight: 500;
	margin-top: 1rem !important;
}

.modal-footer {
	display: flex;
	gap: 0.5rem;
	padding: 1.5rem;
	border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-delete {
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

.btn-delete {
	background-color: #dc2626;
	color: white;
}

.btn-delete:hover:not(:disabled) {
	background-color: #b91c1c;
}

.btn-delete:disabled {
	background-color: #9ca3af;
	cursor: not-allowed;
}
</style>