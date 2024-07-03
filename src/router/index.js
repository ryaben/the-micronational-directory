import { createWebHistory, createRouter } from "vue-router";

//Views importadas
import Home from "@/views/Home.vue";
import Directory from "@/views/Directory.vue";
import Organizations from "@/views/Organizations.vue";
import GlobalMap from "@/views/GlobalMap.vue";
import NewEntry from "@/views/NewEntry.vue";
import Moderation from "@/views/Moderation.vue";
import DirectoryProfile from "@/views/DirectoryProfile.vue";
import OrganizationProfile from "@/views/OrganizationProfile.vue";
import Stats from "@/views/Stats.vue";
import Login from "@/views/Login.vue";
import Profile from "@/views/Profile.vue";
import Donate from "@/views/Donate.vue";
import News from "@/views/News.vue";
import About from "@/views/About.vue";
import TermsOfContests from "@/views/TermsOfContests.vue";

import MicroWikiReader from "@/views/MicroWikiReader.vue";

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
    path: "/organizations",
    name: "Organizations",
    component: Organizations
  },
  {
    path: "/map",
    name: "GlobalMap",
    component: GlobalMap
  },
  {
    path: "/new-entry",
    name: "NewEntry",
    component: NewEntry
  },
  {
    path: "/moderation",
    name: "Moderation",
    component: Moderation
  },
  {
    path: "/directory/:micronationName",
    name: "DirectoryProfile",
    component: DirectoryProfile
  },
  {
    path: "/organizations/:organizationName",
    name: "OrganizationProfile",
    component: OrganizationProfile
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
    path: "/news",
    name: "News",
    component: News
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
  },

  {
    path: "/microwiki-reader",
    name: "MicroWikiReader",
    component: MicroWikiReader
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;