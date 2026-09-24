import { createStore } from 'vuex'
 
import defaultState from './state'
import defaultMutations from './mutations'
import defaultActions from './actions'
import defaultGetters from './getters'
import selectionsModule from './modules/selections'

export default ({ state, mutations, actions, getters, modules } = {}) => {
  return createStore({
    state: Object.assign({}, defaultState, state),
    mutations: Object.assign({}, defaultMutations, mutations),
    actions: Object.assign({}, defaultActions, actions),
    getters: Object.assign({}, defaultGetters, getters),
    modules: Object.assign({
      selections: selectionsModule,
    }, modules),
  })
}
