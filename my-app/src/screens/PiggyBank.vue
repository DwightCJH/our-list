<script setup>
import Navbar from '../components/Navbar.vue';
</script>

<template>
  <div class="flex flex-row gap-4">
    <!-- Side Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="flex-grow ml-16 w-full p-4 rounded bg-white">
      <!-- Your content goes here -->
    </div>
  </div>
</template>

<style scoped>
/* Add margin left to offset the navbar */
.ml-16 {
  margin-left: 4rem; /* Space for the fixed navbar */
}
</style>
