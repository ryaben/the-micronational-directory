<script setup>
import router from '../router/index'
import store from '../store'
import {
  EmailAuthProvider,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth'
import DirectoryEntry from '../components/DirectoryEntry.vue';
import { auth, db, storage } from '../firebase/init.js'
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { notify } from '@kyvg/vue3-notification'
import emailjs from 'emailjs-com';
</script>

<template>
  <section class="site-section paddingless">
    <div class="left-side">
      <button
        class="login-button color-transition"
        :disabled="user.emailVerified"
        @click="resendVerification"
      >
        Resend verification email
      </button>
      <button
        class="login-button color-transition"
        v-show="!passwordMenu"
        @click="
          passwordMenu = true;
          moderationMenu = false;
        "
      >
        Update password
      </button>
      <button
        class="login-button color-transition"
        v-show="passwordMenu"
        @click="passwordMenu = false"
      >
        Return to main menu
      </button>
      <button
        class="login-button color-transition"
        v-show="!moderationMenu"
        :disabled="!moderatorsList.includes(user.email)"
        @click="
          moderationMenu = true;
          passwordMenu = false;
        "
      >
        Moderate entries
      </button>
      <button
        class="login-button color-transition"
        v-show="moderationMenu"
        @click="moderationMenu = false"
      >
        Return to main menu
      </button>
      <button class="login-button color-transition" @click="signOutCall">Log out</button>
    </div>
    <div class="right-side">
      <div class="main-menu menu" v-show="!passwordMenu && !moderationMenu">
        <h3>Hello, {{ user.displayName }}!</h3>
        <p>
          Your email address is: <span class="underlined">{{ user.email }}</span>
          <br />
          and its status is:
          <span v-if="user.emailVerified" class="verified"><b>Verified</b>.</span>
          <span v-if="!user.emailVerified"
            ><b class="not-verified">NOT verified</b> (you need to refresh if performed with open
            session).</span
          >
        </p>
        <p class="contributions-text">
          Your contribution:<br />
          - <b>{{ userContributions }}</b> entries on the Directory ({{ percentageContributions }}%
          of the total).<br />
          - <b>{{ user.contestsWon || 0 }}</b> contest(s) won on the platform.
        </p>
      </div>
      <form class="password-menu menu" v-show="passwordMenu" @submit.prevent="changePassword">
        <input
          class="login-input"
          type="password"
          id="oldPassword"
          v-model="oldPassword"
          required
          placeholder="Old password"
        />
        <input
          class="login-input"
          type="password"
          id="newPassword"
          v-model="newPassword"
          required
          placeholder="New password"
        />
        <input
          class="login-input"
          type="password"
          id="repeatNewPassword"
          v-model="repeatNewPassword"
          required
          placeholder="Repeat new password"
        />
        <input
          id="changePasswordButton"
          type="submit"
          value="Update password"
          class="login-button color-transition"
        />
      </form>
      <div
        class="moderation-menu"
        v-if="moderatorsList.includes(user.email)"
        v-show="moderationMenu"
      >
        <div class="moderation-entries" :key="componentKey">
          <DirectoryEntry
            v-for="(item, i) in micronationsModerationDirectory"
            :key="i" :width="160" :flag-height="160 * 0.6" view-mode="cards" :info="{
              id: item.id,
              name: {
                main: item.name.main,
                mainAlt: item.name.mainAlt,
                title: item.name.title,
                titleAlt: item.name.titleAlt
              },
              flag: item.flag,
              motto: item.motto,
              type: item.type,
              languages: item.languages,
              capital: item.capital,
              currency: item.currency,
              foundationDate: item.foundationDate,
              location: item.location,
              memberships: item.memberships,
              contactInfo: item.contactInfo,
              websites: item.websites,
              author: item.author,
              approved: item.approved
            }" @click="selectedEntry = i; selectedEntryName = item.name.main;"/>
        </div>
        <div class="moderation-buttons">
          <label>{{ selectedEntryName }}</label>
          <input
              class="login-input"
              type="text"
              v-model="rejectionReason"
              placeholder="Reason for rejection"
            />
          <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined" @click="entryReject(selectedEntry, false)">
            Reject
          </button>
          <button id="entryReject" class="login-button color-transition" :disabled="selectedEntry === undefined" @click="entryReject(selectedEntry, true)">
            Reject and delete
          </button>
          <button id="entryApprove" class="login-button color-transition" :disabled="selectedEntry === undefined" @click="entryApprove(selectedEntry)">
            Approve
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      componentKey: 0,
      user: {},
      passwordMenu: false,
      moderationMenu: false,
      oldPassword: '',
      newPassword: '',
      repeatNewPassword: '',
      selectedEntry: undefined,
      selectedEntryName: 'None selected',
      rejectionReason: ""
    }
  },
  components: {
    DirectoryEntry
  },
  computed: {
    micronationsDirectory() {
      return store.getters.directory;
    },
    micronationsModerationDirectory() {
      return this.micronationsDirectory.filter((element) => !element.approved);
    },
    userContributions() {
      return this.countContributions(this.micronationsDirectory.filter((element) => element.approved), this.user.email);
    },
    percentageContributions() {
      return ((this.userContributions * 100) / this.micronationsDirectory.filter((element) => element.approved).length).toFixed(2);
    },
    moderatorsList() {
      return store.getters.moderators;
    }
  },
  methods: {
    authListener() {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          if (localStorage.getItem('firebase-auth-user') === null) {
            router.push('/login')
          }
        } else {
          this.user = JSON.parse(localStorage.getItem('firebase-auth-user'))
        }
      })
    },
    async resendVerification() {
      sendEmailVerification(auth.currentUser).then(function () {
        notify({
          title: 'Session status',
          text: 'An email was sent to your address, verify your account to add entries on the Directory.',
          type: 'success'
        })
      })
    },
    async changePassword() {
      if (this.newPassword !== this.repeatNewPassword) {
        return notify({
          title: 'Password mismatch',
          text: "The values entered don't match, please check your new password.",
          type: 'error'
        })
      } else {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, this.oldPassword)
        reauthenticateWithCredential(auth.currentUser, credential)
          .then(() => {
            updatePassword(auth.currentUser, this.newPassword)
              .then(() => {
                this.newPassword = ''
                this.oldPassword = ''
                this.repeatNewPassword = ''
                return notify({
                  title: 'Password update',
                  text: 'Your password was successfully updated. Use it the next time you log in.',
                  type: 'success'
                })
              })
              .catch((error) => {
                return notify({
                  title: 'Error while updating',
                  text: error,
                  type: 'error'
                })
              })
          })
          .catch((error) => {
            return notify({
              title: 'Error while updating',
              text: 'The password you entered as old is not valid as current one.',
              type: 'error'
            })
          })
      }
    },
    async signOutCall() {
      localStorage.removeItem('firebase-auth-user')
      await signOut(auth).then(function () {
        notify({
          title: 'Session status',
          text: 'You have logged out from your account.',
          type: 'warning'
        })
      })
    },
    countContributions(array, value) {
      let count = 0

      array.forEach((element) => {
        if (element.author.email === value) {
          count += 1
        }
      })

      return count
    },
    forceRerender() {
      this.componentKey += 1;
    },
    async entryReject(entryIndex, deletionRequest) {
      const that = this;

      try {
        if (!this.moderatorsList.includes(that.micronationsModerationDirectory[entryIndex].author.email)) {
          emailjs.send("service_gd9nz5x", "template_5500uwl", {
            to_name: that.micronationsModerationDirectory[entryIndex].author.name,
            to_email: that.micronationsModerationDirectory[entryIndex].author.email,
            entry_name: that.micronationsModerationDirectory[entryIndex].name.main,
            rejection_reason: that.rejectionReason
          },
          "P8-p_r-gTZedo_h84");
        }

        if (deletionRequest === true) {
          await deleteDoc(doc(db, "micronations", that.micronationsModerationDirectory[entryIndex].name.main));

          const flagRef = ref(storage, "images/flags/" + that.micronationsModerationDirectory[entryIndex].name.main + ".png");
          deleteObject(flagRef).then(() => {
            that.micronationsModerationDirectory.splice(entryIndex, 1);

            notify({
              title: 'Entry moderation',
              text: 'The rejected entry was successfully deleted from the database.',
              type: 'success'
            })
          }).catch((error) => {
            notify({
              title: 'Entry moderation',
              text: error,
              type: 'error'
            })
          });
        }

        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';
        this.rejectionReason = '';

        notify({
          title: 'Entry moderation',
          text: 'The author was notified that their entry was rejected.',
          type: 'warning'
        })
      } catch(error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    },
    async entryApprove(entryIndex) {
      const that = this;

      try {
        if (!this.moderatorsList.includes(that.micronationsModerationDirectory[entryIndex].author.email)) {
          emailjs.send("service_gd9nz5x", "template_w1tt2h5", {
            to_name: that.micronationsModerationDirectory[entryIndex].author.name,
            to_email: that.micronationsModerationDirectory[entryIndex].author.email,
            entry_name: that.micronationsModerationDirectory[entryIndex].name.main
          },
          "P8-p_r-gTZedo_h84");
        }

        const entryRef = doc(db, "micronations", that.micronationsModerationDirectory[entryIndex].name.main);
        await updateDoc(entryRef, {
          approved: true
        });

        this.micronationsModerationDirectory[entryIndex].approved = true;
        this.forceRerender();
        this.selectedEntry = undefined;
        this.selectedEntryName = 'None selected';

        notify({
          title: 'Entry moderation',
          text: 'The entry was successfully approved, the author was notified and it will now be available in the Directory.',
          type: 'success'
        })
      } catch(error) {
        notify({
          title: 'Error while moderating entry',
          text: error,
          type: 'error'
        })
      }
    }
  },
  async mounted() {
    this.authListener()
  }
}
</script>

<style scoped>
.paddingless {
  padding: 0;
  display: grid;
  grid-template-columns: 35% 65%;
  height: 315px;
}

.left-side,
.moderation-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--profile-left-side-background-color);
  border-right: 4px solid var(--site-section-border-color);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
}

.left-side .login-button {
  width: 70%;
  margin-bottom: 25px;
}

.left-side .login-button:last-child,
.moderation-buttons .login-button:last-child {
  margin-bottom: 0;
}

.right-side {
  padding: 0px;
}

.menu {
  display: flex;
  flex-direction: column;
  margin: 20px;
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

.moderation-menu {
  display: flex;
  justify-content: space-between;
  width: auto;
}

.moderation-entries {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
  padding-top: 20px;
  padding-left: 20px;
  width: 100%;
  max-height: 295px;
  overflow: scroll;
}

.moderation-buttons {
  border-right: none;
  border-left: 4px solid var(--site-section-border-color);
  border-radius: 0px;
  border-top-right-radius: 10px;
  border-bottom-right-radius: 10px;
  height: 275px;
}

.moderation-buttons .login-button {
  width: 200px;
  margin-bottom: 25px;
}

.moderation-buttons .login-input {
  width: 100%;
}

#entryReject {
  background-color: var(--intense-tone);
}

#entryApprove {
  background-color: var(--success-tone);
}
</style>
