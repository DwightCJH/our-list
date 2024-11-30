import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase'; 
import Login from '../screens/Login.vue';
import Homepage from '../screens/Homepage.vue';

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: Homepage,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(), // Use the Web History API for routing
  routes,
});

// Navigation guard to check if the user is authenticated
router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!user) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
