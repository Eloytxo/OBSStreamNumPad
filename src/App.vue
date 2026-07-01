<script setup>
import AppHeader from './components/AppHeader.vue';
</script>


<template>
    <div class="app-layout">
        <AppHeader />
        <main class="app-content">
            <router-view />
        </main>
    </div>
</template>

<style>
.app-content > * {
    height: 100%;
}
</style>