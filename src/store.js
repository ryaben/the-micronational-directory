import { createStore } from 'vuex';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase/init.js';

const store = createStore({
    state: {
        directory: [],
        physicalDirectory: [],
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
        moderators(state) {
            return state.moderators;
        }
    },
    mutations: {
        SET_ENTRIES(state, value) {
            state.directory = value;
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

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                micronationsList.push({ id: doc.id, searchDisplay: true, filterDisplay: true, ...doc.data() });
            });

            micronationsList.sort((a, b) => (normalize(a.name.main) > normalize(b.name.main)) ? 1 : -1);

            context.commit('SET_ENTRIES', micronationsList);
        },
        filterPhysicalMicronations(context) {
            let filteredDirectory = [];

            context.getters.directory.forEach(function (element) {
                if (element.location._lat !== 0 && element.location._lng !== 0) {
                    filteredDirectory.push(element);
                }
            });

            context.commit('SET_PHYSICAL_ENTRIES', filteredDirectory);
        },
    }
});

// export the store
export default store;