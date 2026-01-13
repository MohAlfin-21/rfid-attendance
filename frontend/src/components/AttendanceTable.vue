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
</script>

<template>
  <div class="table-container">
    <!-- HEADER -->
    <div class="table-header">
      <h2>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        Recent Activity
        <span v-if="selectedCard" class="filter-badge" :class="selectedCard">
          {{ getFilterLabel(selectedCard) }}
        </span>
      </h2>

      <div class="table-info">
        <span class="total-records"> {{ items.length }} {{ items.length === 1 ? "record" : "records" }} </span>
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
      <div class="spinner"></div>
      <p>Loading data...</p>
    </div>

    <!-- EMPTY STATE -->
    <div v-else-if="items.length === 0" class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>No attendance records found</p>
      <small>Try adjusting your filters or search query</small>
    </div>

    <!-- DATA TABLE + PAGINATION -->
    <template v-else>
      <!-- TABLE DATA -->
      <div class="table-scroll">
        <div v-for="(item, i) in paginatedItems" :key="item.id" class="table-row" :style="{ animationDelay: `${i * 0.03}s` }">
          <div class="student-info">
            <div class="avatar">{{ item.name?.charAt(0) || "?" }}</div>
            <div class="student-details">
              <div class="student-name">{{ item.name }}</div>
              <div class="student-meta">Student ID</div>
            </div>
          </div>

          <div class="time-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ item.timestamp?.slice(11, 19) || item.time || "00:00:00" }}
          </div>

          <span class="status-badge" :class="getStatusBadge(item.status)">
            {{ item.status?.toLowerCase() === "on_time" ? "✓ ON TIME" : "⚠ LATE" }}
          </span>

          <span class="device-badge"> 📍 {{ item.deviceId || item.device || "GATE-01" }} </span>
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, items.length) }} of {{ items.length }}</div>

        <div class="pagination">
          <button class="pagination-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Previous
          </button>

          <div class="pagination-numbers">
            <button v-for="page in paginationRange" :key="page" class="page-number" :class="{ active: page === currentPage, ellipsis: page === '...' }" :disabled="page === '...'" @click="page !== '...' && goToPage(page)">
              {{ page }}
            </button>
          </div>

          <button class="pagination-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            Next
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

.table-container::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

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

.table-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.total-records {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  padding: 0.5rem 1rem;
  background: rgba(100, 116, 139, 0.1);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.items-per-page {
  padding: 0.6rem 1rem;
  border-radius: 10px;
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
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-badge {
  font-size: 0.85rem;
  padding: 0.4rem 1rem;
  border-radius: 100px;
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: fadeIn 0.3s ease;
}

.filter-badge.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.filter-badge.ontime {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.filter-badge.late {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.table-scroll {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 2rem;
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

.table-row::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
  transition: width 0.3s ease;
}

.table-row:hover::before {
  width: 100%;
}

.table-row:hover {
  background: rgba(102, 126, 234, 0.08);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.student-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.25rem;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.table-row:hover .avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
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
}

.student-meta {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.time-info {
  font-family: "Monaco", "Courier New", monospace;
  font-size: 0.95rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.status-badge {
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  white-space: nowrap;
  transition: all 0.3s ease;
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

.device-badge {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.table-row:hover .device-badge {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-2px);
}

/* PAGINATION */
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
  padding: 0.75rem;
  background: rgba(100, 116, 139, 0.05);
  border-radius: 10px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 2px solid rgba(100, 116, 139, 0.2);
  background: rgba(248, 250, 252, 0.8);
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
}

.page-number.ellipsis {
  cursor: default;
  background: transparent;
  border: none;
  font-weight: 900;
  letter-spacing: 2px;
  pointer-events: none;
}

.page-number.ellipsis:hover {
  transform: none;
}

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
  .status-badge,
  .device-badge {
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
