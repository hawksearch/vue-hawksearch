import { default as VueStore } from './store';

class HawkSearchVue {
    static config = {
        clientGuid: '',
        apiUrl: 'https://searchapi-dev.hawksearch.net',
        searchUrl: '/api/v2/search',
        autocompleteUrl: '/api/autocomplete',
        dashboardUrl: '',
        searchPageUrl: location.pathname,
        indexName: null,
        indexNameRequired: false
    }

    static configurationApplied = false
    static suggestionRequest = null

    static configure(config) {
        if (!config) {
            return false;
        }

        this.config = Object.assign({}, this.config, config);
        VueStore.commit('updateConfig', this.config);

        if (!this.configurationApplied) {
            this.addTemplateOverride();
        }

        this.configurationApplied = true;
    }

    static initialSearch() {
        var getUrlParams = function () {
            var search = location.search.match(/\?(.*)/);
            var urlParams = {};

            if (search && search.length) {
                var pairs = search[1].split('&');
                pairs.map(pair => {
                    let keyValue = pair.split('=');

                    if (keyValue.length > 1) {
                        let key = keyValue[0];
                        let value = keyValue[1];

                        urlParams[key] = value;
                    }
                })
            }

            return urlParams;
        }

        var urlParams = getUrlParams();
        var initialSearchParams = {};

        if (urlParams.keyword) {
            initialSearchParams = { Keyword: urlParams.keyword };
        }

        if (!this.config.indexName && urlParams.indexName) {
            this.config.indexName = urlParams.indexName;
            this.configure({});
        }

        VueStore.dispatch('fetchResults', initialSearchParams);
    }

    static fetchResults(searchParams, callback) {
        if (!this.requestConditionsMet()) {
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid, IndexName: this.config.indexName });

        this.cancelSuggestionsRequest();

        Vue.http.post(this.getFullSearchUrl(), params).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        }, response => {
            callback(false);
        });
    }

    static fetchSuggestions(searchParams, callback) {
        if (!this.requestConditionsMet()) {
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid, IndexName: this.config.indexName, DisplayFullResponse: true });

        Vue.http.post(this.getFullAutocompleteUrl(), params, {
            before(request) {
                // TOOD: Fix scope
                HawkSearchVue.cancelSuggestionsRequest();
                HawkSearchVue.suggestionRequest = request;
            }
        }).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        }, response => {
            callback(false);
        });

    }

    static cancelSuggestionsRequest() {
        if (this.suggestionRequest) {
            this.suggestionRequest.abort();
        }
    }

    static requestConditionsMet() {
        if (!Vue.http) {
            return false;
        }

        if (!this.configurationApplied) {
            return false;
        }

        if (this.config.indexNameRequired && !this.config.indexName) {
            return false;
        }

        return true;
    }

    static extendSearchData(searchOutput, pendingSearch, callback) {
        if (!callback) {
            callback = function () { };
        }

        if (!searchOutput || !pendingSearch) {
            callback(null);
            return false;
        }

        var extendedSearchParams = Object.assign({}, searchOutput);
        var paramPool = pendingSearch.FacetSelections;

        var handleSelections = (options, param) => {
            options.map(value => {
                value.Selected = Boolean(paramPool[this.getFacetParamName(param)].find(param => {
                    return param == value.Value
                }));

                value.Negated = Boolean(paramPool[this.getFacetParamName(param)].find(param => {
                    return param == ('-' + value.Value)
                }));

                if (value.Negated) {
                    value.Selected = true;
                }

                if (value.Children && value.Children.length) {
                    handleSelections(value.Children, param);
                }
            });
        }

        extendedSearchParams.Facets.map(facet => {
            if (facet.Values && facet.Values.length && paramPool.hasOwnProperty(this.getFacetParamName(facet))) {
                handleSelections(facet.Values, facet);
            }

            if (facet.Values && facet.Values.length && facet.SwatchData && facet.SwatchData.length) {
                facet.Values = facet.Values.map(facetValue => {
                    return Object.assign({}, facet.SwatchData.find(item => item.Value.toLowerCase() == facetValue.Value.toLowerCase()), facetValue);
                });

                facet.Values = facet.Values.filter(item => Boolean(item.AssetName));
            }

            return facet;
        });

        callback(extendedSearchParams);
    }

    static applyFacets(facet, pendingSearchFacets, callback) {
        if (!callback) {
            callback = function () { };
        }

        if (!facet || !pendingSearchFacets) {
            callback({})
            return false;
        }

        var field = this.getFacetParamName(facet);
        var searchParamFacets = Object.assign({}, pendingSearchFacets);

        // Create or clear the facet values
        searchParamFacets[field] = [];

        var handleCheckboxes = function (options) {
            options.forEach(value => {
                if (value.Negated) {
                    searchParamFacets[field].push('-' + value.Value);
                }
                else if (value.Selected) {
                    searchParamFacets[field].push(value.Value);
                }

                if (value.Children && value.Children.length) {
                    handleCheckboxes(value.Children);
                }
            });
        }

        switch (facet.FacetType) {
            case 'checkbox':
            case 'nestedcheckbox':
            case 'swatch':
                handleCheckboxes(facet.Values);

                if (searchParamFacets[field].length == 0) {
                    delete searchParamFacets[field];
                }
                break;

            case 'openRange':
                searchParamFacets[field].push(facet.Value);
                break;
        }

        callback(searchParamFacets);
    }

    static getFacetParamName(facet) {
        return facet.ParamName ? facet.ParamName : facet.Field;
    }

    // Overrides the template prioritization
    // If the 'templateOverride' configuration is available, it overrides all other templates
    static addTemplateOverride() {
        if (!Vue) {
            return false;
        }

        const mount = Vue.prototype.$mount;

        Vue.prototype.$mount = function (el, hydrating) {
            const options = this.$options;

            if (options.templateOverride &&
                typeof options.templateOverride === 'string' &&
                options.templateOverride.charAt(0) === '#' &&
                document.querySelector(options.templateOverride)) {

                let renderFunctions = Vue.compile(document.querySelector(options.templateOverride).innerHTML);
                Object.assign(options, renderFunctions);
            }

            return mount.call(this, el, hydrating);
        }
    }

    static isGlobal() {
        if (this.config.searchPageUrl == location.pathname) {
            return false
        }
        else {
            return true;
        }
    }

    static redirectSearch(keyword) {
        var redirect = this.config.searchPageUrl + '?keyword=' + keyword;

        location.assign(redirect);
    }

    static getFullSearchUrl() {
        let url = new URL(this.config.searchUrl, this.config.apiUrl);
        return url.href;
    }

    static getFullAutocompleteUrl() {
        let url = new URL(this.config.autocompleteUrl, this.config.apiUrl);
        return url.href;
    }
}

export default HawkSearchVue;