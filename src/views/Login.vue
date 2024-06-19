<script setup>
import router from '../router/index';
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase/init.js';
import { notify } from "@kyvg/vue3-notification";
</script>

<template>
    <section class="site-section login">
        <div id="loginForm">
            <h1 id="loginTitle">Log in</h1>
            <p id="loginSubtitle">Add new entries on the Directory, participate in events and leave your mark on the stats
                and the credits!</p>
            <input class="login-input" type="text" id="loginName" v-model="loginName"
                placeholder="Name (only for signing up)">
            <input class="login-input" type="email" id="loginEmail" v-model="loginEmail" required
                placeholder="Email address">
            <input class="login-input" type="password" id="loginPassword" v-model="loginPassword" required
                placeholder="Password">
            <p id="forgotPassword" class="color-transition" @click="resetPassword">Forgot your password?</p>
            <div id="loginButtonsContainer">
                <button class="login-button color-transition" @click="signup">Sign up</button>
                <button class="login-button color-transition" @click="login">Log in</button>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            loginName: '',
            loginEmail: '',
            loginPassword: '',
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
                    router.push('/profile');
                }
            });
        },
        async signup() {
            const that = this;

            createUserWithEmailAndPassword(auth, this.loginEmail, this.loginPassword)
                .then((data) => {
                    updateProfile(auth.currentUser, { displayName: that.loginName })
                        .then(function () {
                            localStorage.setItem('firebase-auth-user', JSON.stringify(data.user));
                            sendEmailVerification(auth.currentUser).then(function () {
                                notify({
                                    title: "Session status",
                                    text: "An email was sent to your address, verify your account to add entries on the Directory.",
                                    type: "success"
                                });
                                router.push('/profile');
                            });
                        })
                        .catch(
                            (err) => console.log(err)
                        );
                })
                .catch(error => {
                    notify({
                        title: "Error while signing up",
                        text: that.errorMessages[error.code],
                        type: "error"
                    });
                });
        },
        async login() {
            const that = this;

            setPersistence(auth, browserLocalPersistence)
                .then(() => {
                    signInWithEmailAndPassword(auth, this.loginEmail, this.loginPassword)
                        .then((data) => {
                            notify({
                                title: "Session status",
                                text: "The login process was successful.",
                                type: "success"
                            });
                            localStorage.setItem('firebase-auth-user', JSON.stringify(data.user));
                            router.push('/profile');
                        })
                        .catch(error => {
                            notify({
                                title: "Error while logging in",
                                text: that.errorMessages[error.code],
                                type: "error"
                            });
                        });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    notify({
                        title: errorCode,
                        text: errorMessage,
                        type: "error"
                    });
                });
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
    display: flex;
    justify-content: center;
}

#loginForm {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3%;
    width: 60%;
    background: linear-gradient(138deg, var(--login-form-background-color1), var(--login-form-background-color2));
    border-radius: 8px;
}

#loginTitle {
    margin: 0;
}

#loginSubtitle {
    width: 55%;
    text-align: center;
    margin-bottom: 20px;
}

#loginPassword {
    margin-bottom: 10px;
}

#forgotPassword {
    margin-top: 0;
    margin-bottom: 20px;
    padding: 3px 5px 3px 5px;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
}

#forgotPassword:hover {
    background-color: var(--navbar-tab-background-color-hover);
    color: var(--navbar-text-color-hover);
}

#loginButtonsContainer {
    display: flex;
    justify-content: space-evenly;
    width: 65%;
}
</style>