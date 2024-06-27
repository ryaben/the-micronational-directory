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
  text-decoration: none;
  margin-left: 6px;
  margin-right: 6px;
}

/* .tab-router-link:hover .button-container {
  border-bottom-left-radius: 0px;
  border-bottom-right-radius: 0px;
} */

.tab-router-link:first-of-type {
  margin-left: 12px;
}

.tab-router-link:last-of-type {
  margin-right: 12px;
}

.button-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 108px;
  height: 33px;
  padding: 10px;
  border: 2px solid var(--navbar-tab-border-color);
  border-radius: 8px;
  color: var(--navbar-text-color);
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
  color: var(--navbar-text-color-hover);
}

.tab-router-link:has(.sub-buttons-container .router-link-active) .button-container img,
.tab-router-link.router-link-active .button-container img,
.tab-router-link .button-container:hover img {
  filter: invert(100%);
}

.button-container img {
  width: 32px;
  margin-right: 8px;
  transition: linear filter 0.2s;
}

.button-container p {
  margin: 0;
  font-size: 17px;
}

.sub-buttons-container {
  position: absolute;
  top: 56px;
  left: 0;
  width: 100%;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
