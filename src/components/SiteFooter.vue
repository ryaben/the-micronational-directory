<script setup>
import { version } from '../../package.json'
import PreferenceControls from './PreferenceControls.vue'
import XIcon from './icons/XIcon.vue'
import EmailIcon from './icons/EmailIcon.vue'

defineProps({
  theme: {
    type: String,
    default: 'dark'
  },
  language: {
    type: String,
    default: 'english'
  }
})

const emit = defineEmits(['update:theme', 'update:language'])
</script>

<template>
  <footer class="site-section site-footer" aria-label="Site information and settings">
    <section class="footer-brand" aria-label="About this site">
      <img
        :src="theme === 'light' ? '/images/brand/plain-logo1-black.png' : '/images/brand/plain-logo1.png'"
        alt="TMD logo"
      />
      <p class="footer-name">The Micronational Directory</p>
      <p class="footer-copyright">
        © 2023–{{ new Date().getFullYear() }} · Version {{ version }}-beta
      </p>
    </section>

    <section class="footer-social" aria-labelledby="footer-social-title">
      <h2 class="footer-heading" id="footer-social-title">Stay connected</h2>
      <a
        href="https://x.com/the_micro_direc"
        class="footer-x-link"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow The Micronational Directory on X (opens in a new tab)"
      >
        <XIcon class="footer-x-icon" aria-hidden="true" focusable="false" />
        <span>Follow <strong>@the_micro_direc</strong></span>
      </a>
      <a class="anchor-button" id="sendEmail" href="mailto:themicronationaldirectory@gmail.com">
        <EmailIcon class="footer-email-icon" aria-hidden="true" focusable="false" />
        <span>themicronationaldirectory@gmail.com</span>
      </a>
    </section>

    <section class="footer-settings" aria-labelledby="footer-settings-title">
      <h2 class="footer-heading" id="footer-settings-title">Preferences</h2>
      <PreferenceControls
        :theme="theme"
        :language="language"
        @update:theme="emit('update:theme', $event)"
        @update:language="emit('update:language', $event)"
      />
    </section>

    <section class="footer-visitors" aria-labelledby="footer-visitors-title">
      <a
        href="https://s01.flagcounter.com/more/n91V/"
        class="tab-router-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src="https://s01.flagcounter.com/count2/n91V/bg_FFFFFF/txt_000000/border_CCCCCC/columns_3/maxflags_15/viewers_0/labels_1/pageviews_0/flags_0/percent_0/"
          alt="Visitor count by country — see more"
        />
      </a>
    </section>
  </footer>
</template>

<style scoped>
.site-footer {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(220px, 1fr) minmax(200px, 0.85fr) minmax(
      280px,
      1fr
    );
  align-items: center;
  justify-content: stretch;
  gap: clamp(16px, 2vw, 28px);
  margin-top: 24px;
}

.site-footer > section {
  min-width: 0;
}
.footer-brand,
.footer-social,
.footer-settings {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.footer-social {
  align-items: flex-start;
}
.footer-brand img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}
.footer-name {
  margin: 8px 0 0;
  color: var(--color-heading);
  font-weight: 750;
}
.footer-copyright {
  margin: 2px 0 0;
  color: var(--color-muted);
  font-size: 12px;
}
.footer-heading {
  margin: 0 0 10px;
  color: var(--color-heading);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.footer-control-label {
  margin-bottom: 4px;
  color: var(--color-muted);
  font-size: 12px;
}
.anchor-button {
  text-decoration: none;
  border-radius: var(--radius-xl);
  text-align: center;
  background-color: var(--vt-c-indigo);
  color: var(--vt-c-white-mute);
}
.footer-x-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  width: 100%;
  min-height: 42px;
  max-width: 100%;
  padding: 9px 13px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: #fff !important;
  background: #000;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.35;
  text-decoration: none;
  transition:
    background-color var(--transition-base) ease,
    border-color var(--transition-base) ease;
}
.footer-x-link:hover {
  color: #fff !important;
  background: #171717 !important;
}
:root[data-theme='dark'] .footer-x-link {
  border-color: rgba(255, 255, 255, 0.22);
}
.footer-x-icon,
.footer-email-icon {
  width: 16px;
  height: 16px;
  flex: 0 0 auto;
  fill: currentColor;
}
.footer-social #sendEmail span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.anchor-button:hover {
  background-color: var(--vt-c-indigo-dark);
  color: var(--vt-c-white-mute);
}
#sendEmail {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  margin-top: 9px;
  min-height: 42px;
  padding: 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  color: var(--color-link);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.45;
  text-align: center;
  text-decoration: none;
  overflow-wrap: break-word;
  word-break: normal;
  transition:
    background-color var(--transition-base) ease,
    border-color var(--transition-base) ease;
}
#sendEmail:hover {
  background: var(--navbar-tab-background-color-hover);
  border-color: var(--color-border-hover);
  color: var(--color-link);
}
.footer-visitors {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 0;
}
.footer-visitors img {
  display: block;
  width: 100%;
  max-width: 290px;
  height: auto;
  border-radius: var(--radius-sm);
}

@media (max-width: 1100px) {
  .site-footer {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 26px 22px;
  }
  .footer-visitors img {
    max-width: 100%;
  }
}

@media (max-width: 560px) {
  .site-footer {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  .site-footer > section + section {
    padding-top: 18px;
    border-top: 1px solid var(--color-border);
  }
  .footer-visitors img {
    max-width: 100%;
  }
  .footer-visitors {
    align-items: center;
  }
  .footer-visitors img {
    width: min(100%, 290px);
  }
}
</style>
