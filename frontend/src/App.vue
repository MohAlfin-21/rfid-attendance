<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import DashboardHeader from "./components/DashboardHeader.vue";
import StatCards from "./components/StatCards.vue";
import AttendanceTable from "./components/AttendanceTable.vue";
import ToastNotification from "./components/ToastNotification.vue";
import { generateSemesterData } from "./utils/dummyGenerator";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const demoMode = ref(false);
const isLoading = ref(false);
const searchQuery = ref("");
const selectedCard = ref(null);
const isOnline = ref(true);
const toast = ref({ show: false, message: "", type: "info" });

const apiData = ref([]);
const dummyData = ref([]);
let statusInterval = null;

// Toast Helper
function showToast(message, type = "info") {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
}

// Check API status
async function checkAPIStatus() {
  try {
    const res = await fetch(`${API_URL}/`, { method: "HEAD" });
    const wasOffline = !isOnline.value;
    isOnline.value = res.ok;

    if (wasOffline && isOnline.value) {
      showToast("✅ Connection restored!", "success");
    } else if (!wasOffline && !isOnline.value) {
      showToast("⚠️ Connection lost", "warning");
    }
  } catch {
    const wasOnline = isOnline.value;
    isOnline.value = false;
    if (wasOnline) {
      showToast("⚠️ API server offline", "error");
    }
  }
}

onMounted(() => {
  loadFromAPI();
  checkAPIStatus();
  statusInterval = setInterval(checkAPIStatus, 5000);
});

onUnmounted(() => {
  if (statusInterval) clearInterval(statusInterval);
});

const sourceData = computed(() => {
  return demoMode.value ? dummyData.value : apiData.value;
});

async function loadFromAPI() {
  isLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/attendance?range=all`);
    if (res.ok) {
      const newData = await res.json();
      const isNewData = JSON.stringify(apiData.value) !== JSON.stringify(newData);
      apiData.value = newData;
      isOnline.value = true;

      if (isNewData && apiData.value.length > 0) {
        showToast(`📊 Loaded ${apiData.value.length} records`, "success");
      }
    } else {
      apiData.value = [];
      isOnline.value = false;
    }
  } catch (e) {
    console.warn("API error:", e);
    apiData.value = [];
    isOnline.value = false;
  } finally {
    isLoading.value = false;
  }
}

function loadDummy() {
  isLoading.value = true;
  setTimeout(() => {
    dummyData.value = generateSemesterData(50);
    isLoading.value = false;
    showToast(`⚡ Generated ${dummyData.value.length} demo records`, "info");
  }, 500);
}

async function toggleDemoMode() {
  try {
    const res = await fetch(`${API_URL}/api/demoMode`, { method: "PUT" });
    if (res.ok) {
      const data = await res.json();
      demoMode.value = data.demoMode;
    } else {
      demoMode.value = !demoMode.value;
    }
  } catch {
    demoMode.value = !demoMode.value;
  }

  if (demoMode.value) {
    loadDummy();
  } else {
    loadFromAPI();
  }
}

const filteredData = computed(() => {
  let data = sourceData.value;

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((item) => item.name?.toLowerCase().includes(query) || item.deviceId?.toLowerCase().includes(query) || item.device?.toLowerCase().includes(query));
  }

  if (selectedCard.value === "ontime") {
    data = data.filter((item) => item.status?.toLowerCase() === "on_time");
  } else if (selectedCard.value === "late") {
    data = data.filter((item) => item.status?.toLowerCase() === "late");
  }

  return data;
});

const stats = computed(() => {
  const data = sourceData.value;
  return {
    total: data.length,
    late: data.filter((i) => i.status?.toLowerCase() === "late").length,
    onTime: data.filter((i) => i.status?.toLowerCase() === "on_time").length,
  };
});

function handleCardSelect(card) {
  selectedCard.value = selectedCard.value === card ? null : card;

  if (selectedCard.value) {
    const labels = { total: "All Records", ontime: "On Time", late: "Late Arrivals" };
    showToast(`🔍 Filtering: ${labels[card]}`, "info");
  }
}

function clearSearch() {
  searchQuery.value = "";
  showToast("🔍 Search cleared", "info");
}

// Watch for search changes
watch(searchQuery, (newVal) => {
  if (newVal.trim() && filteredData.value.length === 0) {
    showToast("😕 No results found", "warning");
  }
});
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Toast Notification -->
    <ToastNotification :show="toast.show" :message="toast.message" :type="toast.type" />

    <DashboardHeader :connected="isOnline" />

    <div class="search-control-bar">
      <div class="search-box" :class="{ 'has-value': searchQuery }">
        <svg class="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Search students, device..." class="search-input" />
        <transition name="fade">
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="Clear search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </transition>
      </div>

      <button class="demo-btn" :class="{ active: demoMode }" :disabled="isLoading" @click="toggleDemoMode">
        <span class="btn-icon">{{ demoMode ? "⚡" : "💼" }}</span>
        <span class="btn-text">{{ demoMode ? "Demo Mode" : "Live Mode" }}</span>
        <span v-if="isLoading" class="btn-loader"></span>
      </button>
    </div>

    <transition name="cards" mode="out-in">
      <StatCards :key="selectedCard" :total="stats.total" :onTime="stats.onTime" :late="stats.late" :loading="isLoading" :selected="selectedCard" @select="handleCardSelect" />
    </transition>

    <transition name="fade" mode="out-in">
      <AttendanceTable :key="filteredData.length" :items="filteredData" :loading="isLoading" :selectedCard="selectedCard" />
    </transition>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  animation: fadeIn 0.6s ease-out;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.cards-enter-active {
  transition: all 0.4s ease-out;
}

.cards-leave-active {
  transition: all 0.4s ease-in;
}

.cards-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.cards-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Search Control Bar */
.search-control-bar {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.search-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 0.5rem 1.5rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.search-box::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.6s ease;
}

.search-box:focus-within::before {
  left: 100%;
}

.search-box:focus-within {
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.search-box.has-value {
  border-color: rgba(102, 126, 234, 0.3);
  background: rgba(102, 126, 234, 0.02);
}

.search-icon {
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: #667eea;
  transform: scale(1.1) rotate(90deg);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  width: 100%;
  padding: 0.75rem 0;
  font-family: inherit;
  position: relative;
  z-index: 1;
}

.search-input::placeholder {
  color: #94a3b8;
  transition: all 0.3s ease;
}

.search-input:focus::placeholder {
  opacity: 0.5;
  transform: translateX(5px);
}

.clear-btn {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.3s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: rotate(90deg) scale(1.1);
}

.clear-btn:active {
  transform: rotate(90deg) scale(0.95);
}

/* Demo Button */
.demo-btn {
  padding: 1rem 2rem;
  border-radius: 20px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.95);
  color: #64748b;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  font-family: inherit;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.demo-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s ease, height 0.6s ease;
}

.demo-btn:hover::before {
  width: 300px;
  height: 300px;
}

.demo-btn:hover:not(:disabled) {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.demo-btn:active:not(:disabled) {
  transform: translateY(-2px) scale(0.98);
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.btn-text {
  position: relative;
  z-index: 1;
}

.btn-loader {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: relative;
  z-index: 1;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.demo-btn:hover .btn-icon {
  transform: scale(1.2) rotate(15deg);
}

.demo-btn.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 15px 40px rgba(245, 158, 11, 0.4);
  border-color: transparent;
  animation: glow 2s ease-in-out infinite;
}

.demo-btn.active:hover:not(:disabled) {
  box-shadow: 0 20px 50px rgba(245, 158, 11, 0.5);
}

.demo-btn.active .btn-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 15px 40px rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 15px 40px rgba(245, 158, 11, 0.6);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-control-bar {
    grid-template-columns: 1fr;
  }

  .search-box {
    padding: 0.5rem 1.25rem;
  }

  .search-input {
    font-size: 0.9rem;
  }

  .demo-btn {
    width: 100%;
    justify-content: center;
    padding: 0.85rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .search-box {
    padding: 0.5rem 1rem;
  }

  .search-input {
    font-size: 0.85rem;
    padding: 0.6rem 0;
  }

  .demo-btn {
    font-size: 0.9rem;
  }
}
</style>
