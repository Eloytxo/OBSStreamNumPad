<script setup>
import AppHeader from './components/AppHeader.vue';
import ActionToast from './components/ActionToast.vue';
</script>


<template>
    <div class="app-layout">
        <AppHeader />
        <main class="app-content">
            <router-view />
        </main>
        <ActionToast />
    </div>
</template>

<style>
.app-content > * {
    height: 100%;
}
</style>