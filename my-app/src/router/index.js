import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Homepage from '../screens/Homepage.vue';
import Login from '../screens/Login.vue';

const auth = getAuth();

const requireAuth = (to, from, next) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      unsubscribe();
      next();
    } else {
      unsubscribe();
      next({ name: 'Login' }); 
    }
  });
};

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: Homepage,
    beforeEnter: requireAuth,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
