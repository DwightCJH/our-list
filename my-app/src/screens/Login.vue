<template>
  <div>
    <div class="profile-selection">
      <button
        @click="selectProfile('1@a.com')"
        :class="{ selected: selectedProfile === '1@a.com' }"
        class="profile-btn"
      >
        <img
          src="../assets/images/claire.jpg"
          alt="User 1 Profile"
          class="profile-pic"
        />
        <span>Claire</span>
      </button>
      <button
        @click="selectProfile('2@a.com')"
        :class="{ selected: selectedProfile === '2@a.com' }"
        class="profile-btn"
      >
        <img
          src="../assets/images/me.png"
          alt="User 2 Profile"
          class="profile-pic"
        />
        <span>Dwight</span>
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div>
        <input
          type="password"
          v-model="password"
          placeholder="Enter your password"
          required
        />
        <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
      </div>
      <button type="submit" class="btn-login">Login</button>
    </form>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const router = useRouter();
const auth = getAuth();

const email = ref('');
const password = ref('');
const passwordError = ref('');
const selectedProfile = ref('');

const selectProfile = (selectedEmail) => {
  email.value = selectedEmail;
  selectedProfile.value = selectedEmail; 
};


const handleSubmit = async () => {
  try {
    passwordError.value = '';
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/');
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      passwordError.value = 'Invalid password or account does not exist';
    } else {
      passwordError.value = error.message;
    }
  }
};
</script>
<style scoped>
.profile-selection {
  margin-top: 300px;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.profile-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 1rem;
  cursor: pointer;
  background: none;
  border: none;
  transition: transform 0.3s ease;
}

.profile-pic {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 2rem;
  border: 4px solid transparent;
  transition: border-color 0.3s ease, transform 0.3s ease;
}

.profile-pic:hover {
  transform: scale(1.1);
}

.profile-btn.selected .profile-pic {
  border-color: #138607; 
  transform: scale(1.1);
}

.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-login {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  background-color: #4caf50;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.error-message {
  color: red;
  font-size: 0.875rem;
}
</style>
