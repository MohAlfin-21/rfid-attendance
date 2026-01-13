<script setup>
import { ref, onMounted, onUnmounted } from "vue";

defineProps({
  connected: { type: Boolean, default: true },
});

const currentTime = ref(new Date());
let timer = null;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <header class="header">
    <div class="brand-section">
      <div class="logo-icon">📡</div>
      <div class="brand-text">
        <h1>RFID Smart Attendance</h1>
        <p class="subtitle">Real-time School Monitoring System</p>
      </div>
    </div>

    <div class="status-section">
      <div class="status-badge" :class="{ offline: !connected }">
        <svg v-if="connected" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
          <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
        </svg>
        {{ connected ? "System Online" : "System Offline" }}
        <div class="status-dot"></div>
      </div>

      <div class="time-display">
        <div class="time">{{ currentTime.toLocaleTimeString("id-ID") }}</div>
        <div class="date">
          {{ currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }) }}
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 28px;
  padding: 2rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.6);
  animation: slideDown 0.6s ease-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
  position: relative;
  overflow: hidden;
}

.header::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);
  }
}

@keyframes ping {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.logo-icon {
  width: 75px;
  height: 75px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
  animation: pulse 3s ease-in-out infinite;
  flex-shrink: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.logo-icon:hover {
  transform: rotate(10deg) scale(1.1);
  box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);
}

.brand-text h1 {
  margin: 0;
  font-size: 2.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.subtitle {
  margin: 0.25rem 0 0 0;
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.7;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.75rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 100px;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-badge::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.status-badge:hover::before {
  left: 100%;
}

.status-badge.offline {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 10px 30px rgba(239, 68, 68, 0.4);
}

.status-badge svg {
  flex-shrink: 0;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  animation: ping 2s ease-in-out infinite;
  flex-shrink: 0;
}

.status-badge.offline .status-dot {
  animation: none;
  opacity: 0.6;
}

.time-display {
  text-align: right;
}

.time {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.date {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-top: 0.25rem;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .header {
    padding: 1.5rem;
  }

  .header::before {
    width: 200px;
    height: 200px;
  }

  .logo-icon {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
    border-radius: 18px;
  }

  .brand-text h1 {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .status-section {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }

  .status-badge {
    padding: 0.75rem 1.25rem;
    font-size: 0.85rem;
  }

  .time {
    font-size: 1.3rem;
  }

  .date {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .brand-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .brand-text h1 {
    font-size: 1.2rem;
  }

  .subtitle {
    font-size: 0.75rem;
  }
}
</style>
