import { createWebHistory, createRouter } from "vue-router";

//Rutas
const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue")
  },
  {
    path: "/directory",
    name: "Directory",
    component: () => import("@/views/Directory.vue")
  },
  {
    path: "/organizations",
    name: "Organizations",
    component: () => import("@/views/Organizations.vue")
  },
  {
    path: "/map",
    name: "GlobalMap",
    component: () => import("@/views/GlobalMap.vue")
  },
  {
    path: "/new-entry",
    name: "NewEntry",
    component: () => import("@/views/NewEntry.vue")
  },
  {
    path: "/directory/edit/:entryId",
    name: "EditMicronation",
    component: () => import("@/views/EditEntry.vue"),
    props: (route) => ({ entryId: route.params.entryId, entryType: "micronation" })
  },
  {
    path: "/organizations/edit/:entryId",
    name: "EditOrganization",
    component: () => import("@/views/EditEntry.vue"),
    props: (route) => ({ entryId: route.params.entryId, entryType: "organization" })
  },
  {
    path: "/moderation-panel",
    name: "ModerationPanel",
    redirect: { name: "ModerationHub" }
  },
  {
    path: "/moderation",
    name: "ModerationHub",
    component: () => import("@/views/ModerationHub.vue")
  },
  {
    path: "/directory/:micronationName",
    name: "DirectoryProfile",
    component: () => import("@/views/DirectoryProfile.vue"),
    props: true
  },
  {
    path: "/organizations/:organizationName",
    name: "OrganizationProfile",
    component: () => import("@/views/OrganizationProfile.vue"),
    props: true
  },
  {
    path: "/stats",
    name: "Stats",
    component: () => import("@/views/Stats.vue")
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue")
  },
  {
    path: "/account",
    name: "Account",
    component: () => import("@/views/Profile.vue")
  },
  {
    path: "/profile",
    redirect: { name: "Account" }
  },
  {
    path: "/donate",
    name: "Donate",
    component: () => import("@/views/Donate.vue")
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About.vue")
  },
  {
    path: "/terms-of-contests",
    name: "TermsOfContests",
    component: () => import("@/views/TermsOfContests.vue")
  },

  {
    path: "/mediawiki-reader",
    name: "MediaWikiReader",
    redirect: { name: "ModerationHub", query: { section: "mediawiki" } }
  },
  {
    path: "/googlemymaps-reader",
    name: "MicronationalMapReader",
    redirect: { name: "ModerationHub", query: { section: "google-maps" } }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
