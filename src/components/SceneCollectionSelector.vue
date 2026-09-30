<script setup>
import { computed, ref, useId } from 'vue';
import { useI18n } from 'vue-i18n';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps({
    collections: {
        type: Array,
        required: true
    },
    localOnlyCollections: {
        type: Array,
        required: true
    },
    activeCollection: {
        type: String,
        default: ''
    },
    modelValue: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'deleteLocalCollection']);

const { t } = useI18n();
const selectId = useId();

const showDeleteDialog = ref(false);

const allCollections = computed(() => {
    const obsSet = new Set(props.collections);
    const localSet = new Set(props.localOnlyCollections);

    props.collections.forEach((name) => localSet.delete(name));

    return [
        ...props.collections,
        ...Array.from(localSet)
    ];
});

const isLocalOnly = computed(() => {
    return props.localOnlyCollections.includes(props.modelValue) &&
        !props.collections.includes(props.modelValue);
});

function isActive(name) {
    return name === props.activeCollection;
}

function displayLabel(name) {
    const parts = [];

    if (isActive(name)) {
        parts.push('★');
    }

    if (props.localOnlyCollections.includes(name) && !props.collections.includes(name)) {
        parts.push('⚠');
    }

    parts.push(name);

    return parts.join(' ');
}

function handleSelect(event) {
    emit('update:modelValue', event.target.value);
}

function requestDelete() {
    showDeleteDialog.value = true;
}

function cancelDelete() {
    showDeleteDialog.value = false;
}

function confirmDelete() {
    showDeleteDialog.value = false;
    emit('deleteLocalCollection', props.modelValue);
}
</script>

<template>
    <div class="scene-collection-selector">
        <label :for="selectId" class="selector-label">
            {{ t('sceneCollection.label') }}
        </label>

        <select
            :id="selectId"
            class="selector-control"
            :value="modelValue"
            @change="handleSelect"
        >
            <option
                v-for="name in allCollections"
                :key="name"
                :value="name"
                :title="isActive(name)
                    ? t('sceneCollection.tooltipActive')
                    : props.localOnlyCollections.includes(name) && !props.collections.includes(name)
                        ? t('sceneCollection.tooltipLocalOnly')
                        : ''"
            >
                {{ displayLabel(name) }}
            </option>
        </select>

        <span
            v-if="isActive(modelValue)"
            class="active-badge"
            :title="t('sceneCollection.tooltipActive')"
        >
            {{ t('sceneCollection.active') }}
        </span>

        <div v-if="isLocalOnly" class="local-only-banner">
            <span class="warning-icon">⚠</span>
            <span class="warning-text">{{ t('sceneCollection.localOnly') }}</span>
            <button
                type="button"
                class="delete-button"
                @click="requestDelete"
            >
                {{ t('sceneCollection.delete') }}
            </button>
        </div>

        <ConfirmDialog
            :show="showDeleteDialog"
            :title="t('sceneCollection.deleteTitle')"
            :message="t('sceneCollection.deleteMessage', { name: modelValue })"
            :confirm-text="t('sceneCollection.deleteConfirm')"
            :cancel-text="t('sceneCollection.deleteCancel')"
            confirm-class="danger"
            @confirm="confirmDelete"
            @cancel="cancelDelete"
        />
    </div>
</template>

<style scoped>
.scene-collection-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.selector-label {
    font-size: var(--font-size-body);
    color: var(--color-text-secondary);
    white-space: nowrap;
}

.selector-control {
    min-width: 140px;
    max-width: 220px;
    padding: 0.25rem 0.5rem;
    background: var(--color-background);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-small);
    font-size: var(--font-size-body);
}

.active-badge {
    padding: 0.15rem 0.4rem;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-small);
    font-size: 0.75rem;
    white-space: nowrap;
}

.local-only-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.35rem 0.5rem;
    background: rgba(251, 191, 36, 0.15);
    border: 1px solid rgba(251, 191, 36, 0.4);
    border-radius: var(--radius-small);
    font-size: 0.8rem;
}

.warning-icon {
    color: #fbbf24;
}

.warning-text {
    color: var(--color-text);
    flex: 1;
}

.delete-button {
    padding: 0.2rem 0.5rem;
    background: transparent;
    color: var(--color-error);
    border: 1px solid var(--color-error);
    border-radius: var(--radius-small);
    cursor: pointer;
    font-size: 0.8rem;
}

.delete-button:hover {
    background: var(--color-error);
    color: white;
}
</style>
