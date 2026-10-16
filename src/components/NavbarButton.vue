<script setup>
import NavbarSubButton from './NavbarSubButton.vue';
import AnimateHeight from 'vue-animate-height';

defineProps({
  text: {
    type: String,
    required: true,
    default: 'Home'
  },
  icon: {
    type: String,
    required: true,
    default: 'home.png'
  },
  route: {
    type: String,
    required: true,
    default: 'Home'
  },
  subButtons: {
    type: Array,
    required: false,
    default: []
  }
})
</script>

<template>
  <router-link :to="{ name: route }" class="tab-router-link" @mouseenter="updateHeight" @mouseleave="updateHeight">
    <div class="button-container color-transition" :class="{'unfolded': height != 0 && subButtons.length}">
      <img :src="'/images/navbar-icons/' + icon" :alt="text + ' icon'">
      <p>{{ text }}</p>
    </div>

    <AnimateHeight class="sub-buttons-container" :duration="300" :height="height" :animate-opacity="false">
      <NavbarSubButton v-for="(subitem, i) in subButtons" :key="i" :text="subitem.text"
        :route="subitem.route" />
    </AnimateHeight>
  </router-link>
</template>

<script>
export default {
  name: 'NavbarButton',
  components: {
    NavbarSubButton,
    AnimateHeight
  },
  data: () => {
    return {
      subButtonsDisplay: false,
      activeParent: false,
      height: 0
    }
  },
  methods: {
    updateHeight() {
      return this.height = this.height === 0 ? 'auto' : 0;
    },
    showSubButtons() {
      this.subButtonsDisplay = true;
    },
    hideSubButtons() {
      this.subButtonsDisplay = false;
    }
  }
}
</script>

<style scoped>
.tab-router-link {
  position: relative;
  display: block;
  text-decoration: none;
  margin: 0 2px;
}

/* .tab-router-link:hover .button-container {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
} */

.tab-router-link:first-of-type {
  margin-left: 0;
}

.tab-router-link:last-of-type {
  margin-right: 0;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 104px;
  min-height: 42px;
  padding: 6px 12px;
  border: 1px solid var(--navbar-tab-border-color);
  border-radius: 12px;
  color: var(--color-text);
  background-color: var(--navbar-tab-background-color);
  cursor: pointer;
}

.button-container.selected {
  background-color: var(--navbar-tab-background-color-selected);
}

.button-container.unfolded {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
}

.tab-router-link:has(.sub-buttons-container .router-link-active) .button-container,
.tab-router-link.router-link-active .button-container,
.tab-router-link .button-container:hover {
  background-color: var(--navbar-tab-background-color-hover);
  color: var(--color-accent);
}

.tab-router-link:has(.sub-buttons-container .router-link-active) .button-container img,
.tab-router-link.router-link-active .button-container img,
.tab-router-link .button-container:hover img {
  opacity: .8;
}

.button-container img {
  width: 25px;
  margin-right: 8px;
  transition: opacity .2s ease;
}

.button-container p {
  margin: 0;
  font-size: 17px;
}

.sub-buttons-container {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  width: 100%;
  min-width: 132px;
  z-index: 50;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: 0 0 12px 12px;
  border: 0;
  box-shadow: none;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .tab-router-link { margin: 0; min-width: 0; }
  .button-container { width: 100%; min-width: 0; min-height: 42px; padding: 6px 8px; }
  .button-container p { font-size: 15px; }
  .button-container img { width: 22px; margin-right: 6px; }
}
</style>
