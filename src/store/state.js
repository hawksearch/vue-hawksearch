export default {
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
    autocompleteCancelation: null,
    language: null,
    isFirstInitialSearch: true,
    initialSearchUrl: null,
    recentSearch: {}
};
