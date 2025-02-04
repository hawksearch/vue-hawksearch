import { createStore } from 'vuex';

import defaultState from './state';
import defaultMutations from './mutations';
import defaultActions from './actions';
import defaultGetters from './getters';

const store = createStore({
    state: {
        ...defaultState,
    },
    mutations: {
        ...defaultMutations,
    },
    actions: {
        ...defaultActions,
    },
    getters: {
        ...defaultGetters,
    },
});

export default store;
