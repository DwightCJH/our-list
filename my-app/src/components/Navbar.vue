<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isOpen = ref(false);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <!-- Mobile hamburger menu -->
  <button 
    @click="toggleMenu" 
    class="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors duration-300"
  >
    <svg 
      class="w-6 h-6" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        v-if="!isOpen" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M4 6h16M4 12h16M4 18h16"
      />
      <path 
        v-else 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  </button>

  <!-- Navigation sidebar - Hidden on mobile unless menu is open -->
  <div 
    :class="[
      'fixed top-0 left-0 h-screen bg-gray-800 text-white shadow-lg transition-transform duration-300 ease-in-out',
      'md:translate-x-0 w-64 md:w-20',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
    style="z-index: 40;"
  >
    <div class="flex flex-col items-center py-8">
      <!-- Home Link -->
      <router-link 
        to="/" 
        @click="isOpen = false"
        class="w-full flex flex-col items-center hover:text-indigo-500 mb-12 text-center transition-colors duration-300 ease-in-out px-4"
      >
        <span class="text-2xl font-semibold">📝</span>
        <span class="text-sm mt-1 md:hidden">To-Do's</span>
        <span class="text-sm mt-1 hidden md:inline-block">To-Do's</span>
      </router-link>
      
      <!-- Piggy Bank Link -->
      <router-link 
        to="/piggybank" 
        @click="isOpen = false"
        class="w-full flex flex-col items-center hover:text-indigo-500 text-center transition-colors duration-300 ease-in-out px-4"
      >
        <span class="text-2xl font-semibold">🏦</span>
        <span class="text-sm mt-1 md:hidden">Piggy Bank</span>
        <span class="text-sm mt-1 hidden md:inline-block">Piggy Bank</span>
      </router-link>
    </div>
  </div>

  <!-- Overlay for mobile when menu is open -->
  <div 
    v-if="isOpen" 
    @click="isOpen = false"
    class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
  ></div>
</template>

<style scoped>
.router-link-active, 
.router-link-exact-active {
  @apply text-indigo-500;
}

/* Ensure content doesn't go under the navbar on desktop */
@screen md {
  :deep(main) {
    margin-left: theme('width.20');
  }
}
</style>