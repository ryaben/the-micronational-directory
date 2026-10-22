import { createStore } from 'vuex';

const store = createStore({
    state: {
        micronations: [],
        physicalMicronations: [],
        contests: [],
        organizations: [],
        user: { emailVerified: false },
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
        user(state) {
            return state.user;
        }
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
        SET_USER(state, value) {
            state.user = value || { emailVerified: false };
        }
    },
    actions: {
        async getMicronations(context) {
            try {
                const response = await fetch('/micronations.json');
                const data = await response.json();
                let micronationsList = [];
                let physicalMicronationsList = [];

                data.forEach((item) => {
                    micronationsList.push({ pageDisplay: false, searchDisplay: true, filterDisplay: true, ...item });

                    if (item.location && item.location.latitude !== 0 && item.location.longitude !== 0) {
                        physicalMicronationsList.push({ pageDisplay: false, searchDisplay: true, filterDisplay: true, ...item });
                    }
                });

                context.commit('SET_MICRONATIONS', micronationsList);
                context.commit('SET_PHYSICAL_MICRONATIONS', physicalMicronationsList);
            } catch (error) {
                console.error('Error fetching micronations:', error);
            }
        },
        async getOrganizations(context) {
            try {
                const response = await fetch('/organizations.json');
                const data = await response.json();
                let organizationsList = [];

                data.forEach((item) => {
                    organizationsList.push({ pageDisplay: false, searchDisplay: true, filterDisplay: true, ...item });
                });

                context.commit('SET_ORGANIZATIONS', organizationsList);
            } catch (error) {
                console.error('Error fetching organizations:', error);
            }
        },
        async getContests(context) {
            const [{ collection, query, getDocs }, { db }] = await Promise.all([
                import('firebase/firestore'),
                import('./firebase/firestore.js')
            ]);
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
