<template>
    <div class="flex items-center justify-center p-4">
      <div class="w-full max-w-3xl rounded-xl overflow-hidden">
        <div class="p-8 flex justify-between">
          <div class="w-full">
            <h1 class="text-4xl font-extrabold text-gray-800 mb-8 text-center">Countdown to {{ formattedTargetDate }}</h1>
            
            <!-- Countdown Display -->
            <div v-if="viewMode === 'default'" class="grid grid-cols-4 gap-4 mb-8">
              <div v-for="(value, unit) in timeRemaining" :key="unit" 
                   class="bg-gray-700 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-white mb-1">{{ value }}</div>
                <div class="text-gray-400 text-sm">{{ unit }}</div>
              </div>
            </div>
            
            <!-- Weeks/Months Display -->
            <div v-else-if="viewMode === 'weeks'" class="grid grid-cols-1 gap-4 mb-8 text-center">
              <div class="bg-gray-700 rounded-lg p-4">
                <div class="text-3xl font-bold text-white mb-1">{{ weeksLeft }} Weeks Left</div>
              </div>
            </div>
            <div v-else-if="viewMode === 'months'" class="grid grid-cols-1 gap-4 mb-8 text-center">
              <div class="bg-gray-700 rounded-lg p-4">
                <div class="text-3xl font-bold text-white mb-1">{{ monthsLeft }} Months Left</div>
              </div>
            </div>
          </div>
          
          <!-- Simple Toggle Button on the Side -->
          <div class="flex flex-col items-center justify-center mx-5">
            <button 
              @click="changeViewMode('default')" 
              :class="{'bg-indigo-600': viewMode === 'default', 'bg-gray-600': viewMode !== 'default'}"
              class="px-4 py-2 text-white rounded-md mb-2 hover:bg-indigo-700 transition duration-300"
            >
              d
            </button>
            <button 
              @click="changeViewMode('weeks')" 
              :class="{'bg-indigo-600': viewMode === 'weeks', 'bg-gray-600': viewMode !== 'weeks'}"
              class="px-4 py-2 text-white rounded-md mb-2 hover:bg-indigo-700 transition duration-300"
            >
              w
            </button>
            <button 
              @click="changeViewMode('months')" 
              :class="{'bg-indigo-600': viewMode === 'months', 'bg-gray-600': viewMode !== 'months'}"
              class="px-4 py-2 text-white rounded-md hover:bg-indigo-700 transition duration-300"
            >
              m
            </button>
          </div>
        </div>
    
        <!-- Date Change Section -->
        <div class="text-center">
          <button 
            @click="isEditing = true" 
            v-if="!isEditing"
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Change Date
          </button>
          <div v-else class="flex items-center justify-center space-x-4">
            <input 
              v-model="newTargetDate" 
              type="date" 
              class="px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              @click="updateTargetDate" 
              class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
  import { db } from '../firebase'; // Ensure Firebase is properly configured
  import confetti from 'canvas-confetti';
  
  const targetDate = ref(null); // Will be fetched from Firestore
  const now = ref(new Date());
  const isEditing = ref(false);
  const newTargetDate = ref(null);
  const viewMode = ref('default'); // Default view is countdown
  
  const timeRemaining = computed(() => {
    if (!targetDate.value) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const difference = targetDate.value - now.value;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    
    return {
      days: days > 0 ? days : 0,
      hours: hours > 0 ? hours : 0,
      minutes: minutes > 0 ? minutes : 0,
      seconds: seconds > 0 ? seconds : 0
    };
  });
  
  const weeksLeft = computed(() => {
    if (!targetDate.value) return 0;
    const difference = targetDate.value - now.value;
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 7)); // weeks
  });
  
  const monthsLeft = computed(() => {
    if (!targetDate.value) return 0;
    const difference = targetDate.value - now.value;
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 30)); // Approximate month calculation
  });
  
  const fetchTargetDate = () => {
    const dateRef = doc(db, 'date', 'endDate');
    onSnapshot(dateRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        targetDate.value = new Date(data.time.toDate());
        newTargetDate.value = data.time.toDate().toISOString().split('T')[0]; // Set the initial input value
      } else {
        console.error("Document doesn't exist.");
      }
    });
  };
  
  const updateTargetDate = async () => {
    const dateRef = doc(db, 'date', 'endDate');
    try {
      const newDate = new Date(newTargetDate.value);
      await updateDoc(dateRef, { time: newDate });
      targetDate.value = newDate;
      isEditing.value = false; // Close editing mode
    console.log('Date updated successfully.');
  } catch (error) {
    console.error('Error updating target date:', error);
  }
};

// Automatically update the `now` reference every second
setInterval(() => {
  now.value = new Date();
}, 1000);

const changeViewMode = (mode) => {
  viewMode.value = mode;
};

// Fetch the target date when the component mounts
onMounted(fetchTargetDate);

const formattedTargetDate = computed(() => {
  if (!targetDate.value) return '...';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return targetDate.value.toLocaleDateString(undefined, options);
});
</script>
  