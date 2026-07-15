<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCircleCheck, faCircleXmark } from "@fortawesome/free-solid-svg-icons";

const visible = ref(false);
const success = ref(true);
const message = ref("");
let timer = null;

function showActionToast(data) {
    if (timer) clearTimeout(timer);

    success.value = data.success;

    if (data.success) {
        message.value = data.actionLabel
            ? `${data.actionLabel}: ${data.target}`
            : "Acción ejecutada correctamente";
    } else {
        message.value = data.error || "Error desconocido";
    }

    visible.value = true;

    timer = setTimeout(() => {
        visible.value = false;
    }, 2000);
}

onMounted(() => {
    if (window.api?.keyboard?.onActionExecuted) {
        window.api.keyboard.onActionExecuted(showActionToast);
    }
});

onUnmounted(() => {
    if (timer) clearTimeout(timer);
});
</script>

<template>
    <Transition name="toast">
        <div v-if="visible" class="action-toast" :class="{ success, error: !success }">
            <FontAwesomeIcon :icon="success ? faCircleCheck : faCircleXmark" class="toast-icon" />
            <span class="toast-message">{{ message }}</span>
        </div>
    </Transition>
</template>

<style scoped>
.action-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999;
    pointer-events: none;
    backdrop-filter: blur(4px);
}

.action-toast.success {
    background: rgba(74, 222, 128, 0.85);
    color: #064e3b;
    border: 1px solid rgba(74, 222, 128, 0.9);
}

.action-toast.error {
    background: rgba(248, 113, 113, 0.85);
    color: #450a0a;
    border: 1px solid rgba(248, 113, 113, 0.9);
}

.toast-icon {
    font-size: 18px;
    flex-shrink: 0;
}

.toast-message {
    max-width: 320px;
}

.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
}
</style>
