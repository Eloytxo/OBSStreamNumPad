<script setup>
import { ref, watch, nextTick, onUnmounted, useId } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    confirmText: {
        type: String,
        default: 'Confirm'
    },
    cancelText: {
        type: String,
        default: 'Cancel'
    },
    confirmClass: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirmButton = ref(null)
const titleId = useId()
const messageId = useId()

function handleEscape(event) {
    if (event.key === 'Escape') {
        emit('cancel')
    }
}

watch(
    () => props.show,
    async (show) => {
        if (show) {
            document.addEventListener('keydown', handleEscape)
            await nextTick()
            confirmButton.value?.focus()
        } else {
            document.removeEventListener('keydown', handleEscape)
        }
    },
    { immediate: false }
)

onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
    <Teleport to="body">
        <div
            v-if="show"
            class="dialog-overlay"
            role="presentation"
            @click.self="emit('cancel')"
        >
            <div
                class="dialog-content"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                :aria-describedby="messageId"
            >
                <h3 :id="titleId" class="dialog-title">{{ title }}</h3>
                <p :id="messageId" class="dialog-message">{{ message }}</p>
                <div class="dialog-actions">
                    <button
                        type="button"
                        class="btn-cancel"
                        @click="emit('cancel')"
                    >
                        {{ cancelText }}
                    </button>
                    <button
                        ref="confirmButton"
                        type="button"
                        :class="['btn-confirm', confirmClass]"
                        @click="emit('confirm')"
                    >
                        {{ confirmText }}
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.dialog-content {
    background: var(--color-surface);
    border-radius: var(--radius-medium);
    padding: var(--spacing-xl);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
}

.dialog-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-title);
    text-align: center;
}

.dialog-message {
    color: var(--color-text-secondary);
    text-align: center;
    margin-bottom: var(--spacing-lg);
    font-size: var(--font-size-body);
}

.dialog-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
}

.dialog-actions button {
    width: auto;
    padding: var(--spacing-sm) var(--spacing-lg);
    margin-top: 0;
    border-radius: var(--radius-small);
    font-size: var(--font-size-body);
    cursor: pointer;
    border: 1px solid var(--color-border);
    transition: all 0.2s;
}

.btn-cancel {
    background: var(--color-surface-hover);
    color: var(--color-text);
}

.btn-cancel:hover {
    background: var(--color-border);
}

.btn-confirm {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}

.btn-confirm:hover {
    background: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
}

.danger {
    background: var(--color-error);
    border-color: var(--color-error);
}

.danger:hover {
    background: #ff6b63;
    border-color: #ff6b63;
}
</style>
