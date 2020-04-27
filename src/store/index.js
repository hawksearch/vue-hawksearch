import Vue from 'vue'
import Vuex from 'vuex'
import HawkSearchVue from '../HawkSearchVue';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		searchOutput: null
	},
	mutations: {
		updateResults(state, searchOutput) {
			state.searchOutput = searchOutput;
		}
	},
	actions: {
		fetchResults({ commit, state }, searchParams) {
			HawkSearchVue.fetchResults(searchParams, (searchOutput) => {
				commit('updateResults', searchOutput);
			});
		}
	}
});