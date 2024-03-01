import { createStore } from 'vuex';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase/init.js';

const store = createStore({
    state: {
        micronations: [],
        physicalMicronations: [],
        contests: [],
        organizations: [],
        moderators: [
            "themicronationaldirectory@gmail.com"
        ]
    },
    getters: {
        micronations(state) {
            return state.micronations;
        },
        physicalMicronations(state) {
            return state.physicalMicronations;
        },
        contests(state) {
            return state.contests;
        },
        moderators(state) {
            return state.moderators;
        },
        organizations(state) {
            return state.organizations;
        },
    },
    mutations: {
        SET_MICRONATIONS(state, value) {
            state.micronations = value;
        },
        SET_CONTESTS(state, value) {
            state.contests = value;
        },
        SET_PHYSICAL_MICRONATIONS(state, value) {
            state.physicalMicronations = value;
        },
        SET_ORGANIZATIONS(state, value) {
            state.organizations = value;
        },
    },
    actions: {
        async getMicronations(context) {
            const q = query(collection(db, "micronations"));
            let micronationsList = [];
            let physicalMicronationsList = [];

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                micronationsList.push({ id: doc.id, pageDisplay: false, searchDisplay: true, filterDisplay: true, ...doc.data() });

                if (doc.data().location._lat !== 0 && doc.data().location._long !== 0) {
                    physicalMicronationsList.push({ id: doc.id, pageDisplay: false, searchDisplay: true, filterDisplay: true, ...doc.data() });
                }
            });

            context.commit('SET_MICRONATIONS', micronationsList);
            context.commit('SET_PHYSICAL_MICRONATIONS', physicalMicronationsList);
        },
        async getOrganizations(context) {
            const q = query(collection(db, "organizations"));
            let organizationsList = [];

            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                organizationsList.push({ id: doc.id, pageDisplay: false, searchDisplay: true, filterDisplay: true, ...doc.data() });
            });

            context.commit('SET_ORGANIZATIONS', organizationsList);
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