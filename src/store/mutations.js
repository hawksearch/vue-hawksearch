export default {
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
    },
    updateLanguage(state, value){
        state.language = value;
    },
    updateIsFirstInitialSearch(state,value){
        state.isFirstInitialSearch = value;
    },
    updateInitialSearchUrl(state,value){
        state.initialSearchUrl = value;
    }
};
