<script setup>
// PERBAIKAN: Menambahkan 'onUnmounted' ke dalam import
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import DashboardHeader from "./components/DashboardHeader.vue";
import StatCards from "./components/StatCards.vue";
import AttendanceTable from "./components/AttendanceTable.vue";
import { generateSemesterData } from "./utils/dummyGenerator";

// Fallback jika env variable tidak ada
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const demoMode = ref(false);
const isLoading = ref(false);
const searchQuery = ref("");
const selectedCard = ref(null);
const isOnline = ref(true);

const apiData = ref([]);
const dummyData = ref([]);
let statusInterval = null; // Inisialisasi variable interval

// Check API status
async function checkAPIStatus() {
  try {
    const res = await fetch(`${API_URL}/`, { method: "HEAD" });
    isOnline.value = res.ok;
  } catch {
    isOnline.value = false;
  }
}

// Lifecycle Hooks
onMounted(() => {
  loadFromAPI();
  checkAPIStatus();
  // Simpan ID interval agar bisa dibersihkan nanti
  statusInterval = setInterval(checkAPIStatus, 5000);
});

// Cleanup saat komponen dihancurkan (pindah halaman dll)
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
      apiData.value = await res.json();
      isOnline.value = true;
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
  demoMode.value ? loadDummy() : loadFromAPI();
}

const filteredData = computed(() => {
  let data = sourceData.value;

  // Filter by search (Mencakup Name, Device ID, dan Device Name)
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    data = data.filter((item) => item.name?.toLowerCase().includes(query) || item.deviceId?.toLowerCase().includes(query) || item.device?.toLowerCase().includes(query));
  }

  // Filter by selected card
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

// Handle card selection
function handleCardSelect(card) {
  selectedCard.value = selectedCard.value === card ? null : card;
}

// Clear search
function clearSearch() {
  searchQuery.value = "";
}
</script>

<template>
  <div class="dashboard-wrapper">
    <DashboardHeader :connected="isOnline" />

    <div class="search-control-bar">
      <div class="search-box">
        <svg class="search-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Search students, device..." class="search-input" />
        <button v-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="Clear search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <button class="demo-btn" :class="{ active: demoMode }" :disabled="isLoading" @click="toggleDemoMode">
        <span v-if="demoMode">⚡ Demo Mode</span>
        <span v-else>💼 Live Mode</span>
      </button>
    </div>

    <StatCards :total="stats.total" :onTime="stats.onTime" :late="stats.late" :loading="isLoading" :selected="selectedCard" @select="handleCardSelect" />

    <AttendanceTable :items="filteredData" :loading="isLoading" :selectedCard="selectedCard" />
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  animation: fadeIn 0.6s ease-out;
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
  transition: all 0.3s ease;
  position: relative;
}

.search-box:focus-within {
  box-shadow: 0 15px 50px rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.search-icon {
  color: #64748b;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.search-box:focus-within .search-icon {
  color: #667eea;
  transform: scale(1.1);
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
}

.search-input::placeholder {
  color: #94a3b8;
}

.clear-btn {
  background: rgba(100, 116, 139, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: rotate(90deg);
}

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
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.demo-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.demo-btn:hover::before {
  left: 100%;
}

.demo-btn:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
}

.demo-btn:active:not(:disabled) {
  transform: translateY(-2px);
}

.demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.demo-btn.active {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 15px 40px rgba(245, 158, 11, 0.4);
  border-color: transparent;
}

.demo-btn.active:hover:not(:disabled) {
  box-shadow: 0 20px 50px rgba(245, 158, 11, 0.5);
}

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
