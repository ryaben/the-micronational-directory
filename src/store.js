import { createStore } from 'vuex';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase/init.js';

const store = createStore({
    state: {
        directory: [],
        physicalDirectory: [],
        contributions: 0
    },
    getters: {
        directory(state) {
            return state.directory;
        },
        physicalDirectory(state) {
            return state.physicalDirectory;
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
            const q = query(collection(db, "micronations"), where("approved", "==", true));
            let micronationsList = [];

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                micronationsList.push({ id: doc.id, searchDisplay: true, filterDisplay: true, ...doc.data() });
            });

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