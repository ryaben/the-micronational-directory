<script setup>
import router from '../router/index';
import store from '../store';
</script>

<template>
    <section class="site-section paddingless">
        <div class="left-side">
            <button class="login-button color-transition" :disabled="this.user.emailVerified"
                @click="resendVerification">Resend verification email</button>
            <button class="login-button color-transition" v-show="!this.passwordMenu"
                @click="this.passwordMenu = true">Update password</button>
            <button class="login-button color-transition" v-show="this.passwordMenu"
                @click="this.passwordMenu = false">Return to main menu</button>
            <button class="login-button color-transition" @click="signOutCall">Log out</button>
        </div>
        <div class="right-side">
            <div class="main-menu menu" v-show="!this.passwordMenu">
                <h3>Hello, {{ this.user.displayName }}!</h3>
                <p>
                    Your email address is: <span class="underlined">{{ this.user.email }}</span>
                    <br>
                    and its status is:
                    <span v-if="this.user.emailVerified" class="verified"><b>Verified</b>.</span>
                    <span v-if="!this.user.emailVerified"><b class="not-verified">NOT verified</b> (you need to refresh
                        if performed with open session).</span>
                </p>
                <p class="contributions-text">
                    Your contribution:<br>
                    - <b class="underlined">{{ this.userContributions }}</b> entries on the Directory ({{
                        this.percentageContributions }}% of the total).<br>
                    - <b>{{ this.user.prizesWon || 0 }}</b> prizes won on the platform.
                </p>
            </div>
            <form class="password-menu menu" v-show="this.passwordMenu" @submit.prevent="changePassword">
                <input class="login-input" type="password" id="oldPassword" v-model="oldPassword" required
                    placeholder="Old password">
                <input class="login-input" type="password" id="newPassword" v-model="newPassword" required
                    placeholder="New password">
                <input class="login-input" type="password" id="repeatNewPassword" v-model="repeatNewPassword" required
                    placeholder="Repeat new password">
                <input id="changePasswordButton" type="submit" value="Update password"
                    class="login-button color-transition">
            </form>
        </div>
    </section>
</template>
  
<script>
import { EmailAuthProvider, signOut, onAuthStateChanged, sendEmailVerification, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { auth } from '../firebase/init.js';
import { notify } from "@kyvg/vue3-notification";

export default {
    data() {
        return {
            user: {},
            passwordMenu: false,
            oldPassword: '',
            newPassword: '',
            repeatNewPassword: ''
        }
    },
    computed: {
        micronationsDirectory() {
            return store.getters.directory;
        },
        userContributions() {
            return this.countContributions(this.micronationsDirectory, this.user.email);
        },
        percentageContributions() {
            return (this.userContributions * 100 / this.micronationsDirectory.length).toFixed(2);
        }
    },
    methods: {
        authListener() {
            onAuthStateChanged(auth, user => {
                if (!user) {
                    if (localStorage.getItem('firebase-auth-user') === null) {
                        router.push('/login');
                    }
                } else {
                    this.user = JSON.parse(localStorage.getItem('firebase-auth-user'));
                }
            });
        },
        async resendVerification() {
            sendEmailVerification(auth.currentUser).then(function () {
                notify({
                    title: "Session status",
                    text: "An email was sent to your address, verify your account to add entries on the Directory.",
                    type: "success"
                });
            });
        },
        async changePassword() {
            if (this.newPassword !== this.repeatNewPassword) {
                return notify({
                    title: "Password mismatch",
                    text: "The values entered don't match, please check your new password.",
                    type: "error"
                });
            } else {
                const credential = EmailAuthProvider.credential(auth.currentUser.email, this.oldPassword);
                reauthenticateWithCredential(auth.currentUser, credential).then(() => {
                    updatePassword(auth.currentUser, this.newPassword).then(() => {
                        this.newPassword = '';
                        this.oldPassword = '';
                        this.repeatNewPassword = '';
                        return notify({
                            title: "Password update",
                            text: "Your password was successfully updated. Use it next time you log in.",
                            type: "success"
                        });
                    }).catch((error) => {
                        return notify({
                            title: "Error while updating",
                            text: error,
                            type: "error"
                        });
                    });
                }).catch((error) => {
                    return notify({
                        title: "Error while updating",
                        text: 'The password you entered as old is not valid as current one.',
                        type: "error"
                    });
                });
            }
        },
        async signOutCall() {
            localStorage.removeItem('firebase-auth-user');
            await signOut(auth).then(function () {
                store.getters.contributions = 0;
                notify({
                    title: "Session status",
                    text: "You have logged out from your account.",
                    type: "warning"
                });
            });
        },
        countContributions(array, value) {
            let count = 0;

            array.forEach(element => {
                if (element.author.email === value) {
                    count += 1;
                }
            });

            return count;
        }
    },
    async mounted() {
        this.authListener();
    }
}
</script>
  
<style scoped>
.paddingless {
    padding: 0;
    display: grid;
    grid-template-columns: 35% 65%;
    height: 268px;
}

.left-side {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background-color: var(--profile-left-side-background-color);
    border-right: 4px solid var(--site-section-border-color);
}

.left-side .login-button {
    width: 70%;
    margin-bottom: 25px;
}

.left-side .login-button:last-child {
    margin-bottom: 0;
}

.right-side {
    padding: 20px;
}

.menu {
    display: flex;
    flex-direction: column;
}

.menu .login-input {
    width: 40%;
    margin-bottom: 20px;
}

.verified {
    color: var(--success-tone);
}

.not-verified {
    color: var(--intense-tone);
}

.contributions-text {
    font-size: 18px;
}
</style>
  