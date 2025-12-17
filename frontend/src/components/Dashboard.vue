<!-- frontend/src/components/Dashboard.vue - UPDATED -->
<template>
	<div class="dashboard">
		<!-- Sidebar Component -->
		<Sidebar 
			:isOpen="sidebarOpen" 
			:currentPage="currentPage"
			:reminderCount="reminderCount"
			@close="sidebarOpen = false"
			@navigate="handleNavigation"
		/>

		<!-- Header with Fade + Scale Animation -->
		<div class="header">
			<div class="header-content">
				<div class="logo-wrap">
					<img 
						src="https://image2url.com/images/1765176740412-f6d15c8a-0308-4b9a-a335-aa11bec98115.png" 
						alt="Logo" 
						class="dashboard-logo" 
						@click="sidebarOpen = true"
						style="cursor: pointer;"
					/>
					<h1>Dashboard Peserta Pelatihan</h1>
				</div>
				<div class="header-actions">
					<!-- Notification Bell -->
					<button 
						v-if="currentPage === 'dashboard' && reminderCount > 0" 
						@click="currentPage = 'reminder'"
						class="notification-btn"
						title="Lihat Reminder Sertifikat"
					>
						<Bell :size="20" />
						<span class="notification-badge">{{ reminderCount }}</span>
					</button>

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
			<!-- Show Reminder Page or Dashboard -->
			<ReminderPage 
				v-if="currentPage === 'reminder'"
				@back="currentPage = 'dashboard'"
			/>

			<div v-else>
				<!-- Notification Banner -->
				<div v-if="reminderCount > 0" class="notification-banner">
					<div class="banner-icon">
						<AlertTriangle :size="24" />
					</div>
					<div class="banner-content">
						<strong>Perhatian!</strong>
						<p>Ada {{ reminderCount }} sertifikat yang akan atau sudah expired. 
							<button @click="currentPage = 'reminder'" class="banner-link">Lihat Detail →</button>
						</p>
					</div>
					<button @click="dismissBanner = true" class="banner-close">
						<X :size="20" />
					</button>
				</div>

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
										<th>Tanggal Invoice</th>
										<th>Sertifikat dari KSO/LSP</th>
										<th>Sertifikat diterima oleh Kandel</th>
										<th>Sertifikat diterima peserta</th>
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
										<td>{{ item.tanggal_invoice }}</td>
										<td>{{ item.sertifikat_dari_kso }}</td>
										<td>{{ item.sertifikat_diterima_kandel }}</td>
										<td>{{ item.sertifikat_diterima_peserta }}</td>
									</tr>
								</tbody>
							</table>
						</div>
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

		<!-- Logout Modal -->
		<LogoutModal
			v-if="showLogoutModal"
			@confirm="confirmLogout"
			@cancel="cancelLogout"
		/>

	</div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { Search, Upload, LogOut, Filter, Trash2, FileSpreadsheet, Download, Bell, AlertTriangle, X } from 'lucide-vue-next'
import api from '../services/api'
import UploadModal from './UploadModal.vue'
import LogoutModal from './LogoutModal.vue'
import Sidebar from './Sidebar.vue'
import ReminderPage from './ReminderPage.vue'

const emit = defineEmits(['logout'])

const pesertaData = ref([])
const loading = ref(false)
const searchTerm = ref('')
const filterType = ref('all')
const showUploadModal = ref(false)
const showLogoutModal = ref(false)
const stats = ref({ total: 0, bnsp: 0, kemnaker: 0 })

// Sidebar & Navigation
const sidebarOpen = ref(false)
const currentPage = ref('dashboard')
const reminderCount = ref(0)
const dismissBanner = ref(false)

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
	fetchReminderCount()
})

watch([searchTerm, filterType], () => {
	if (selectedFileId.value) {
		fetchPeserta()
	}
	selectedIds.value = []
})

const handleNavigation = (page) => {
	currentPage.value = page
	sidebarOpen.value = false
}

const fetchReminderCount = async () => {
	try {
		const response = await api.getReminderCount()
		reminderCount.value = response.count || 0
	} catch (error) {
		console.error('Error fetching reminder count:', error)
	}
}

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
  showLogoutModal.value = true
}

const confirmLogout = () => {
  showLogoutModal.value = false
  emit('logout')
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

const handleUploadSuccess = () => {
	showUploadModal.value = false
	fetchArsipYears()
	fetchReminderCount()
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
		
		if (selectedFileId.value === file.id) {
			selectedFileId.value = null
			pesertaData.value = []
		}
		
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
/* ... (keep all previous styles) ... */

/* Notification Bell Button */
.notification-btn {
	position: relative;
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	animation: bellShake 2s ease-in-out infinite;
}

@keyframes bellShake {
	0%, 50%, 100% {
		transform: rotate(0deg);
	}
	10%, 30% {
		transform: rotate(-10deg);
	}
	20%, 40% {
		transform: rotate(10deg);
	}
}

.notification-btn:hover {
	transform: translateY(-3px) scale(1.05);
	box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
}

.notification-badge {
	position: absolute;
	top: -4px;
	right: -4px;
	background-color: #dc2626;
	color: white;
	font-size: 0.75rem;
	font-weight: bold;
	padding: 0.125rem 0.375rem;
	border-radius: 9999px;
	min-width: 20px;
	text-align: center;
	box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.1);
	}
}

/* Notification Banner */
.notification-banner {
	background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	border: 2px solid #f59e0b;
	border-radius: 0.75rem;
	padding: 1rem 1.5rem;
	margin-bottom: 1.5rem;
	display: flex;
	align-items: center;
	gap: 1rem;
	box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
	animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
	from {
		opacity: 0;
		transform: translateY(-20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.banner-icon {
	color: #f59e0b;
	flex-shrink: 0;
	animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-5px);
	}
}

.banner-content {
	flex: 1;
}

.banner-content strong {
	color: #92400e;
	font-size: 1rem;
	display: block;
	margin-bottom: 0.25rem;
}

.banner-content p {
	color: #78350f;
	font-size: 0.875rem;
	margin: 0;
}

.banner-link {
	background: none;
	border: none;
	color: #2563eb;
	font-weight: 600;
	cursor: pointer;
	text-decoration: underline;
	padding: 0;
	margin-left: 0.25rem;
}

.banner-link:hover {
	color: #1d4ed8;
}

.banner-close {
	background: none;
	border: none;
	cursor: pointer;
	color: #92400e;
	padding: 0.25rem;
	display: flex;
	align-items: center;
	border-radius: 0.375rem;
	transition: all 0.2s;
}

.banner-close:hover {
	background-color: rgba(146, 64, 14, 0.1);
}

/* Keep all other existing styles from the original Dashboard.vue */
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
	animation: fadeScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes fadeScale {
	0% {
		opacity: 0;
		transform: scale(0.9) translateY(-20px);
	}
	60% {
		transform: scale(1.02);
	}
	100% {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
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
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dashboard-logo:hover {
	transform: scale(1.1) rotate(5deg);
	filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
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

.upload-btn-header,
.logout-btn {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 0.5rem;
	border: none;
	cursor: pointer;
	font-size: 0.875rem;
	font-weight: 500;
	transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.upload-btn-header {
	background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
}

.upload-btn-header:hover {
	transform: translateY(-3px) scale(1.05);
	box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
}

.logout-btn {
	background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.logout-btn:hover {
	transform: translateY(-3px) scale(1.05);
	box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
}

.main-content {
	max-width: 80rem;
	margin: 0 auto;
	padding: 1.5rem;
}

/* All other existing styles... */
</style>