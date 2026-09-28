<script setup>
import { ref, computed, watch, nextTick, onUnmounted, useId } from 'vue'

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

const dialogRef = ref(null)
const confirmButton = ref(null)
const cancelButton = ref(null)
const startSentinel = ref(null)
const endSentinel = ref(null)
const titleId = useId()
const messageId = useId()

const previouslyFocused = ref(null)

const isDanger = computed(() =>
    props.confirmClass.split(/\s+/).includes('danger')
)

function handleEscape(event) {
    if (event.key === 'Escape') {
        emit('cancel')
    }
}

function getFocusableElements() {
    if (!dialogRef.value) return []

    const selector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

    return Array.from(dialogRef.value.querySelectorAll(selector)).filter(
        (el) =>
            !el.classList.contains('focus-trap-sentinel') &&
            el.tabIndex >= 0 &&
            !el.disabled &&
            el.offsetParent !== null
    )
}

function focusFirst() {
    const elements = getFocusableElements()
    elements[0]?.focus()
}

function focusLast() {
    const elements = getFocusableElements()
    elements[elements.length - 1]?.focus()
}

function focusInitial() {
    if (isDanger.value) {
        cancelButton.value?.focus()
    } else {
        confirmButton.value?.focus()
    }
}

function restoreFocus() {
    const element = previouslyFocused.value

    if (
        element &&
        document.contains(element) &&
        typeof element.focus === 'function' &&
        element.tabIndex >= 0
    ) {
        element.focus()
    } else {
        document.body.focus()
    }
}

watch(
    () => props.show,
    async (show) => {
        if (show) {
            previouslyFocused.value = document.activeElement
            document.addEventListener('keydown', handleEscape)
            await nextTick()
            focusInitial()
        } else {
            document.removeEventListener('keydown', handleEscape)
            await nextTick()
            restoreFocus()
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
                ref="dialogRef"
                class="dialog-content"
                role="dialog"
                aria-modal="true"
                :aria-labelledby="titleId"
                :aria-describedby="messageId"
            >
                <div
                    ref="startSentinel"
                    class="focus-trap-sentinel"
                    tabindex="0"
                    @focus="focusLast"
                ></div>

                <h3 :id="titleId" class="dialog-title">{{ title }}</h3>
                <p :id="messageId" class="dialog-message">{{ message }}</p>
                <div class="dialog-actions">
                    <button
                        ref="cancelButton"
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

                <div
                    ref="endSentinel"
                    class="focus-trap-sentinel"
                    tabindex="0"
                    @focus="focusFirst"
                ></div>
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
    position: relative;
    background: var(--color-surface);
    border-radius: var(--radius-medium);
    padding: var(--spacing-xl);
    max-width: 400px;
    width: 90%;
    box-shadow: var(--shadow-card);
    border: 1px solid var(--color-border);
}

.focus-trap-sentinel {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
    outline: none !important;
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
