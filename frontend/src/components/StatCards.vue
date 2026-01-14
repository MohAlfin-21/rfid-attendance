<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  total: { type: Number, default: 0 },
  onTime: { type: Number, default: 0 },
  late: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  selected: { type: String, default: null },
});

const emit = defineEmits(["select"]);

const hoveredCard = ref(null);

const percentage = computed(() => {
  if (props.total === 0) return { onTime: 0, late: 0 };
  return {
    onTime: Math.round((props.onTime / props.total) * 100),
    late: Math.round((props.late / props.total) * 100),
  };
});

const cards = computed(() => [
  {
    id: "total",
    icon: "👥",
    title: "TOTAL PRESENCE",
    value: props.total,
    subtitle: "Active Students",
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    percent: null,
  },
  {
    id: "ontime",
    icon: "✓",
    title: "ON TIME",
    value: props.onTime,
    subtitle: "Perfect Attendance",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    percent: percentage.value.onTime,
  },
  {
    id: "late",
    icon: "⚠",
    title: "LATE ARRIVAL",
    value: props.late,
    subtitle: "Needs Attention",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    percent: percentage.value.late,
  },
]);

const handleCardClick = (cardId) => {
  emit("select", cardId);
};
</script>

<template>
  <div class="stats-container">
    <div
      v-for="(card, index) in cards"
      :key="card.id"
      class="stat-card"
      :class="{
        selected: selected === card.id,
        loading,
        hovered: hoveredCard === card.id,
      }"
      :style="{
        '--card-color': card.color,
        '--card-gradient': card.gradient,
        animationDelay: `${index * 0.1}s`,
      }"
      @click="handleCardClick(card.id)"
      @mouseenter="hoveredCard = card.id"
      @mouseleave="hoveredCard = null"
    >
      <!-- Animated Background -->
      <div class="card-bg"></div>

      <!-- Ripple Effect -->
      <div class="ripple"></div>

      <!-- Content -->
      <div class="card-header">
        <div class="card-icon">
          <span class="icon-emoji">{{ card.icon }}</span>
          <div class="icon-glow"></div>
        </div>

        <div v-if="selected === card.id" class="selected-indicator">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <div class="card-content">
        <div class="card-label">{{ card.title }}</div>

        <div class="card-value-wrapper">
          <div class="card-value">
            <span v-if="loading" class="loading-shimmer">
              <span class="shimmer-bar"></span>
              <span class="shimmer-bar"></span>
              <span class="shimmer-bar"></span>
            </span>
            <span v-else class="value-number">{{ card.value }}</span>
          </div>

          <div v-if="card.percent !== null" class="card-percent">{{ card.percent }}%</div>
        </div>

        <div class="card-subtitle">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
            <polyline points="17 6 23 6 23 12"></polyline>
          </svg>
          {{ card.subtitle }}
        </div>

        <!-- Progress Bar -->
        <div v-if="card.percent !== null" class="progress-bar">
          <div class="progress-fill" :style="{ width: `${card.percent}%` }"></div>
        </div>
      </div>

      <!-- Sparkles on hover -->
      <div class="sparkles">
        <div v-for="i in 5" :key="i" class="sparkle" :style="{ '--i': i }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.stat-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  animation: cardSlideUp 0.6s ease-out backwards;
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--card-color) 10 0%, transparent 70%);
  transition: all 0.6s ease;
  opacity: 0;
}

.stat-card:hover::before {
  opacity: 1;
  transform: scale(1.2);
}

/* Animated Background */
.card-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--card-gradient);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.stat-card.selected .card-bg {
  opacity: 0.1;
}

/* Ripple Effect */
.ripple {
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--card-color);
  opacity: 0.3;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.stat-card:active .ripple {
  animation: rippleEffect 0.6s ease-out;
}

@keyframes rippleEffect {
  to {
    width: 400px;
    height: 400px;
    opacity: 0;
  }
}

.stat-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border-color: var(--card-color) 30;
}

.stat-card.selected {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 20px 60px var(--card-color) 40;
  border-color: var(--card-color);
  background: rgba(255, 255, 255, 1);
}

.stat-card.loading {
  pointer-events: none;
  opacity: 0.7;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: var(--card-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 8px 24px var(--card-color) 30;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stat-card:hover .card-icon {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 12px 32px var(--card-color) 40;
}

.stat-card.selected .card-icon {
  animation: iconBounce 0.6s ease;
}

@keyframes iconBounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.icon-emoji {
  font-size: 1.75rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.stat-card:hover .icon-emoji {
  transform: scale(1.1);
}

.icon-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .icon-glow {
  opacity: 1;
  animation: glowPulse 1.5s ease-in-out infinite;
}

@keyframes glowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.8;
  }
}

.selected-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--card-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  animation: indicatorPop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px var(--card-color) 40;
}

@keyframes indicatorPop {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* Card Content */
.card-content {
  position: relative;
  z-index: 1;
}

.card-label {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #64748b;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.stat-card:hover .card-label {
  color: var(--card-color);
  transform: translateX(4px);
}

.card-value-wrapper {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.card-value {
  font-size: 3rem;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  transition: all 0.3s ease;
  font-variant-numeric: tabular-nums;
}

.stat-card:hover .card-value {
  transform: scale(1.05);
  color: var(--card-color);
}

.stat-card.selected .card-value {
  color: var(--card-color);
}

.value-number {
  display: inline-block;
  animation: numberCount 0.6s ease-out;
}

@keyframes numberCount {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-shimmer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.shimmer-bar {
  width: 40px;
  height: 40px;
  background: linear-gradient(90deg, #e2e8f0 25%, #cbd5e1 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.card-percent {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--card-color);
  opacity: 0.7;
}

.card-subtitle {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover .card-subtitle {
  color: #475569;
}

.card-subtitle svg {
  opacity: 0.5;
  transition: all 0.3s ease;
}

.stat-card:hover .card-subtitle svg {
  opacity: 1;
  transform: translateY(-2px);
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 100px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--card-gradient);
  border-radius: 100px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Sparkles */
.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover .sparkles {
  opacity: 1;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--card-color);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--card-color);
  animation: sparkleFloat 2s ease-in-out infinite;
  animation-delay: calc(var(--i) * 0.2s);
}

.sparkle:nth-child(1) {
  top: 20%;
  left: 20%;
}
.sparkle:nth-child(2) {
  top: 40%;
  right: 15%;
}
.sparkle:nth-child(3) {
  bottom: 30%;
  left: 30%;
}
.sparkle:nth-child(4) {
  top: 60%;
  right: 25%;
}
.sparkle:nth-child(5) {
  bottom: 20%;
  right: 40%;
}

@keyframes sparkleFloat {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0;
  }
  50% {
    transform: translateY(-20px) scale(1.5);
    opacity: 1;
  }
}

/* Responsive */
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

  .icon-emoji {
    font-size: 1.5rem;
  }

  .card-value {
    font-size: 2.5rem;
  }

  .card-percent {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 1.25rem;
  }

  .card-icon {
    width: 48px;
    height: 48px;
  }

  .icon-emoji {
    font-size: 1.25rem;
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
