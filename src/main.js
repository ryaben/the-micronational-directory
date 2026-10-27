import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import Notifications from '@kyvg/vue3-notification';
import { installI18n } from './i18n';

const app = createApp(App);
installI18n(app);
app.use(router).use(Notifications).mount('#app');
