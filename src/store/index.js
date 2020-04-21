import Vue from 'vue'
import Vuex from 'vuex'
import HawkSearchVue from '../HawkSearchVue';

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		results: [],
		facets: []
	},
	mutations: {
		updateResults(state, results) {
			state.results = results;
		}
	},
	actions: {
		fetchResults({ commit, state }, searchParams) {
			HawkSearchVue.fetchResults(searchParams, (results) => {
				commit('updateResults', results);
			});
		}
	}
});