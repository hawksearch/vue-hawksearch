import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		apiUrl: 'http://dev.hawksearch.net/sites/sitefinityconnectortesting/',
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
			Vue.http.get(state.apiUrl, {
				params: {
					keyword: searchParams.keyword,
					output: 'json'
				}
			}).then(response => {
				if (response.status == '200' && response.data) {
					commit('updateResults', response.data.Results);
				}
			});
		}
	}
});