<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import confetti from 'canvas-confetti';

const tasks = ref([]); // Array to hold tasks
const newTask = ref(''); // Input field for new task
// Firestore references
const claireRef = doc(db, 'listItems', 'claire');

// Compute progress percentage
const progressPercentage = computed(() => {
  if (tasks.value.length === 0) return 0;
  const completedTasks = tasks.value.filter(task => task.checked).length;
  return Math.round((completedTasks / tasks.value.length) * 100);
});

// Watch for progress reaching 100% and trigger confetti
watch(progressPercentage, (newPercentage) => {
  if (newPercentage === 100) {
    triggerConfetti();
  }
});

// Confetti animation function
const triggerConfetti = () => {
  // Multiple bursts from the center
  const duration = 3000; // 3 seconds of confetti
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

// Fetch tasks from Firestore on component mount
onMounted(() => {
  onSnapshot(claireRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const taskData = docSnapshot.data().tasks || [];
      tasks.value = taskData.map((task) => ({
        name: task.name || task, // Backward compatibility
        checked: task.checked || false,
      }));
    }
  });
});

// Add a task to the list
const addTask = async () => {
  if (newTask.value.trim()) {
    const newTaskObj = { name: newTask.value.trim(), checked: false };
    try {
      tasks.value.push(newTaskObj); // Optimistic update in UI
      await updateDoc(claireRef, {
        tasks: [...tasks.value],
      });
      newTask.value = ''; // Clear input field
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  }
};

const toggleTask = async (task) => {
  task.checked = !task.checked; // Update local state immediately
  try {
    await updateDoc(claireRef, {
      tasks: [...tasks.value],
    });
  } catch (error) {
    console.error('Error updating task: ', error);
  }
};

// Remove a task from the list
const removeTask = async (taskToRemove) => {
  tasks.value = tasks.value.filter((task) => task.name !== taskToRemove.name); // Update local state
  try {
    await updateDoc(claireRef, {
      tasks: [...tasks.value],
    });
  } catch (error) {
    console.error('Error removing task: ', error);
  }
};
</script>

<template>
  <div class="todo-container bg-white text-gray-800 p-6 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-4 text-gray-700 text-center">Claire's To-Do List</h1>
    
    <div class="flex flex-col items-center m-5">
      <img 
        src="../assets/images/claire.jpg" 
        alt="Profile Picture" 
        class="w-32 h-32 rounded-full object-cover mb-4"
      />
      
      <!-- Animated Progress Bar -->
      <div class="w-full max-w-xs bg-gray-200 rounded-full h-4 mb-2">
        <div 
          class="bg-green-500 h-4 rounded-full transition-all duration-500 ease-in-out" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600">
        {{ progressPercentage }}% Tasks Completed
      </p>
    </div>

    <div class="flex gap-2 mb-4">
      <input
        @keyup.enter="addTask"
        v-model="newTask"
        type="text"
        placeholder="Add a new task..."
        class="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-gray-200"
      />
      <button
        @click="addTask"
        class="bg-gray-800 text-white px-5 py-3 rounded hover:bg-gray-700 transition"
      >
        Add
      </button>
    </div>
    
    <ul class="list-none">
      <li
        v-for="(task, index) in tasks"
        :key="index"
        class="bg-gray-100 text-gray-800 rounded p-3 flex items-center mb-3 shadow"
      >
        <input 
          type="checkbox" 
          :checked="task.checked" 
          @change="toggleTask(task)"
          class="mr-2 w-5 h-5" 
        />
        <span 
          :class="{ 'line-through text-gray-400': task.checked }" 
          class="flex-1"
        >
          {{ task.name }}
        </span>
        <button
          @click="removeTask(task)"
          class="text-red-500 hover:text-red-700 transition"
        >
          Remove
        </button>
      </li>
    </ul>
    <p v-if="tasks.length === 0" class="text-gray-400 italic">No tasks yet!</p>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 1000px;
  margin: 0 auto;
}
li span {
  margin-left: 0.5rem; /* Closer to the checkbox */
}
</style>