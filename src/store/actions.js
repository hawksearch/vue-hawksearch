export default {
    fetchResults({ commit, state }, searchParams) {
        return new Promise((resolve, reject) => {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            pendingSearch.Keyword = decodeURIComponent(pendingSearch.Keyword);
            commit('updatePendingSearch', pendingSearch);
            commit('updateSuggestions', null);
            commit('updateLoadingSuggestions', false);
            commit('updateLoadingResults', true);

            HawksearchVue.fetchResults(pendingSearch, this, (searchOutput, error) => {
                commit('updateLoadingResults', false);

                if (searchOutput) {
                    commit('setSearchError', false);
                    commit('updatePrevResults', lodash.clone(state.searchOutput));
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
    fetchRecommendations({ commit }, widgetParams) {
        return new Promise((resolve, reject) => {
            HawksearchVue.fetchRecommendations(this, widgetParams, (recommendationsOutput, error) => {
                if (recommendationsOutput) {
                    resolve(recommendationsOutput)
                }
                else if (error) {
                    reject()
                }
                else {
                    reject()
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
    },
    loadMoreResults({ dispatch, commit, state }) {
        return new Promise((resolve, reject) => {
            var page = state.searchOutput.Pagination.CurrentPage + 1;

            if (page >= 1 && page <= state.searchOutput.Pagination.NofPages) {
                var searchParams = { PageNo: page };
                var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
                commit('updatePendingSearch', pendingSearch);
                commit('updateSuggestions', null);
                commit('updateLoadingSuggestions', false);
                commit('updateLoadingResults', true);

                HawksearchVue.fetchResults(pendingSearch, this, (searchOutput, error) => {
                    commit('updateLoadingResults', false);

                    if (searchOutput) {
                        var currentSearchOutput = lodash.clone(state.searchOutput);
                        var newSearchOutput = lodash.clone(searchOutput);

                        newSearchOutput.Results = lodash.concat(currentSearchOutput.Results, newSearchOutput.Results);

                        commit('setSearchError', false);
                        commit('updatePrevResults', currentSearchOutput);
                        commit('updateResults', newSearchOutput);

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
            }
        });
    }
};
