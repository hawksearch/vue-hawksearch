import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        config: {}, // defaults are set in HawksearchVue class
        searchOutput: null,
        suggestions: null,
        pendingSearch: {
            Keyword: "",
            FacetSelections: {}
        },
        extendedSearchParams: {},
        searchError: false,
        loadingResults: false,
        loadingSuggestions: false
    },
    mutations: {
        updateConfig(state, value) {
            state.config = Object.assign({}, state.config, value);
        },
        updateResults(state, value) {
            state.searchOutput = value;
        },
        updateSuggestions(state, value) {
            state.suggestions = value;
        },
        updatePendingSearch(state, value) {
            state.pendingSearch = value;
        },
        updateExtendedSearchParams(state, value) {
            state.extendedSearchParams = value;
        },
        setSearchError(state, value) {
            state.searchError = value
        },
        updateLoadingResults(state, value) {
            state.loadingResults = value;
        },
        updateLoadingSuggestions(state, value) {
            state.loadingSuggestions = value;
        }
    },
    actions: {
        fetchResults({ commit, state }, searchParams) {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            commit('updatePendingSearch', pendingSearch);
            commit('updateSuggestions', null);
            commit('updateLoadingSuggestions', false);
            commit('updateLoadingResults', true);

            HawksearchVue.fetchResults(pendingSearch, (searchOutput) => {
                commit('updateLoadingResults', false);

                if (searchOutput) {
                    commit('setSearchError', false);
                    commit('updateResults', searchOutput);

                    HawksearchVue.extendSearchData(searchOutput, state.pendingSearch, (extendedSearchParams) => {
                        commit('updateExtendedSearchParams', extendedSearchParams);
                    });
                }
                else {
                    commit('updateResults', null);
                    commit('setSearchError', true);
                }
            });
        },
        fetchSuggestions({ commit, state }, searchParams) {
            HawksearchVue.fetchSuggestions(searchParams, (suggestions) => {
                if (suggestions) {
                    commit('updateLoadingSuggestions', false);
                    commit('updateSuggestions', suggestions);
                }
            });
        },
        applyFacets({ dispatch, commit, state }, facetData) {
            HawksearchVue.applyFacets(facetData, state.pendingSearch.FacetSelections, (facetSelections) => {
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