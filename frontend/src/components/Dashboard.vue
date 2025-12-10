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
					<button @click="showArsipModal = true" class="arsip-btn">
						<Archive :size="18" />
						Arsip
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

		<!-- Upload Modal -->
		<UploadModal
			v-if="showUploadModal"
			@close="showUploadModal = false"
			@success="handleUploadSuccess"
		/>

		<!-- Arsip Modal -->
		<div v-if="showArsipModal" class="modal-overlay" @click.self="showArsipModal = false">
			<div class="modal-content arsip-modal">
				<div class="modal-header">
					<h2>Arsip File Excel</h2>
					<button @click="showArsipModal = false" class="close-btn">
						<X :size="24" />
					</button>
				</div>
				<div class="modal-body">
					<div v-if="loadingArsip" class="loading-arsip">
						Memuat data arsip...
					</div>
					<div v-else-if="arsipYears.length === 0" class="no-arsip">
						Belum ada file arsip
					</div>
					<div v-else class="arsip-content">
						<!-- Year Tabs -->
						<div class="year-tabs">
							<button
								v-for="year in arsipYears"
								:key="year"
								@click="selectYear(year)"
								:class="['year-tab', { active: selectedYear === year }]"
							>
								{{ year }}
							</button>
						</div>

						<!-- Files List -->
						<div v-if="selectedYear" class="files-list">
							<div v-if="loadingFiles" class="loading-files">
								Memuat file...
							</div>
							<div v-else-if="arsipFiles.length === 0" class="no-files">
								Tidak ada file di tahun {{ selectedYear }}
							</div>
							<div v-else class="file-items">
								<div v-for="file in arsipFiles" :key="file.name" class="file-item">
									<div class="file-icon">
										<FileSpreadsheet :size="24" />
									</div>
									<div class="file-info">
										<div class="file-name">{{ file.name }}</div>
										<div class="file-meta">
											{{ formatFileSize(file.size) }} • 
											{{ formatDate(file.uploadedAt) }}
										</div>
									</div>
									<div class="file-actions">
										<button @click="downloadFile(file)" class="action-btn download-btn-icon" title="Download">
											<Download :size="18" />
										</button>
										<button @click="confirmDeleteFile(file)" class="action-btn delete-btn-icon" title="Hapus">
											<Trash2 :size="18" />
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

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
import { Search, Upload, LogOut, Filter, Trash2, Archive, X, FileSpreadsheet, Download } from 'lucide-vue-next'
import api from '../services/api'
import UploadModal from './UploadModal.vue'

const emit = defineEmits(['logout'])

const pesertaData = ref([])
const loading = ref(true)
const searchTerm = ref('')
const filterType = ref('all')
const showUploadModal = ref(false)
const stats = ref({ total: 0, bnsp: 0, kemnaker: 0 })

// Delete states
const selectedIds = ref([])
const showDeleteModal = ref(false)
const deleting = ref(false)

// Arsip states
const showArsipModal = ref(false)
const loadingArsip = ref(false)
const loadingFiles = ref(false)
const arsipYears = ref([])
const selectedYear = ref(null)
const arsipFiles = ref([])

// Computed
const isAllSelected = computed(() => {
	return pesertaData.value.length > 0 && selectedIds.value.length === pesertaData.value.length
})

onMounted(() => {
	fetchPeserta()
	fetchStats()
})

watch([searchTerm, filterType], () => {
	fetchPeserta()
	selectedIds.value = []
})

watch(showArsipModal, (newVal) => {
	if (newVal) {
		fetchArsipYears()
	}
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

// Arsip functions
const fetchArsipYears = async () => {
	try {
		loadingArsip.value = true
		const response = await api.getArsipYears()
		arsipYears.value = response.years
		
		if (arsipYears.value.length > 0) {
			selectYear(arsipYears.value[0])
		}
	} catch (error) {
		console.error('Error fetching arsip years:', error)
		alert('Gagal memuat data arsip')
	} finally {
		loadingArsip.value = false
	}
}

const selectYear = async (year) => {
	try {
		selectedYear.value = year
		loadingFiles.value = true
		const response = await api.getArsipFiles(year)
		arsipFiles.value = response.files
	} catch (error) {
		console.error('Error fetching files:', error)
		alert('Gagal memuat file arsip')
	} finally {
		loadingFiles.value = false
	}
}

const downloadFile = async (file) => {
	try {
		await api.downloadArsipFile(file.year, file.name)
	} catch (error) {
		console.error('Error downloading file:', error)
		alert('Gagal mendownload file')
	}
}

const confirmDeleteFile = (file) => {
	if (confirm(`Hapus file "${file.name}"?\n\nTindakan ini tidak dapat dibatalkan!`)) {
		deleteFile(file)
	}
}

const deleteFile = async (file) => {
	try {
		await api.deleteArsipFile(file.year, file.name)
		alert('File berhasil dihapus')
		
		// Refresh files list
		await selectYear(selectedYear.value)
		
		// Refresh years list if folder is empty
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
	display: block;
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

.arsip-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	background-color: #2563eb;
	color: white;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	transition: background-color 0.2s;
}

.arsip-btn:hover {
	background-color: #1d4ed8;
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

.arsip-modal {
	max-width: 48rem;
	max-height: 90vh;
	display: flex;
	flex-direction: column;
}

.modal-header {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
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
	transition: color 0.2s;
}

.close-btn:hover {
	color: #1f2937;
}

.modal-body {
	padding: 1.5rem;
	overflow-y: auto;
	flex: 1;
}

.loading-arsip,
.no-arsip {
	text-align: center;
	padding: 2rem;
	color: #6b7280;
}

.year-tabs {
	display: flex;
	gap: 0.5rem;
	margin-bottom: 1.5rem;
	flex-wrap: wrap;
}

.year-tab {
	padding: 0.5rem 1rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	background-color: white;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	color: #374151;
	transition: all 0.2s;
}

.year-tab:hover {
	background-color: #f9fafb;
}

.year-tab.active {
	background-color: #2563eb;
	color: white;
	border-color: #2563eb;
}

.loading-files,
.no-files {
	text-align: center;
	padding: 2rem;
	color: #6b7280;
	font-size: 0.875rem;
}

.file-items {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.file-item {
	display: flex;
	align-items: center;
	gap: 1rem;
	padding: 1rem;
	border: 1px solid #e5e7eb;
	border-radius: 0.5rem;
	transition: background-color 0.2s;
}

.file-item:hover {
	background-color: #f9fafb;
}

.file-icon {
	color: #16a34a;
	flex-shrink: 0;
}

.file-info {
	flex: 1;
}

.file-name {
	font-size: 0.875rem;
	font-weight: 500;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.file-meta {
	font-size: 0.75rem;
	color: #6b7280;
}

.file-actions {
	display: flex;
	gap: 0.5rem;
}

.action-btn {
	border: none;
	padding: 0.5rem;
	border-radius: 0.375rem;
	cursor: pointer;
	display: flex;
	align-items: center;
	transition: background-color 0.2s;
}

.download-btn-icon {
	background-color: #2563eb;
	color: white;
}

.download-btn-icon:hover {
	background-color: #1d4ed8;
}

.delete-btn-icon {
	background-color: #dc2626;
	color: white;
}

.delete-btn-icon:hover {
	background-color: #b91c1c;
}

/* Delete Modal */
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