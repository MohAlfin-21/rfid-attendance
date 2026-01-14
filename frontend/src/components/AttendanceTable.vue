<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  selectedCard: { type: String, default: null },
});

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);
const hoveredRow = ref(null);

// Reset to page 1 when filters change
watch(
  () => [props.items.length, props.selectedCard],
  () => {
    currentPage.value = 1;
  }
);

// Computed pagination
const totalPages = computed(() => Math.ceil(props.items.length / itemsPerPage.value));

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return props.items.slice(start, end);
});

const paginationRange = computed(() => {
  const range = [];
  const showPages = 7;

  if (totalPages.value <= showPages) {
    for (let i = 1; i <= totalPages.value; i++) {
      range.push(i);
    }
  } else {
    range.push(1);

    let start = Math.max(2, currentPage.value - 1);
    let end = Math.min(totalPages.value - 1, currentPage.value + 1);

    if (currentPage.value <= 3) {
      end = 4;
    }

    if (currentPage.value >= totalPages.value - 2) {
      start = totalPages.value - 3;
    }

    if (start > 2) {
      range.push("...");
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (end < totalPages.value - 1) {
      range.push("...");
    }

    range.push(totalPages.value);
  }

  return range;
});

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const getStatusBadge = (status) => {
  return status?.toLowerCase() === "on_time" ? "success" : "warning";
};

const getFilterLabel = (card) => {
  if (card === "total") return "All";
  if (card === "ontime") return "On Time";
  if (card === "late") return "Late";
  return "";
};

// Generate random color for avatar based on name
const getAvatarColor = (name) => {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  ];
  const index = name?.charCodeAt(0) % colors.length || 0;
  return colors[index];
};
</script>

<template>
  <div class="table-container">
    <!-- Animated Background Elements -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>

    <!-- HEADER -->
    <div class="table-header">
      <h2>
        <div class="title-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
        Recent Activity
        <transition name="badge-pop">
          <span v-if="selectedCard" class="filter-badge" :class="selectedCard">
            {{ getFilterLabel(selectedCard) }}
          </span>
        </transition>
      </h2>

      <div class="table-info">
        <div class="total-records">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="records-count">{{ items.length }}</span>
          <span class="records-text">{{ items.length === 1 ? "record" : "records" }}</span>
        </div>
        <select v-model="itemsPerPage" class="items-per-page">
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
          <option :value="100">100 per page</option>
        </select>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">Loading attendance data...</p>
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>
      <h3 class="empty-title">No records found</h3>
      <p class="empty-description">Try adjusting your filters or search query</p>
    </div>

    <!-- DATA TABLE -->
    <template v-else>
      <div class="table-scroll">
        <transition-group name="list" tag="div">
          <div v-for="(item, i) in paginatedItems" :key="item.id" class="table-row" :class="{ hovered: hoveredRow === item.id }" :style="{ animationDelay: `${i * 0.03}s` }" @mouseenter="hoveredRow = item.id" @mouseleave="hoveredRow = null">
            <!-- Wave effect on hover -->
            <div class="row-wave"></div>

            <div class="student-info">
              <div class="avatar" :style="{ background: getAvatarColor(item.name) }">
                <span class="avatar-text">{{ item.name?.charAt(0) || "?" }}</span>
                <div class="avatar-ring"></div>
              </div>
              <div class="student-details">
                <div class="student-name">{{ item.name }}</div>
                <div class="student-meta">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  Student ID: {{ item.id }}
                </div>
              </div>
            </div>

            <div class="time-info">
              <div class="time-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <span class="time-text">{{ item.timestamp?.slice(11, 19) || item.time || "00:00:00" }}</span>
            </div>

            <div class="status-wrapper">
              <span class="status-badge" :class="getStatusBadge(item.status)">
                <span class="status-icon">
                  <svg v-if="item.status?.toLowerCase() === 'on_time'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </span>
                {{ item.status?.toLowerCase() === "on_time" ? "ON TIME" : "LATE" }}
                <span class="status-pulse"></span>
              </span>
            </div>

            <div class="device-wrapper">
              <span class="device-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ item.deviceId || item.device || "GATE-01" }}
              </span>
            </div>
          </div>
        </transition-group>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          Showing <strong>{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> - <strong>{{ Math.min(currentPage * itemsPerPage, items.length) }}</strong> of
          <strong>{{ items.length }}</strong>
        </div>

        <div class="pagination">
          <button class="pagination-btn prev-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span>Previous</span>
          </button>

          <div class="pagination-numbers">
            <button
              v-for="page in paginationRange"
              :key="page"
              class="page-number"
              :class="{
                active: page === currentPage,
                ellipsis: page === '...',
              }"
              :disabled="page === '...'"
              @click="page !== '...' && goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button class="pagination-btn next-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            <span>Next</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.6);
  animation: fadeIn 0.6s ease-out 0.4s backwards;
  position: relative;
  overflow: hidden;
}

/* Background Decorations */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: float 8s ease-in-out infinite;
}

.bg-decoration-1 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
  top: -100px;
  left: -100px;
}

.bg-decoration-2 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
  bottom: -80px;
  right: -80px;
  animation-delay: -4s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

/* Header */
.table-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.table-header h2 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.title-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  animation: pulse 3s ease-in-out infinite;
}

.filter-badge {
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.filter-badge.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.filter-badge.ontime {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.filter-badge.late {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.badge-pop-enter-active {
  animation: badgePop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.badge-pop-leave-active {
  animation: badgePop 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes badgePop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.table-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-records {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.6rem 1.25rem;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.total-records:hover {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-2px);
}

.records-count {
  color: #667eea;
  font-weight: 800;
  font-size: 1.1rem;
}

.items-per-page {
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  background: rgba(248, 250, 252, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.items-per-page:hover {
  border-color: rgba(102, 126, 234, 0.4);
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.items-per-page:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  color: #64748b;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 2rem;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
  border-top-color: #667eea;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.3s;
  border-top-color: #10b981;
}

.spinner-ring:nth-child(3) {
  animation-delay: -0.15s;
  border-top-color: #f59e0b;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: 1rem;
}

.loading-dots {
  display: flex;
  gap: 0.5rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: dotBounce 1.4s ease-in-out infinite;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dotBounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 2rem;
  animation: float 3s ease-in-out infinite;
}

.empty-illustration svg {
  color: #cbd5e1;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.05));
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #475569;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.95rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Table Rows */
.table-scroll {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.list-enter-active {
  transition: all 0.4s ease-out;
}

.list-leave-active {
  transition: all 0.3s ease-in;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.table-row {
  background: rgba(248, 250, 252, 0.6);
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1.5rem;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: slideIn 0.4s ease-out backwards;
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
}

.row-wave {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  transition: width 0.4s ease;
}

.table-row:hover .row-wave {
  width: 100%;
}

.table-row:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(12px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

/* Student Info */
.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.avatar-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.avatar-ring {
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 2px solid rgba(255, 255, 255, 0.5);
  opacity: 0;
  transition: all 0.3s ease;
}

.table-row:hover .avatar {
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.table-row:hover .avatar-text {
  transform: scale(1.1);
}

.table-row:hover .avatar-ring {
  opacity: 1;
  inset: -6px;
}

.student-details {
  min-width: 0;
}

.student-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.table-row:hover .student-name {
  color: #667eea;
}

.student-meta {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

/* Time Info */
.time-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Monaco", "Courier New", monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  background: rgba(100, 116, 139, 0.08);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.table-row:hover .time-info {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.time-icon {
  display: flex;
  align-items: center;
}

/* Status Badge */
.status-wrapper {
  display: flex;
  align-items: center;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  white-space: nowrap;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-icon {
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.table-row:hover .status-icon {
  transform: scale(1.2) rotate(360deg);
}

.status-pulse {
  position: absolute;
  right: 0.75rem;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
}

.status-badge.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
}

.status-badge.success:hover {
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.status-badge.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
}

.status-badge.warning:hover {
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
  transform: translateY(-2px);
}

/* Device Badge */
.device-wrapper {
  display: flex;
  align-items: center;
}

.device-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.table-row:hover .device-badge {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
  border-color: rgba(6, 182, 212, 0.2);
  transform: translateY(-2px);
}

/* Pagination */
.pagination-container {
  border-top: 2px solid rgba(100, 116, 139, 0.1);
  padding-top: 1.5rem;
  margin-top: 0.5rem;
}

.pagination-info {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(100, 116, 139, 0.05);
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 50%;
  transform: translateX(-50%);
}
.pagination-info strong {
  color: #667eea;
  font-weight: 800;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  background: rgba(248, 250, 252, 0.8);
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}
.pagination-btn:hover:not(:disabled) {
  background: white;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}
.pagination-btn:active:not(:disabled) {
  transform: translateY(0);
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-numbers {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.page-number {
  min-width: 42px;
  height: 42px;
  padding: 0 0.5rem;
  border-radius: 12px;
  border: 2px solid transparent;
  background: rgba(248, 250, 252, 0.8);
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}
.page-number::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.page-number:hover:not(:disabled):not(.ellipsis) {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  color: #667eea;
  transform: scale(1.1);
}
.page-number.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: scale(1.05);
  position: relative;
}
.page-number.active::after {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  border: 2px solid rgba(102, 126, 234, 0.3);
  animation: ping 2s ease-in-out infinite;
}
.page-number.ellipsis {
  cursor: default;
  background: transparent;
  border: none;
  font-weight: 900;
  letter-spacing: 2px;
  pointer-events: none;
}
/* Responsive */
@media (max-width: 968px) {
  .table-container {
    padding: 1.5rem;
  }
  .table-row {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem 1.25rem;
  }
  .time-info,
  .status-wrapper,
  .device-wrapper {
    justify-self: start;
  }
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .table-info {
    width: 100%;
    justify-content: space-between;
  }
  .pagination {
    gap: 0.25rem;
  }
  .pagination-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  .page-number {
    min-width: 38px;
    height: 38px;
    font-size: 0.85rem;
  }
}
@media (max-width: 480px) {
  .table-container {
    padding: 1rem;
  }
  .table-header h2 {
    font-size: 1.5rem;
  }
  .avatar {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  .student-name {
    font-size: 0.9rem;
  }
  .time-info,
  .status-badge,
  .device-badge {
    font-size: 0.75rem;
  }
}
</style>
