<script setup>
import router from '../router/index'
import {
  sendEmailVerification,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../firebase/auth.js'
import { ensureUserDocument } from '../firebase/userProfile.js'
import { notify } from '@kyvg/vue3-notification'
import GoogleIcon from '../components/icons/GoogleIcon.vue'
</script>

<template>
  <section class="site-section login">
    <div class="login-layout">
      <aside
        class="login-welcome"
              :class="{ 'background-ready': isBackgroundLoaded }"
        :style="{
          '--login-background-image': `url('/images/login-backgrounds/${backgroundImage}')`
        }"
      >
        <img
          class="welcome-mark"
          src="/images/brand/plain-logo1.png"
          alt="The Micronational Directory logo"
        />
        <h1>Small nations.<br /><span>Big stories.</span></h1>
        <p class="welcome-copy">
          A home for the people, places and projects preserving micronational worlds.
        </p>
        <div class="welcome-note">
          <span class="note-dot"></span>
          <span>Discover the community. Add your chapter.</span>
        </div>
      </aside>

      <div id="loginForm">
        <Transition name="auth-content" mode="out-in">
          <div :key="isSigningUp ? 'signup' : 'login'" class="auth-content">
            <div class="form-heading">
              <h2 id="loginTitle">{{ isSigningUp ? 'Join the directory' : 'Welcome back' }}</h2>
              <p id="loginSubtitle">
                {{
                  isSigningUp
                    ? 'Create an account to add entries and take part.'
                    : 'Log in to continue where you left off.'
                }}
              </p>
            </div>

            <div class="auth-switch" role="tablist" aria-label="Account action">
              <button
                type="button"
                role="tab"
                :aria-selected="!isSigningUp"
                :class="{ active: !isSigningUp }"
                @click="isSigningUp = false"
              >
                Log in
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="isSigningUp"
                :class="{ active: isSigningUp }"
                @click="isSigningUp = true"
              >
                Create account
              </button>
            </div>

            <form class="auth-fields" @submit.prevent="isSigningUp ? signup() : login()">
              <label v-if="isSigningUp" for="loginName">Your name</label>
              <input
                v-if="isSigningUp"
                class="login-input"
                type="text"
                id="loginName"
                v-model="loginName"
                placeholder="How should we call you?"
                autocomplete="name"
                required
              />
              <label for="loginEmail">Email address</label>
              <input
                class="login-input"
                type="email"
                id="loginEmail"
                v-model="loginEmail"
                required
                placeholder="you@example.com"
                autocomplete="email"
              />
              <div class="password-label-row">
                <label for="loginPassword">Password</label>
                <button
                  v-if="!isSigningUp"
                  id="forgotPassword"
                  type="button"
                  @click="resetPassword"
                >
                  Forgot password?
                </button>
              </div>
              <input
                class="login-input"
                type="password"
                id="loginPassword"
                v-model="loginPassword"
                required
                placeholder="Enter your password"
                :autocomplete="isSigningUp ? 'new-password' : 'current-password'"
              />
              <button class="login-button color-transition" type="submit" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="login-spinner" aria-hidden="true"></span>
                <template v-else
                  >{{ isSigningUp ? 'Create account' : 'Log in' }}
                  <span aria-hidden="true">→</span></template
                >
                <span v-if="isSubmitting" class="sr-only">{{
                  isSigningUp ? 'Creating account' : 'Logging in'
                }}</span>
              </button>
            </form>
            <p class="form-footnote">
              {{ isSigningUp ? 'Already have an account?' : 'New to TMD?' }}
              <button type="button" @click="isSigningUp = !isSigningUp">
                {{ isSigningUp ? 'Log in' : 'Create an account' }}
              </button>
            </p>
            <div class="social-login-divider" aria-hidden="true"><span>or</span></div>
            <button
              class="google-login-button"
              type="button"
              :disabled="isSubmitting"
              @click="loginWithGoogle"
            >
              <span v-if="isSubmitting" class="login-spinner" aria-hidden="true"></span>
              <GoogleIcon v-else class="google-icon" aria-hidden="true" />
              <span>Continue with Google</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    const backgrounds = ['1.png', '2.png', '3.png', '4.png', '5.png']

    return {
      backgroundImage: backgrounds[Math.floor(Math.random() * backgrounds.length)],
        isBackgroundLoaded: false,
      loginName: '',
      loginEmail: '',
      loginPassword: '',
      isSigningUp: false,
      isSubmitting: false,
      errorMessages: {
        'auth/email-already-in-use': 'There is an existing account registered with that address.',
        'auth/invalid-email': 'The entered email is not valid, make sure to use @ and a domain.',
        'auth/user-not-found': 'There is no account registered with that email address.',
        'auth/wrong-password': 'The entered password is incorrect, please try again or reset it.'
      }
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          router.push('/account')
        }
      })
    },
    async signup() {
      this.isSubmitting = true
      try {
        const data = await createUserWithEmailAndPassword(auth, this.loginEmail, this.loginPassword)
        await updateProfile(auth.currentUser, { displayName: this.loginName })
        await ensureUserDocument(data.user)
        localStorage.setItem('firebase-auth-user', JSON.stringify(data.user))
        await sendEmailVerification(auth.currentUser)
        notify({
          title: 'Session status',
          text: 'An email was sent to your address, verify your account to add entries on the Directory.',
          type: 'success'
        })
        router.push('/account')
      } catch (error) {
        notify({
          title: 'Error while signing up',
          text: this.errorMessages[error.code] || error.message,
          type: 'error'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    async login() {
      this.isSubmitting = true
      try {
        await setPersistence(auth, browserLocalPersistence)
        const data = await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPassword)
        await ensureUserDocument(data.user)
        notify({
          title: 'Session status',
          text: 'The login process was successful.',
          type: 'success'
        })
        localStorage.setItem('firebase-auth-user', JSON.stringify(data.user))
        router.push('/account')
      } catch (error) {
        notify({
          title: 'Error while logging in',
          text: this.errorMessages[error.code] || error.message,
          type: 'error'
        })
      } finally {
        this.isSubmitting = false
      }
    },
    async loginWithGoogle() {
      this.isSubmitting = true
      try {
        await setPersistence(auth, browserLocalPersistence)
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: 'select_account' })
        const data = await signInWithPopup(auth, provider)
        await ensureUserDocument(data.user)
        localStorage.setItem('firebase-auth-user', JSON.stringify(data.user))
        router.push('/account')
      } catch (error) {
        const text =
          error.code === 'auth/account-exists-with-different-credential'
            ? 'An account with this email already uses email and password. Log in with your password first, then link Google from your account.'
            : error.code === 'auth/popup-closed-by-user'
            ? 'Google sign-in was cancelled.'
            : this.errorMessages[error.code] || error.message
        notify({ title: 'Error while logging in with Google', text, type: 'error' })
      } finally {
        this.isSubmitting = false
      }
    },
    async resetPassword() {
      const that = this

      sendPasswordResetEmail(auth, this.loginEmail)
        .then(() => {
          notify({
            title: 'Reset password',
            text: "We've sent an email to reset your password, please check your inbox.",
            type: 'success'
          })
        })
        .catch((error) => {
          notify({
            title: 'Error while resetting password',
            text: that.errorMessages[error.code],
            type: 'error'
          })
        })
    }
  },
  mounted() {
    const background = new Image()
    background.onload = () => {
      this.isBackgroundLoaded = true
    }
    background.src = `/images/login-backgrounds/${this.backgroundImage}`
  },
  beforeMount() {
    this.authListener()
  },
  onBeforeUnmount() {
    this.authListener()
  }
}
</script>

<style scoped>
.site-section.login {
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  box-shadow: none;
}

.login-layout {
  display: flex;
  width: 100%;
  min-height: min(72vh, 760px);
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-background);
  box-shadow: var(--shadow-soft);
}

.login-welcome {
  position: relative;
  display: flex;
  flex: 1 1 48%;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: clamp(30px, 5vw, 68px);
  overflow: hidden;
  color: #f8fafc;
  background-color: transparent;
  background-image: none;
  background-position: center;
  background-size: cover;
}

.login-welcome.background-ready {
  background-color: #101722;
  background-image: linear-gradient(rgba(12, 18, 29, 0.56), rgba(12, 18, 29, 0.64)),
    radial-gradient(ellipse at 12% 100%, rgba(45, 68, 125, 0.18), transparent 58%),
    var(--login-background-image);
}

.welcome-mark {
  display: block;
  width: 58px;
  height: 58px;
  margin-bottom: 42px;
  object-fit: contain;
}

.login-welcome h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  color: #f8fafc;
  font-size: clamp(36px, 4.5vw, 54px);
  letter-spacing: -0.045em;
  line-height: 1.08;
}

.login-welcome h1 span {
  color: #afc2ff;
}

.welcome-copy {
  position: relative;
  z-index: 1;
  max-width: 340px;
  margin: 20px 0 0;
  color: #e0e8f5;
  font-size: 16px;
}

.welcome-note {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 54px;
  color: #edf3ff;
  font-size: 13px;
}

.note-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a4bcff;
  box-shadow: 0 0 0 5px rgba(139, 169, 255, 0.2);
}

#loginForm {
  display: flex;
  flex: 1 1 52%;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  padding: clamp(28px, 3vw, 48px);
  background: var(--color-surface);
}

.form-heading h2 {
  margin: 0;
  color: var(--color-heading);
  font-size: clamp(25px, 3vw, 32px);
  letter-spacing: -0.03em;
}

#loginSubtitle {
  margin: 8px 0 24px;
  color: var(--color-muted);
}

.auth-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 24px;
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

.auth-switch button {
  min-height: 40px;
  border: 0;
  border-radius: 8px;
  color: var(--color-muted);
  background: transparent;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.auth-switch button.active {
  color: #fff;
  background: #5278d8;
  box-shadow: 0 2px 8px rgba(28, 63, 145, 0.32);
}

.auth-fields {
  display: flex;
  flex-direction: column;
}

.auth-content-enter-active,
.auth-content-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.auth-content-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.auth-content-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.auth-fields label,
.password-label-row label {
  margin-bottom: 7px;
  color: var(--color-heading);
  font-size: 13px;
  font-weight: 700;
}

input.login-input {
  width: 100%;
  min-height: 48px;
  margin-bottom: 17px;
  padding: 11px 13px;
  font-size: 14px;
}

.password-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

#forgotPassword,
.form-footnote button {
  padding: 0;
  border: 0;
  color: var(--color-link);
  background: transparent;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

#forgotPassword:hover,
.form-footnote button:hover {
  text-decoration: underline;
}

.login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 40%;
  min-height: 50px;
  margin-top: 3px;
  align-self: center;
  border: 0;
  border-radius: 11px;
  background: #5278d8;
  color: #fff;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
}

.login-button:hover {
  transform: translateY(-1px);
  filter: brightness(1.08);
}

.login-button span {
  font-size: 19px;
  line-height: 1;
}

.login-button:disabled {
  cursor: wait;
  opacity: 0.85;
}

.login-spinner {
  display: inline-block;
  width: 19px;
  height: 19px;
  border: 2px solid rgba(255, 255, 255, 0.42);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footnote {
  margin: 20px 0 0;
  color: var(--color-muted);
  text-align: center;
  font-size: 13px;
}

.form-footnote button {
  margin-left: 3px;
  font-size: inherit;
}

.social-login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 19px 0 15px;
  color: var(--color-muted);
  font-size: 12px;
}

.social-login-divider::before,
.social-login-divider::after {
  flex: 1;
  height: 1px;
  background: var(--color-border);
  content: '';
}

.google-login-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  border: 1px solid #dadce0;
  border-radius: 8px;
  background: #fff;
  color: #3c4043;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    box-shadow 0.16s ease,
    background-color 0.16s ease;
}

.google-login-button:hover:not(:disabled) {
  background: #f8faff;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.3);
}

.google-login-button:disabled {
  cursor: wait;
  opacity: 0.75;
}

.google-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
}

.google-login-button .login-spinner {
  border-color: rgba(60, 64, 67, 0.2);
  border-top-color: #4285f4;
}

@media (max-width: 760px) {
  .login-layout {
    min-height: 0;
    flex-direction: column;
  }

  .login-welcome {
    display: flex;
    flex: 0 0 auto;
    min-height: 280px;
    padding: 30px clamp(24px, 6vw, 48px);
  }

  #loginForm {
    flex: 0 0 auto;
    width: 100%;
    max-width: none;
    margin: 0;
  }
}

@media (max-width: 500px) {
  .site-section.login {
    padding: 0;
  }

  .login-layout {
    border-radius: 17px;
  }

  #loginForm {
    padding: 25px 20px;
  }

  .login-welcome {
    min-height: 260px;
    padding: 25px 20px;
  }

  .welcome-mark {
    width: 46px;
    height: 46px;
    margin-bottom: 22px;
  }

  .welcome-note {
    margin-top: 28px;
  }
}
</style>
