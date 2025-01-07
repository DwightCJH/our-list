<script setup>
import LeftList from '../components/LeftList.vue';
import RightList from '../components/RightList.vue';
import Navbar from '../components/Navbar.vue';
</script>

<template>
  <div class="flex flex-row gap-4">
    <!-- Side Navbar -->
    <Navbar />

    <!-- Main Content -->
    <div class="flex-grow ml-16 w-full flex flex-col md:flex-row gap-4">
      <div class="w-full md:w-1/2 p-4 rounded bg-white">
        <LeftList />
      </div>
      <div class="w-full md:w-1/2 p-4 rounded bg-white">
        <RightList />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add margin left to offset the navbar */
.ml-16 {
  margin-left: 4rem; /* Space for the fixed navbar */
}
</style>
