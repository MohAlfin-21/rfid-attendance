<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: "" },
  type: { type: String, default: "info" }, // info, success, warning, error
});

const isVisible = ref(props.show);

watch(
  () => props.show,
  (newVal) => {
    isVisible.value = newVal;
  }
);

const getIcon = () => {
  switch (props.type) {
    case "success":
      return "✓";
    case "warning":
      return "⚠";
    case "error":
      return "✕";
    default:
      return "ℹ";
  }
};
</script>

<template>
  <transition name="toast">
    <div v-if="isVisible" class="toast-container" :class="`toast-${type}`">
      <div class="toast-content">
        <div class="toast-icon">{{ getIcon() }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      <div class="toast-progress"></div>
    </div>
  </transition>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  min-width: 300px;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.8);
  z-index: 9999;
  overflow: hidden;
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.toast-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  flex-shrink: 0;
  animation: iconPop 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s backwards;
}

.toast-message {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
}

.toast-progress {
  height: 4px;
  background: currentColor;
  animation: progress 3s linear;
  transform-origin: left;
}

/* Toast Types */
.toast-info {
  color: #667eea;
}

.toast-info .toast-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.toast-success {
  color: #10b981;
}

.toast-success .toast-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
}

.toast-warning {
  color: #f59e0b;
}

.toast-warning .toast-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.toast-error {
  color: #ef4444;
}

.toast-error .toast-icon {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
}

/* Animations */
@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes iconPop {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

/* Transition */
.toast-enter-active {
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

/* Responsive */
@media (max-width: 768px) {
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
    max-width: none;
  }
}
</style>
