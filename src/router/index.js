import { createWebHistory, createRouter } from "vue-router";

//Views importadas
import Home from "@/views/Home.vue";
import Directory from "@/views/Directory.vue";
import Stats from "@/views/Stats.vue";
import Login from "@/views/Login.vue";
import Profile from "@/views/Profile.vue";
import Donate from "@/views/Donate.vue";
import About from "@/views/About.vue";
import TermsOfContests from "@/views/TermsOfContests.vue";

//Rutas
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/directory",
    name: "Directory",
    component: Directory
  },
  {
    path: "/stats",
    name: "Stats",
    component: Stats
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile
  },
  {
    path: "/donate",
    name: "Donate",
    component: Donate
  },
  {
    path: "/about",
    name: "About",
    component: About
  },
  {
    path: "/terms-of-contests",
    name: "TermsOfContests",
    component: TermsOfContests
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;