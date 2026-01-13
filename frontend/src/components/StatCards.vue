<script setup>
import { computed } from "vue";

const props = defineProps({
  total: { type: Number, default: 0 },
  onTime: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  selected: { type: String, default: null },
});

const emit = defineEmits(["select"]);

const percentage = computed(() => {
  if (props.total === 0) return { onTime: 0, late: 0 };
  return {
    onTime: Math.round((props.onTime / props.total) * 100),
    late: Math.round((props.late / props.total) * 100),
  };
});

const handleCardClick = (cardType) => {
  emit("select", cardType);
};
</script>

<template>
  <div class="stats-container">
    <!-- Total Presence Card -->
    <div class="stat-card total-card" :class="{ selected: selected === 'total', loading }" @click="handleCardClick('total')">
      <div class="card-icon purple">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">TOTAL PRESENCE</div>
        <div class="card-value">
          <span v-if="loading" class="loading-shimmer">---</span>
          <span v-else>{{ total }}</span>
        </div>
        <div class="card-subtitle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Active Students
        </div>
      </div>
      <div class="selection-indicator"></div>
    </div>

    <!-- On Time Card -->
    <div class="stat-card ontime-card" :class="{ selected: selected === 'ontime', loading }" @click="handleCardClick('ontime')">
      <div class="card-icon green">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">ON TIME</div>
        <div class="card-value">
          <span v-if="loading" class="loading-shimmer">---</span>
          <span v-else>{{ onTime }}</span>
        </div>
        <div class="card-subtitle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Perfect Attendance · {{ percentage.onTime }}%
        </div>
      </div>
      <div class="selection-indicator"></div>
    </div>

    <!-- Late Arrival Card -->
    <div class="stat-card late-card" :class="{ selected: selected === 'late', loading }" @click="handleCardClick('late')">
      <div class="card-icon orange">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div class="card-content">
        <div class="card-label">LATE ARRIVAL</div>
        <div class="card-value">
          <span v-if="loading" class="loading-shimmer">---</span>
          <span v-else>{{ late }}</span>
        </div>
        <div class="card-subtitle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          Needs Attention · {{ percentage.late }}%
        </div>
      </div>
      <div class="selection-indicator"></div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
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

@keyframes shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  opacity: 0.05;
  transition: all 0.5s ease;
  transform: translate(30%, -30%);
}

.stat-card:hover::before {
  transform: translate(20%, -20%) scale(1.2);
  opacity: 0.08;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.stat-card.selected {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.stat-card.selected .selection-indicator {
  opacity: 1;
  transform: scaleX(1);
}

.stat-card.loading {
  pointer-events: none;
}

.selection-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: currentColor;
  opacity: 0;
  transform: scaleX(0);
  transition: all 0.3s ease;
  border-radius: 0 0 22px 22px;
}

.total-card {
  color: #667eea;
  border-color: rgba(102, 126, 234, 0.2);
}

.total-card::before {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.total-card:hover,
.total-card.selected {
  border-color: rgba(102, 126, 234, 0.4);
  background: rgba(102, 126, 234, 0.02);
}

.ontime-card {
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.2);
}

.ontime-card::before {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.ontime-card:hover,
.ontime-card.selected {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.02);
}

.late-card {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}

.late-card::before {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.late-card:hover,
.late-card.selected {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.02);
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.card-icon::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.stat-card:hover .card-icon::after {
  left: 100%;
}

.stat-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.stat-card.selected .card-icon {
  animation: bounce 0.6s ease;
}

.card-icon.purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.card-icon.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #64748b;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.card-value {
  font-size: 3rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
  font-variant-numeric: tabular-nums;
}

.loading-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
  display: inline-block;
  color: #cbd5e1;
}

.stat-card:hover .card-value {
  transform: scale(1.05);
  color: #0f172a;
}

.card-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-subtitle svg {
  opacity: 0.5;
  flex-shrink: 0;
}

@media (max-width: 968px) {
  .stats-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem;
  }

  .card-icon {
    width: 56px;
    height: 56px;
  }

  .card-value {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 1.25rem;
    gap: 1rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
  }

  .card-value {
    font-size: 2rem;
  }

  .card-label {
    font-size: 0.7rem;
  }

  .card-subtitle {
    font-size: 0.75rem;
  }
}
</style>
