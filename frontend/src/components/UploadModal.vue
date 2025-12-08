<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Upload File Excel</h2>
        <button @click="emit('close')" class="close-btn">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label>Pilih file Excel (.xlsx, .xls)</label>
          <input
            type="file"
            @change="handleFileChange"
            accept=".xlsx,.xls"
            ref="fileInput"
            class="file-input"
          />
        </div>

        <div v-if="selectedFile" class="file-info">
          <FileSpreadsheet :size="20" />
          <span>{{ selectedFile.name }}</span>
          <span class="file-size">({{ formatFileSize(selectedFile.size) }})</span>
        </div>

        <div class="info-box">
          <div class="info-header">
            <FileSpreadsheet :size="20" />
            <strong>Catatan:</strong>
          </div>
          <ul>
            <li>Format file harus sesuai dengan template</li>
            <li>Data akan ditambahkan ke database</li>
            <li>Pastikan struktur kolom sesuai</li>
            <li>Maksimal ukuran file: 5MB</li>
          </ul>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div v-if="uploadResult" class="success-message">
          <p><strong>Upload berhasil!</strong></p>
          <p>Total: {{ uploadResult.total }}</p>
          <p>Berhasil: {{ uploadResult.success }}</p>
          <p v-if="uploadResult.failed > 0">Gagal: {{ uploadResult.failed }}</p>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="emit('close')" class="btn-cancel">
          Batal
        </button>
        <button
          @click="handleUpload"
          :disabled="!selectedFile || loading"
          class="btn-upload"
        >
          {{ loading ? 'Uploading...' : 'Upload' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { X, FileSpreadsheet } from 'lucide-vue-next'
import api from '../services/api'

const emit = defineEmits(['close', 'success'])

const selectedFile = ref(null)
const loading = ref(false)
const error = ref('')
const uploadResult = ref(null)
const fileInput = ref(null)

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type
    const validTypes = ['.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    
    if (!validTypes.includes(fileExt) && !validTypes.includes(file.type)) {
      error.value = 'Hanya file Excel (.xlsx, .xls) yang diperbolehkan'
      selectedFile.value = null
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Ukuran file maksimal 5MB'
      selectedFile.value = null
      return
    }

    selectedFile.value = file
    error.value = ''
    uploadResult.value = null
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  error.value = ''
  loading.value = true
  uploadResult.value = null

  try {
    const response = await api.uploadExcel(selectedFile.value)
    uploadResult.value = response.summary

    // Auto close after 2 seconds on success
    setTimeout(() => {
      emit('success')
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.error || 'Gagal mengupload file'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
  max-height: 90vh;
  overflow-y: auto;
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

.file-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #374151;
}

.file-size {
  color: #6b7280;
  font-size: 0.75rem;
}

.info-box {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e40af;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-box ul {
  list-style: disc;
  list-style-position: inside;
  color: #1e40af;
  font-size: 0.875rem;
  margin: 0;
  padding: 0;
}

.info-box li {
  margin: 0.25rem 0;
}

.error-message {
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.success-message {
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  color: #065f46;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.success-message p {
  margin: 0.25rem 0;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-upload {
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

.btn-upload {
  background-color: #2563eb;
  color: white;
}

.btn-upload:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-upload:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
</style>