import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default () => {
    return new Vuex.Store({
        state: {
            storeId: null,
            config: {}, // defaults are set in HawksearchVue class
            searchOutput: null,
            prevSearchOutput: null,
            suggestions: null,
            pendingSearch: {
                Keyword: "",
                FacetSelections: {}
            },
            extendedSearchParams: {},
            searchError: false,
            loadingResults: false,
            loadingSuggestions: false,
            waitingForInitialSearch: true,
            searchCancelation: null,
            autocompleteCancelation: null
        },
        mutations: {
            setStoreId(state, value) {
                state.storeId = value;
            },
            updateConfig(state, value) {
                state.config = HawksearchVue.mergeConfig(state.config, value);
            },
            updateResults(state, value) {
                state.searchOutput = value;
            },
            updatePrevResults(state, value) {
                state.prevSearchOutput = value;
            },
            updateSuggestions(state, value) {
                state.suggestions = value
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
            },
            updateWaitingForInitialSearch(state, value) {
                state.waitingForInitialSearch = value;
            },
            updateSearchCancelation(state, value) {
                state.searchCancelation = value;
            },
            updateAutocompleteCancelation(state, value) {
                state.autocompleteCancelation = value;
            }
        },
        actions: {
            fetchResults({ commit, state }, searchParams) {
                return new Promise((resolve, reject) => {
                    var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
                    commit('updatePendingSearch', pendingSearch);
                    commit('updateSuggestions', null);
                    commit('updateLoadingSuggestions', false);
                    commit('updateLoadingResults', true);

                    HawksearchVue.fetchResults(pendingSearch, this, (searchOutput, error) => {
                        commit('updateLoadingResults', false);

                        if (searchOutput) {
                            commit('setSearchError', false);
                            commit('updatePrevResults', _.clone(state.searchOutput));
                            commit('updateResults', searchOutput);

                            HawksearchVue.extendSearchData(searchOutput, state.pendingSearch, searchParams, (extendedSearchParams) => {
                                commit('updateExtendedSearchParams', extendedSearchParams);
                                resolve()
                            });
                        }
                        else if (error) {
                            commit('updateResults', null);
                            commit('setSearchError', true);
                            reject()
                        }
                        else {
                            commit('updateResults', null);
                            reject()
                        }
                    });
                });
            },
            fetchSuggestions({ commit, state }, searchParams) {
                return new Promise((resolve, reject) => {
                    HawksearchVue.fetchSuggestions(searchParams, this, (suggestions) => {
                        if (suggestions) {
                            commit('updateLoadingSuggestions', false);
                            commit('updateSuggestions', suggestions);
                            resolve()
                        }
                    });
                });
            },
            applyFacets({ dispatch, commit, state }, facetData) {
                return new Promise((resolve, reject) => {
                    HawksearchVue.applyFacets(facetData, state.pendingSearch.FacetSelections, (facetSelections) => {
                        dispatch('fetchResults', { FacetSelections: facetSelections, PageNo: 1 }).then(() => { resolve() })
                    });
                });
            },
            applyPageNumber({ dispatch, commit, state }, value) {
                return new Promise((resolve, reject) => {
                    dispatch('fetchResults', { PageNo: value }).then(() => { resolve() })
                });
            },
            applyPageSize({ dispatch, commit, state }, value) {
                return new Promise((resolve, reject) => {
                    dispatch('fetchResults', { MaxPerPage: value, PageNo: 1 }).then(() => { resolve() })
                });
            },
            applySort({ dispatch, commit, state }, value) {
                return new Promise((resolve, reject) => {
                    dispatch('fetchResults', { SortBy: value, PageNo: 1 }).then(() => { resolve() })
                });
            },
            applySearchWithin({ dispatch, commit, state }, value) {
                return new Promise((resolve, reject) => {
                    dispatch('fetchResults', { SearchWithin: value, PageNo: 1 }).then(() => { resolve() })
                });
            },
            clearFacet({ dispatch, commit, state }, facet) {
                return new Promise((resolve, reject) => {
                    var pendingSearch = Object.assign({}, state.pendingSearch);

                    if (pendingSearch.hasOwnProperty(facet)) {
                        delete pendingSearch[facet];
                    }
                    else if (pendingSearch.FacetSelections && pendingSearch.FacetSelections.hasOwnProperty(facet)) {
                        delete pendingSearch.FacetSelections[facet];
                    }

                    commit('updatePendingSearch', pendingSearch);
                    dispatch('fetchResults', { PageNo: 1 }).then(() => { resolve() })
                });
            }
        },
        getters: {
            getResponseField: (state) => (fieldName) => {
                var responseFields = fieldName.split('.');
                responseFields.reverse();

                var getResponseProperty = (value, subfield) => {
                    if (subfield && value.hasOwnProperty(subfield)) {
                        return getResponseProperty(value[subfield], responseFields.pop());
                    }
                    else {
                        return value;
                    }
                }

                if (state.searchOutput) {
                    return getResponseProperty(state.searchOutput, responseFields.pop());
                }
            },
            tabSelection: (state) => {
                if (state.searchOutput) {
                    var tabFacet = state.searchOutput.Facets.find(facet => facet.FieldType == 'tab');

                    if (tabFacet) {
                        return tabFacet.Values.find(value => value.Selected == true);
                    }
                }
            }
        }
    })
}