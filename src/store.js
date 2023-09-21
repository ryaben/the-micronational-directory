import { createStore } from 'vuex';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase/init.js';

const store = createStore({
    state: {
        directory: [],
        physicalDirectory: [],
        contests: [],
        moderators: [
            "themicronationaldirectory@gmail.com"
        ]
    },
    getters: {
        directory(state) {
            return state.directory;
        },
        physicalDirectory(state) {
            return state.physicalDirectory;
        },
        contests(state) {
            return state.contests;
        },
        moderators(state) {
            return state.moderators;
        }
    },
    mutations: {
        SET_ENTRIES(state, value) {
            state.directory = value;
        },
        SET_CONTESTS(state, value) {
            state.contests = value;
        },
        SET_PHYSICAL_ENTRIES(state, value) {
            state.physicalDirectory = value;
        }
    },
    actions: {
        async getMicronations(context) {
            const normalize = function(string) {
                return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            }

            const q = query(collection(db, "micronations"));
            let micronationsList = [];
            let physicalMicronationsList = [];

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                micronationsList.push({ id: doc.id, searchDisplay: true, filterDisplay: true, ...doc.data() });

                if (doc.data().location._lat !== 0 && doc.data().location._long) {
                    physicalMicronationsList.push({ id: doc.id, searchDisplay: true, filterDisplay: true, ...doc.data() });
                }
            });

            micronationsList.sort((a, b) => (normalize(a.name.main) > normalize(b.name.main)) ? 1 : -1);

            context.commit('SET_ENTRIES', micronationsList);
            context.commit('SET_PHYSICAL_ENTRIES', physicalMicronationsList);
        },
        async getContests(context) {
            const q = query(collection(db, "contests"));
            let contestsList = [];

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                contestsList.push({ id: doc.id, ...doc.data() });
            });

            context.commit('SET_CONTESTS', contestsList);
        }
    }
});

// export the store
export default store;