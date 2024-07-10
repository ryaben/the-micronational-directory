import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Notifications from '@kyvg/vue3-notification';
import $ from 'jquery';

createApp(App).use(router).use(Notifications).use($).mount('#app');
