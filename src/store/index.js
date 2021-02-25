import Vue from 'vue'
import Vuex from 'vuex'

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
        state,
        mutations,
        actions,
        getters
    })
}