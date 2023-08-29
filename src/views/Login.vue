<script setup>
import router from '../router/index';
</script>

<template>
    <section class="site-section login">
        <div id="loginForm">
            <h3 id="loginTitle">Log in</h3>
            <p id="loginSubtitle">Add new entries in the Directory, participate in events and leave your mark on the stats
                and the credits!</p>
            <input class="login-input" type="text" id="loginName" v-model="loginName"
                placeholder="Name (only for signing up)">
            <input class="login-input" type="email" id="loginEmail" v-model="loginEmail" required
                placeholder="Email address">
            <input class="login-input" type="password" id="loginPassword" v-model="loginPassword" required
                placeholder="Password">
            <div id="loginButtonsContainer">
                <button class="login-button color-transition" @click="signup">Sign up</button>
                <button class="login-button color-transition" @click="login">Log in</button>
            </div>
        </div>
    </section>
</template>

<script>
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '../firebase/init.js';
import { notify } from "@kyvg/vue3-notification";

export default {
    data() {
        return {
            loginName: '',
            loginEmail: '',
            loginPassword: ''
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
            let that = this;

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
                    switch (error.code) {
                        case 'auth/email-already-in-use':
                            notify({
                                title: "Error while signing up",
                                text: "There is an existing account registered with that address.",
                                type: "error"
                            });
                            break;
                        case 'auth/invalid-email':
                            notify({
                                title: "Error while signing up",
                                text: "The entered email is not valid, make sure to use @ and a domain.",
                                type: "error"
                            });
                            break;
                        default:
                            notify({
                                title: "Error while signing up",
                                text: error.code,
                                type: "error"
                            });
                            break;
                    }
                });
        },
        async login() {
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
                            switch (error.code) {
                                case 'auth/invalid-email':
                                    notify({
                                        title: "Error while logging in",
                                        text: "The entered email is not valid, make sure to use @ and a domain.",
                                        type: "error"
                                    });
                                    break;
                                case 'auth/user-not-found':
                                    notify({
                                        title: "Error while logging in",
                                        text: "There is no account registered with that email address.",
                                        type: "error"
                                    });
                                    break
                                case 'auth/wrong-password':
                                    notify({
                                        title: "Error while logging in",
                                        text: "The entered password is incorrect.",
                                        type: "error"
                                    });
                                    break
                                default:
                                    alert('Email or password was incorrect.');
                                    break
                            }
                        });
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`${errorCode}: ${errorMessage}`);
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
    font-size: 24px;
    margin: 0;
}

#loginSubtitle {
    width: 55%;
    text-align: center;
    margin-bottom: 20px;
}

#loginButtonsContainer {
    display: flex;
    justify-content: space-evenly;
    width: 55%;
}
</style>