import { createWebHistory, createRouter } from "vue-router";

//Views importadas
import Home from "@/views/Home.vue";
import Directory from "@/views/Directory.vue";
import Stats from "@/views/Stats.vue";
import Login from "@/views/Login.vue";
import Profile from "@/views/Profile.vue";
import About from "@/views/About.vue";

//Rutas
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/directory",
    name: "Directory",
    component: Directory,
  },
  {
    path: "/stats",
    name: "Stats",
    component: Stats,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;