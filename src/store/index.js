import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

import defaultState from './state'
import defaultMutations from './mutations'
import defaultActions from './actions'
import defaultGetters from './getters'

export default ({ state, mutations, actions, getters }) => {
    state = Object.assign(defaultState, state);
    mutations = Object.assign(defaultMutations, mutations);
    actions = Object.assign(defaultActions, actions);
    getters = Object.assign(defaultGetters, getters);

    return new Vuex.Store({
        plugins: [createPersistedState()],
        state,
        mutations,
        actions,
        getters
    })
}