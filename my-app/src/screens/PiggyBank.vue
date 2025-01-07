<script setup>
import { ref, computed, onMounted } from 'vue';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Navbar from '../components/Navbar.vue';
import confetti from 'canvas-confetti';
import Countdown from '../components/Countdown.vue'

// State management
const person1 = ref({ name: 'Claire', goal: "-", saved: "-" });
const person2 = ref({ name: 'Dwight', goal: "-", saved: "-" });
const newAmount1 = ref('');
const newAmount2 = ref('');
const editing = ref(false);

// Firestore references
const claireDocRef = doc(db, 'piggybank', 'claire');
const dwightDocRef = doc(db, 'piggybank', 'dwight');

// Computed properties for progress
const progress1 = computed(() => {
  return Math.min(Math.round((person1.value.saved / person1.value.goal) * 100), 100);
});

const progress2 = computed(() => {
  return Math.min(Math.round((person2.value.saved / person2.value.goal) * 100), 100);
});

const remaining1 = computed(() => {
  return Math.max(person1.value.goal - person1.value.saved, 0);
});

const remaining2 = computed(() => {
  return Math.max(person2.value.goal - person2.value.saved, 0);
});

// Watch for 100% completion
const checkCompletion = (progress) => {
  if (progress === 100) {
    triggerConfetti();
  }
};

// Confetti animation
const triggerConfetti = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 200, ticks: 100, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }
    
    const particleCount = 50 + Math.random() * 50;
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: randomInRange(0.1, 0.3) }
    });
  }, 250);
};

// Load data from Firestore
onMounted(() => {
  // Listen to updates for Claire
  onSnapshot(claireDocRef, (docSnapshot) => {
  if (docSnapshot.exists()) {
    const data = docSnapshot.data();
    person1.value = { ...person1.value, saved: data.saved, goal: data.goal };
    console.log(person1.value)
  }
});


  // Listen to updates for Dwight
  onSnapshot(dwightDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      person2.value = { ...person2.value, saved: data.saved, goal: data.goal };
    }
  });
});

// Add amount to savings
const addAmount = async (person, amount, docRef) => {
  if (!amount || isNaN(amount)) return;

  // Convert the amount to a number
  const numAmount = parseFloat(amount);

  // Update the local person saved value
  person.saved += numAmount;

  try {
    // Update Firestore with the new saved value
    await updateDoc(docRef, { saved: person.saved });

    // Clear the input field after updating
    if (person === person1.value) {
      newAmount1.value = '';
      checkCompletion(progress1.value);
    } else {
      newAmount2.value = '';
      checkCompletion(progress2.value);
    }
  } catch (error) {
    console.error('Error updating savings: ', error);
  }
};


// Update goals
const updateGoals = async () => {
  try {
    await Promise.all([
      updateDoc(claireDocRef, { goal: person1.value.goal }),
      updateDoc(dwightDocRef, { goal: person2.value.goal }),
    ]);
    editing.value = false;
  } catch (error) {
    console.error('Error updating goals: ', error);
  }
};
</script>


<template>
  <div class="flex flex-row gap-4 min-h-screen bg-gray-50">
    <Navbar />
    
    <div class="flex-grow ml-16 w-full p-8 rounded">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-800 mb-4">🛩️ Our Travel Funds</h1>
          <p class="text-gray-600 mb-6">New York / L.A.</p>
          
          <button 
            @click="editing ? updateGoals() : editing = true"
            class="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-indigo-700 
            transform hover:scale-105 transition-all duration-200 font-semibold"
          >
            {{ editing ? 'Save Changes' : 'Edit Goals' }}
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <!-- Person 1 Card -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <div class="bg-gradient-to-r from-pink-500 to-pink-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <input 
                  v-if="editing"
                  v-model="person1.name"
                  class="text-2xl font-bold bg-white/90 p-2 rounded-lg text-pink-900 w-40"
                >
                <h2 v-else class="text-2xl font-bold text-white">{{ person1.name }}</h2>
                <div v-if="editing" class="flex items-center bg-white/90 p-2 rounded-lg">
                  <span class="mr-2 text-pink-900">$</span>
                  <input 
                    v-model="person1.goal"
                    type="number"
                    class="w-24 bg-transparent text-pink-900 font-bold"
                  >
                </div>
                <span v-else class="text-2xl font-bold text-white">${{ person1.goal }}</span>
              </div>
            </div>
            
            <div class="p-6">
              <!-- Progress Bar -->
              <div class="w-full bg-gray-200 rounded-full h-6 mb-6 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-pink-500 to-pink-600 h-full rounded-full transition-all duration-500 
                  shadow-inner flex items-center justify-center text-xs text-white font-bold"
                  :style="{ width: `${progress1}%` }"
                >
                  {{ progress1 }}%
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-pink-50 p-4 rounded-xl">
                  <p class="text-sm text-pink-600 mb-1">Saved</p>
                  <p class="text-2xl font-bold text-pink-900">${{ person1.saved }}</p>
                </div>
                <div class="bg-pink-50 p-4 rounded-xl">
                  <p class="text-sm text-pink-600 mb-1">Remaining</p>
                  <p class="text-2xl font-bold text-pink-900">${{ remaining1 }}</p>
                </div>
              </div>
              
              <!-- Add Amount Input -->
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    v-model="newAmount1"
                    type="number"
                    step="0.01"
                    placeholder="Add amount..."
                    class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-500 
                    focus:ring focus:ring-pink-200 transition-all duration-200"
                    @keyup.enter="addAmount(person1, newAmount1, claireDocRef)"
                  >
                </div>
                <button
                  @click="addAmount(person1, newAmount1, claireDocRef)"
                  class="bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 
                  transform hover:scale-105 transition-all duration-200 font-semibold shadow-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <!-- Person 2 Card -->
          <div class="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
            <div class="bg-gradient-to-r from-zinc-500 to-zinc-600 p-6">
              <div class="flex items-center justify-between mb-4">
                <input 
                  v-if="editing"
                  v-model="person2.name"
                  class="text-2xl font-bold bg-white/90 p-2 rounded-lg text-zinc-900 w-40"
                >
                <h2 v-else class="text-2xl font-bold text-white">{{ person2.name }}</h2>
                <div v-if="editing" class="flex items-center bg-white/90 p-2 rounded-lg">
                  <span class="mr-2 text-zinc-900">$</span>
                  <input 
                    v-model="person2.goal"
                    type="number"
                    class="w-24 bg-transparent text-zinc-900 font-bold"
                  >
                </div>
                <span v-else class="text-2xl font-bold text-white">${{ person2.goal }}</span>
              </div>
            </div>
            
            <div class="p-6">
              <!-- Progress Bar -->
              <div class="w-full bg-gray-200 rounded-full h-6 mb-6 overflow-hidden">
                <div 
                  class="bg-gradient-to-r from-zinc-500 to-zinc-600 h-full rounded-full transition-all duration-500 
                  shadow-inner flex items-center justify-center text-xs text-white font-bold"
                  :style="{ width: `${progress2}%` }"
                >
                  {{ progress2 }}%
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-zinc-50 p-4 rounded-xl">
                  <p class="text-sm text-zinc-600 mb-1">Saved</p>
                  <p class="text-2xl font-bold text-zinc-900">${{ person2.saved }}</p>
                </div>
                <div class="bg-zinc-50 p-4 rounded-xl">
                  <p class="text-sm text-zinc-600 mb-1">Remaining</p>
                  <p class="text-2xl font-bold text-zinc-900">${{ remaining2 }}</p>
                </div>
              </div>
              
              <!-- Add Amount Input -->
              <div class="flex gap-3">
                <div class="relative flex-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    v-model="newAmount2"
                    type="number"
                    step="0.01"
                    placeholder="Add amount..."
                    class="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-zinc-500 
                    focus:ring focus:ring-zinc-200 transition-all duration-200"
                    @keyup.enter="addAmount(person2, newAmount2, dwightDocRef)"
                  >
                </div>
                <button
                  @click="addAmount(person2, newAmount2, dwightDocRef)"
                  class="bg-zinc-600 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 
                  transform hover:scale-105 transition-all duration-200 font-semibold shadow-md"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Countdown />
    </div>
    
  </div>
</template>