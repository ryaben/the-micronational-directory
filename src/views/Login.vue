<script setup>
import router from '../router/index';
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase/auth.js';
import { notify } from "@kyvg/vue3-notification";
</script>

<template>
    <section class="site-section login">
        <div class="login-layout">
            <aside class="login-welcome" :style="{ '--login-background-image': `url('/images/login-backgrounds/${backgroundImage}')` }">
                <img class="welcome-mark" src="/images/plain-logo1.png" alt="The Micronational Directory logo">
                <h1>Small nations.<br><span>Big stories.</span></h1>
                <p class="welcome-copy">A home for the people, places and projects preserving micronational worlds.</p>
                <div class="welcome-note">
                    <span class="note-dot"></span>
                    <span>Discover the community. Add your chapter.</span>
                </div>
                <div class="welcome-orbit orbit-one" aria-hidden="true"></div>
                <div class="welcome-orbit orbit-two" aria-hidden="true"></div>
            </aside>

            <div id="loginForm">
                <Transition name="auth-content" mode="out-in">
                    <div :key="isSigningUp ? 'signup' : 'login'" class="auth-content">
                <div class="form-heading">
                    <h2 id="loginTitle">{{ isSigningUp ? 'Join the directory' : 'Welcome back' }}</h2>
                    <p id="loginSubtitle">{{ isSigningUp ? 'Create an account to add entries and take part.' : 'Log in to continue where you left off.' }}</p>
                </div>

                <div class="auth-switch" role="tablist" aria-label="Account action">
                    <button type="button" role="tab" :aria-selected="!isSigningUp" :class="{ active: !isSigningUp }" @click="isSigningUp = false">Log in</button>
                    <button type="button" role="tab" :aria-selected="isSigningUp" :class="{ active: isSigningUp }" @click="isSigningUp = true">Create account</button>
                </div>

                <form class="auth-fields" @submit.prevent="isSigningUp ? signup() : login()">
                    <label v-if="isSigningUp" for="loginName">Your name</label>
                    <input v-if="isSigningUp" class="login-input" type="text" id="loginName" v-model="loginName"
                        placeholder="How should we call you?" autocomplete="name" required>
                    <label for="loginEmail">Email address</label>
                    <input class="login-input" type="email" id="loginEmail" v-model="loginEmail" required
                        placeholder="you@example.com" autocomplete="email">
                    <div class="password-label-row">
                        <label for="loginPassword">Password</label>
                        <button v-if="!isSigningUp" id="forgotPassword" type="button" @click="resetPassword">Forgot password?</button>
                    </div>
                    <input class="login-input" type="password" id="loginPassword" v-model="loginPassword" required
                        placeholder="Enter your password" :autocomplete="isSigningUp ? 'new-password' : 'current-password'">
                    <button class="login-button color-transition" type="submit" :disabled="isSubmitting">
                        <span v-if="isSubmitting" class="login-spinner" aria-hidden="true"></span>
                        <template v-else>{{ isSigningUp ? 'Create account' : 'Log in' }} <span aria-hidden="true">→</span></template>
                        <span v-if="isSubmitting" class="sr-only">{{ isSigningUp ? 'Creating account' : 'Logging in' }}</span>
                    </button>
                </form>
                <p class="form-footnote">{{ isSigningUp ? 'Already have an account?' : 'New to TMD?' }}
                    <button type="button" @click="isSigningUp = !isSigningUp">{{ isSigningUp ? 'Log in' : 'Create an account' }}</button>
                </p>
                    </div>
                </Transition>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        const backgrounds = ['1.png', '2.png', '3.png', '4.png', '5.png'];

        return {
            backgroundImage: backgrounds[Math.floor(Math.random() * backgrounds.length)],
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
            onAuthStateChanged(auth, user => {
                if (user) {
                    router.push('/account');
                }
            });
        },
        async signup() {
            this.isSubmitting = true;
            try {
                const data = await createUserWithEmailAndPassword(auth, this.loginEmail, this.loginPassword);
                await updateProfile(auth.currentUser, { displayName: this.loginName });
                localStorage.setItem('firebase-auth-user', JSON.stringify(data.user));
                await sendEmailVerification(auth.currentUser);
                notify({
                    title: "Session status",
                    text: "An email was sent to your address, verify your account to add entries on the Directory.",
                    type: "success"
                });
                router.push('/account');
            } catch (error) {
                    notify({
                        title: "Error while signing up",
                        text: this.errorMessages[error.code] || error.message,
                        type: "error"
                    });
            } finally {
                this.isSubmitting = false;
            }
        },
        async login() {
            this.isSubmitting = true;
            try {
                await setPersistence(auth, browserLocalPersistence);
                const data = await signInWithEmailAndPassword(auth, this.loginEmail, this.loginPassword);
                notify({
                    title: "Session status",
                    text: "The login process was successful.",
                    type: "success"
                });
                localStorage.setItem('firebase-auth-user', JSON.stringify(data.user));
                router.push('/account');
            } catch (error) {
                    notify({
                        title: "Error while logging in",
                        text: this.errorMessages[error.code] || error.message,
                        type: "error"
                    });
            } finally {
                this.isSubmitting = false;
            }
        },
        async resetPassword() {
            const that = this;

            sendPasswordResetEmail(auth, this.loginEmail)
                .then(() => {
                    notify({
                        title: "Reset password",
                        text: "We've sent an email to reset your password, please check your inbox.",
                        type: "success"
                    });
                })
                .catch((error) => {
                    notify({
                        title: "Error while resetting password",
                        text: that.errorMessages[error.code],
                        type: "error"
                    });
                });
        }
    },
    beforeMount() {
        this.authListener();
    },
    onBeforeUnmount() {
        this.authListener();
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
    background-color: #101722;
    background-image:
        linear-gradient(rgba(12, 18, 29, .42), rgba(12, 18, 29, .52)),
        radial-gradient(ellipse at 12% 100%, rgba(81, 121, 220, .28), transparent 58%),
        var(--login-background-image);
    background-position: center;
    background-size: cover;
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
    letter-spacing: -.045em;
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
    box-shadow: 0 0 0 5px rgba(139, 169, 255, .2);
}

.welcome-orbit {
    position: absolute;
    right: -115px;
    bottom: -190px;
    width: 390px;
    height: 390px;
    border: 1px solid rgba(157, 182, 255, .12);
    border-radius: 50%;
}

.orbit-two {
    right: -54px;
    bottom: -132px;
    width: 270px;
    height: 270px;
}

#loginForm {
    display: flex;
    flex: 1 1 52%;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: clamp(28px, 5vw, 64px);
    background: var(--color-surface);
}

.form-heading h2 {
    margin: 0;
    color: var(--color-heading);
    font-size: clamp(25px, 3vw, 32px);
    letter-spacing: -.03em;
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
    box-shadow: 0 2px 8px rgba(28, 63, 145, .32);
}

.auth-fields {
    display: flex;
    flex-direction: column;
}

.auth-content-enter-active,
.auth-content-leave-active {
    transition: opacity .16s ease, transform .16s ease;
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
    opacity: .85;
}

.login-spinner {
    display: inline-block;
    width: 19px;
    height: 19px;
    border: 2px solid rgba(255, 255, 255, .42);
    border-top-color: #fff;
    border-radius: 50%;
    animation: login-spin .7s linear infinite;
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
    to { transform: rotate(360deg); }
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
