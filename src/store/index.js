import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        config: {},
        searchOutput: null,
        pendingSearch: {
            Keyword: "",
            FacetSelections: {}
        },
        extendedSearchParams: {}
    },
    mutations: {
        updateConfig(state, value) {
            state.config = Object.assign({}, state.config, value);
        },
        updateResults(state, value) {
            state.searchOutput = value;
        },
        updatePendingSearch(state, value) {
            state.pendingSearch = value;
        },
        updateExtendedSearchParams(state, value) {
            state.extendedSearchParams = value;
        }
    },
    actions: {
        fetchResults({ commit, state }, searchParams) {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            commit('updatePendingSearch', pendingSearch);

            HawkSearchVue.fetchResults(pendingSearch, (searchOutput) => {
                commit('updateResults', searchOutput);

                HawkSearchVue.extendSearchData(searchOutput, state.pendingSearch, (extendedSearchParams) => {
                    commit('updateExtendedSearchParams', extendedSearchParams);
                });
            });
        },
        applyFacets({ dispatch, commit, state }, facetData) {
            HawkSearchVue.applyFacets(facetData, state.pendingSearch.FacetSelections, (facetSelections) => {
                dispatch('fetchResults', { FacetSelections: facetSelections });
            });
        },
        applyPageNumber({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { PageNo: value });
        },
        applyPageSize({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { MaxPerPage: value });
        },
        applySort({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { SortBy: value });
        },
        applySearchWithin({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { SearchWithin: value });
        },
        clearFacet({ dispatch, commit, state }, facet, notReload) {
            var pendingSearch = Object.assign({}, state.pendingSearch);

            if (pendingSearch.hasOwnProperty(facet)) {
                delete pendingSearch[facet];
            }
            else if (pendingSearch.FacetSelections && pendingSearch.FacetSelections.hasOwnProperty(facet)) {
                delete pendingSearch.FacetSelections[facet];
            }

            commit('updatePendingSearch', pendingSearch);

            if (!notReload) {
                dispatch('fetchResults', {});
            }
        }
    }
});