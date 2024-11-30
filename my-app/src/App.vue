<script setup>
import LeftList from './components/LeftList.vue';
import RightList from './components/RightList.vue';
</script>

<template>
  <div class="flex flex-col md:flex-row justify-center gap-4 p-4">
    <!-- Left List -->
    <div class="w-full md:w-1/2 p-4 rounded shadow bg-white">
      <LeftList />
    </div>
    <!-- Right List -->
    <div class="w-full md:w-1/2 p-4 rounded shadow bg-white">
      <RightList />
    </div>
  </div>
</template>

<style scoped>
</style>
