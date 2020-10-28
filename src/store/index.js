import Vue from 'vue'
import Vuex from 'vuex'
import { updateUrl } from '../QueryString';

Vue.use(Vuex);

export default () => {
    return new Vuex.Store({
        state: {
            storeId: null,
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
            loadingSuggestions: false,
            waitingForInitialSearch: true,
            trackEvent: null
        },
        mutations: {
            setStoreId(state, value) {
                state.storeId = value;
            },
            updateConfig(state, value) {
                state.config = _.merge({}, state.config, value);
            },
            updateResults(state, value) {
                state.searchOutput = value;
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
            setTrackEvent(state, value) {
                state.trackEvent = value;
            }
        },
        actions: {
            fetchResults({ commit, state }, searchParams) {
                var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
                commit('updatePendingSearch', pendingSearch);
                commit('updateSuggestions', null);
                commit('updateLoadingSuggestions', false);
                commit('updateLoadingResults', true);
                updateUrl(state);

                HawksearchVue.fetchResults(pendingSearch, this, (searchOutput, error) => {
                    commit('updateLoadingResults', false);

                    if (searchOutput) {
                        commit('setSearchError', false);

                        var prevResults = _.clone(state.searchOutput);

                        commit('updateResults', searchOutput);

                        if (state.trackEvent) {
                            state.trackEvent.track('searchtracking', {
                                trackingId: searchOutput.TrackingId,
                                typeId: state.trackEvent.getSearchType(pendingSearch, prevResults)
                            });
                        }

                        HawksearchVue.extendSearchData(searchOutput, state.pendingSearch, searchParams, (extendedSearchParams) => {
                            commit('updateExtendedSearchParams', extendedSearchParams);
                        });
                    }
                    else if (error) {
                        commit('updateResults', null);
                        commit('setSearchError', true);
                    }
                    else {
                        commit('updateResults', null);
                    }
                });
            },
            fetchSuggestions({ commit, state }, searchParams) {
                HawksearchVue.fetchSuggestions(searchParams, this, (suggestions) => {
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
                dispatch('fetchResults', { MaxPerPage: value, PageNo: 1 });
            },
            applySort({ dispatch, commit, state }, value) {
                dispatch('fetchResults', { SortBy: value });
            },
            applySearchWithin({ dispatch, commit, state }, value) {
                dispatch('fetchResults', { SearchWithin: value });
            },
            clearFacet({ dispatch, commit, state }, facet) {
                var pendingSearch = Object.assign({}, state.pendingSearch);

                if (pendingSearch.hasOwnProperty(facet)) {
                    delete pendingSearch[facet];
                }
                else if (pendingSearch.FacetSelections && pendingSearch.FacetSelections.hasOwnProperty(facet)) {
                    delete pendingSearch.FacetSelections[facet];
                }

                commit('updatePendingSearch', pendingSearch);
                dispatch('fetchResults', {});
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