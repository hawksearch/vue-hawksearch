import { setRecentSearch, getRecentSearch } from '@/CookieHandler';

function getFacetFieldName(facet) {
    if (!facet) {
        return null;
    }

    if (typeof HawksearchVue?.getFacetParamName === 'function') {
        return HawksearchVue.getFacetParamName(facet);
    }

    return facet.ParamName || facet.Field;
}

function findMatchingFacetValue(selectionValue, facetValues, negationPrefix) {
    if (!facetValues || !facetValues.length) {
        return null;
    }

    for (const facetValue of facetValues) {
        const isDirectMatch = facetValue.Value === selectionValue;
        const isNegatedMatch = negationPrefix && `${negationPrefix}${facetValue.Value}` === selectionValue;

        if (isDirectMatch || isNegatedMatch) {
            return facetValue;
        }

        const nestedMatch = findMatchingFacetValue(selectionValue, facetValue.Children, negationPrefix);

        if (nestedMatch) {
            return nestedMatch;
        }
    }

    return null;
}

function buildSelectionsSnapshot(pendingSearch, searchOutput) {
    const snapshot = {};
    const facets = searchOutput?.Facets || [];
    const facetSelections = pendingSearch?.FacetSelections || {};
    const searchWithin = pendingSearch?.SearchWithin;

    if (!facets.length) {
        if (searchWithin) {
            snapshot.searchWithin = {
                Items: [{ Value: searchWithin, Label: searchWithin }],
                Label: 'Search Within'
            };
        }

        return snapshot;
    }

    const negationPrefix = searchOutput?.NegativeFacetValuePrefix || pendingSearch?.NegativeFacetValuePrefix || '@';

    Object.keys(facetSelections).forEach(field => {
        const selectionValues = facetSelections[field];

        if (!selectionValues || !selectionValues.length) {
            return;
        }

        const facet = facets.find(f => getFacetFieldName(f) === field);

        if (!facet || facet.FieldType === 'tab') {
            return;
        }

        const items = [];

        if (facet.FieldType === 'range') {
            selectionValues.forEach(selectionValue => {
                items.push({
                    Value: selectionValue,
                    Label: selectionValue
                });
            });
        }
        else {
            selectionValues.forEach(selectionValue => {
                const matchedValue = findMatchingFacetValue(selectionValue, facet.Values, negationPrefix);

                if (!matchedValue || !matchedValue.Label) {
                    return;
                }

                items.push({
                    Value: selectionValue,
                    Label: matchedValue.Label,
                    Path: matchedValue.Path
                });
            });
        }

        if (!items.length) {
            return;
        }

        snapshot[field] = {
            Items: items,
            Label: facet.Name
        };
    });

    if (searchWithin) {
        const searchWithinFacet = facets.find(f => getFacetFieldName(f) === 'searchWithin' || f.Field === 'searchWithin');

        snapshot.searchWithin = {
            Items: [{ Value: searchWithin, Label: searchWithin }],
            Label: searchWithinFacet?.Name || 'Search Within'
        };
    }

    return snapshot;
}

function buildSelectionHeadersFromSnapshot(selectionsSnapshot) {
    const headers = {
        PageNo: 1,
        FacetSelections: {}
    };

    Object.keys(selectionsSnapshot || {}).forEach(field => {
        if (field === 'searchWithin') {
            const value = selectionsSnapshot?.searchWithin?.Items?.[0]?.Value;

            if (value !== undefined && value !== null && value !== '') {
                headers.SearchWithin = value;
            }

            return;
        }

        const values = (selectionsSnapshot[field]?.Items || []).map(item => item.Value);

        if (values.length) {
            headers.FacetSelections[field] = values;
        }
    });

    return headers;
}

export default {
    syncSelectionsFromStateSnapshot({ commit, state }) {
        const selections = buildSelectionsSnapshot(state.pendingSearch, state.searchOutput);
        commit('updateSelections', selections);
    },
    fetchResults({ commit, state }, searchParams) {
        return new Promise((resolve, reject) => {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            pendingSearch.Keyword = decodeURIComponent(pendingSearch.Keyword);
            commit('updatePendingSearch', pendingSearch);
            commit('updateSelections', buildSelectionsSnapshot(pendingSearch, state.searchOutput));
            commit('updateSuggestions', null);
            commit('updateLoadingSuggestions', false);
            commit('updateLoadingResults', true);

            HawksearchVue.fetchResults(pendingSearch, this, (searchOutput, error) => {
                commit('updateLoadingResults', false);

                if (searchOutput) {
                    commit('setSearchError', false);
                    commit('updatePrevResults', lodash.clone(state.searchOutput));
                    commit('updateResults', searchOutput);
                    commit('updateSelections', buildSelectionsSnapshot(state.pendingSearch, searchOutput));

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
    applySelectionsSnapshot({ dispatch }, selectionsSnapshot) {
        const headers = buildSelectionHeadersFromSnapshot(selectionsSnapshot);
        return dispatch('fetchResults', headers);
    },
    clearSelectionItem({ dispatch, state }, { field, itemValue }) {
        const selections = lodash.cloneDeep(state.selections || {});

        if (field === 'searchWithin') {
            delete selections.searchWithin;
            return dispatch('applySelectionsSnapshot', selections);
        }

        if (!selections[field]) {
            return Promise.resolve();
        }

        selections[field].Items = (selections[field].Items || []).filter(item => item.Value !== itemValue);

        if (!selections[field].Items.length) {
            delete selections[field];
        }

        return dispatch('applySelectionsSnapshot', selections);
    },
    clearSelectionField({ dispatch, state }, field) {
        const selections = lodash.cloneDeep(state.selections || {});

        if (field === 'searchWithin') {
            delete selections.searchWithin;
            return dispatch('applySelectionsSnapshot', selections);
        }

        if (!selections[field]) {
            return Promise.resolve();
        }

        delete selections[field];

        return dispatch('applySelectionsSnapshot', selections);
    },
    clearAllSelectionsAndSearchWithin({ dispatch }) {
        return dispatch('fetchResults', {
            PageNo: 1,
            FacetSelections: {},
            SearchWithin: undefined
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
                        commit('updateSelections', buildSelectionsSnapshot(state.pendingSearch, newSearchOutput));

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
    },
    updateRecentSearch({ commit }, keyword = null) {
        if (keyword) {
            setRecentSearch(keyword);
        }
        commit("updateRecentSearch", getRecentSearch());
    },
    triggerFacetCollapse({ commit }) {
        commit('setFacetCollapseAllTrigger', true);

        setTimeout(() => {
            commit('setFacetCollapseAllTrigger', null);
        }, 0);
    }
};
