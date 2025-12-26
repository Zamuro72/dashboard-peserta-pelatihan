<template>
	<div class="marketing-dashboard">
		<!-- Sidebar Component -->
		<MarketingSidebar 
			:isOpen="sidebarOpen" 
			:currentPage="currentPage"
			@close="sidebarOpen = false"
			@navigate="handleNavigation"
		/>

		<!-- Header -->
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
					<h1>Dashboard Marketing</h1>
				</div>
				<div class="header-actions">
					<button @click="handleLogout" class="logout-btn">
						<LogOut :size="18" />
						Logout
					</button>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="main-content">
			<!-- Welcome Section -->
			<div class="welcome-card">
				<div class="welcome-header">
					<h2>👋 Selamat Datang di Dashboard Marketing</h2>
					<p>Kelola data marketing dan aktivitas promosi Anda</p>
				</div>
			</div>

			<!-- Quick Stats Grid -->
			<div class="stats-grid">
				<div class="stat-card stat-primary">
					<div class="stat-icon">
						<Users :size="32" />
					</div>
					<div class="stat-content">
						<div class="stat-label">Total Leads</div>
						<div class="stat-value">-</div>
						<div class="stat-trend">Data akan segera tersedia</div>
					</div>
				</div>

				<div class="stat-card stat-success">
					<div class="stat-icon">
						<TrendingUp :size="32" />
					</div>
					<div class="stat-content">
						<div class="stat-label">Konversi</div>
						<div class="stat-value">-</div>
						<div class="stat-trend">Data akan segera tersedia</div>
					</div>
				</div>

				<div class="stat-card stat-warning">
					<div class="stat-icon">
						<Target :size="32" />
					</div>
					<div class="stat-content">
						<div class="stat-label">Target Bulanan</div>
						<div class="stat-value">-</div>
						<div class="stat-trend">Data akan segera tersedia</div>
					</div>
				</div>

				<div class="stat-card stat-info">
					<div class="stat-icon">
						<BarChart3 :size="32" />
					</div>
					<div class="stat-content">
						<div class="stat-label">Campaign Aktif</div>
						<div class="stat-value">-</div>
						<div class="stat-trend">Data akan segera tersedia</div>
					</div>
				</div>
			</div>

			<!-- Content Sections -->
			<div class="content-grid">
				<!-- Chart Section -->
				<div class="content-card large-card">
					<div class="card-header">
						<h3>📊 Grafik Performa Marketing</h3>
						<p>Visualisasi data marketing dalam grafik</p>
					</div>
					<div class="empty-state">
						<BarChart3 :size="64" class="empty-icon" />
						<p class="empty-title">Grafik Belum Tersedia</p>
						<p class="empty-text">Data grafik akan ditampilkan setelah format data tersedia</p>
					</div>
				</div>

				<!-- Activity Feed -->
				<div class="content-card">
					<div class="card-header">
						<h3>📋 Aktivitas Terbaru</h3>
						<p>Log aktivitas marketing</p>
					</div>
					<div class="empty-state">
						<Activity :size="64" class="empty-icon" />
						<p class="empty-title">Belum Ada Aktivitas</p>
						<p class="empty-text">Aktivitas akan muncul di sini</p>
					</div>
				</div>
			</div>

			<!-- Data Table Section -->
			<div class="table-section">
				<div class="section-header">
					<div>
						<h2>📂 Data Marketing</h2>
						<p>Kelola dan lihat data marketing Anda</p>
					</div>
				</div>

				<div class="table-card">
					<div class="empty-state">
						<FileSpreadsheet :size="64" class="empty-icon" />
						<p class="empty-title">Tabel Data Belum Tersedia</p>
						<p class="empty-text">Tabel data akan ditampilkan setelah format data tersedia</p>
					</div>
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
import { ref } from 'vue'
import { LogOut, Users, TrendingUp, Target, BarChart3, Activity, FileSpreadsheet } from 'lucide-vue-next'
import LogoutModal from './LogoutModal.vue'
import MarketingSidebar from './MarketingSidebar.vue'

const emit = defineEmits(['logout'])

const sidebarOpen = ref(false)
const currentPage = ref('dashboard')
const showLogoutModal = ref(false)

const handleNavigation = (page) => {
	currentPage.value = page
	sidebarOpen.value = false
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
</script>

<style scoped>
.marketing-dashboard {
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
	transition: all 0.3s;
}

.dashboard-logo:hover {
	transform: scale(1.1);
}

.header h1 {
	font-size: 1.5rem;
	font-weight: bold;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.header-actions {
	display: flex;
	gap: 0.75rem;
}

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
	background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
	transition: all 0.3s;
}

.logout-btn:hover {
	transform: translateY(-2px);
	box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
}

.main-content {
	max-width: 80rem;
	margin: 0 auto;
	padding: 1.5rem;
}

.welcome-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 1rem;
	padding: 2rem;
	margin-bottom: 1.5rem;
	box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.welcome-header h2 {
	color: white;
	font-size: 1.75rem;
	font-weight: bold;
	margin-bottom: 0.5rem;
}

.welcome-header p {
	color: rgba(255, 255, 255, 0.9);
	font-size: 1rem;
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
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	gap: 1rem;
	transition: all 0.3s;
}

.stat-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
	width: 64px;
	height: 64px;
	border-radius: 0.75rem;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.stat-primary .stat-icon {
	background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
	color: #2563eb;
}

.stat-success .stat-icon {
	background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
	color: #16a34a;
}

.stat-warning .stat-icon {
	background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	color: #f59e0b;
}

.stat-info .stat-icon {
	background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
	color: #0ea5e9;
}

.stat-content {
	flex: 1;
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
	margin-bottom: 0.25rem;
}

.stat-trend {
	font-size: 0.75rem;
	color: #9ca3af;
}

.content-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.content-card {
	background-color: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.large-card {
	grid-column: 1 / -1;
}

.card-header {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
}

.card-header h3 {
	font-size: 1.125rem;
	font-weight: bold;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.card-header p {
	font-size: 0.875rem;
	color: #6b7280;
}

.empty-state {
	padding: 4rem 2rem;
	text-align: center;
}

.empty-icon {
	margin: 0 auto 1rem;
	color: #d1d5db;
}

.empty-title {
	font-size: 1.125rem;
	font-weight: 600;
	color: #374151;
	margin-bottom: 0.5rem;
}

.empty-text {
	font-size: 0.875rem;
	color: #6b7280;
}

.table-section {
	background-color: white;
	border-radius: 0.75rem;
	box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.section-header {
	padding: 1.5rem;
	border-bottom: 1px solid #e5e7eb;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.section-header h2 {
	font-size: 1.25rem;
	font-weight: bold;
	color: #1f2937;
	margin-bottom: 0.25rem;
}

.section-header p {
	font-size: 0.875rem;
	color: #6b7280;
}

.table-card {
	min-height: 400px;
}

@media (max-width: 768px) {
	.stats-grid {
		grid-template-columns: 1fr;
	}
	
	.content-grid {
		grid-template-columns: 1fr;
	}
	
	.large-card {
		grid-column: 1;
	}
}
</style>