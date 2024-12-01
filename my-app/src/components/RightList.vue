<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'; // Modular Firestore imports
import { db } from '../firebase'; 

const tasks = ref([]); // Array to hold tasks
const newTask = ref(''); // Input field for new task
// Firestore references
const dwightRef = doc(db, 'listItems', 'dwight');

// Fetch tasks from Firestore on component mount
onMounted(() => {
  onSnapshot(dwightRef, (docSnapshot) => {
    tasks.value = docSnapshot.exists() ? docSnapshot.data().tasks : [];
  });
});

// Add a task to the list
const addTask = async () => {
  if (newTask.value.trim()) {
    try {
      await updateDoc(dwightRef, {
        tasks: arrayUnion(newTask.value.trim()),
      });
      newTask.value = ''; // Clear input field
    } catch (error) {
      console.error('Error adding task: ', error);
    }
  }
};

// Remove a task from the list
const removeTask = async (taskToRemove) => {
  try {
    await updateDoc(dwightRef, {
      tasks: arrayRemove(taskToRemove),
    });
  } catch (error) {
    console.error('Error removing task: ', error);
  }
};
</script>



<template>
  <div class="todo-container bg-white text-gray-800 p-6 rounded-lg shadow-lg">
    <h1 class="text-2xl font-bold mb-4 text-gray-700 text-center">Dwight's To-Do List</h1>
    <div class="flex justify-center items-center m-5">
    <img 
      src="../assets/images/me.png" 
      alt="Profile Picture" 
      class="w-32 h-32 rounded-full object-cover"
    />
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
        class="bg-gray-100 text-gray-800 rounded p-3 flex justify-between items-center mb-3 shadow"
      >
        <span>{{ task }}</span>
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
</style>
