import { default as VueStore } from './store';

class HawkSearchVue {
    static config = {
        clientGuid: '',
        apiUrl: 'https://searchapi-dev.hawksearch.net',
        searchUrl: '/api/v2/search',
        autocompleteUrl: '/api/autocomplete',
        dashboardUrl: '',
        searchPageUrl: location.pathname,
        indexName: '',
        indexRequired: false
    }

    static configure(config) {
        if (!config) {
            return false;
        }

        this.config = Object.assign({}, this.config, config);
        VueStore.commit('updateConfig', this.config);

        this.addTemplateOverride();
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

        VueStore.dispatch('fetchResults', initialSearchParams);
    }

    static fetchResults(searchParams, callback) {
        if (!Vue.http) {
            callback(false);
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid, IndexName: this.config.indexName });

        Vue.http.post(this.getFullSearchUrl(), params).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        });
    }

    static fetchSuggestions(searchParams, callback) {
        if (!Vue.http) {
            callback(false);
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid, IndexName: this.config.indexName, DisplayFullResponse: true });

        Vue.http.post(this.getFullAutocompleteUrl(), params).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        });
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

        var extendParam = function (param, paramPool) {
            if (param && param.Field && paramPool.hasOwnProperty(param.Field)) {
                if (param.Values.length) {
                    param.Values.map(value => {
                        value.Selected = Boolean(paramPool[param.Field].find(param => {
                            return param == value.Value
                        }));

                        value.Negated = Boolean(paramPool[param.Field].find(param => {
                            return param == ('-' + value.Value)
                        }));

                        if (value.Negated) {
                            value.Selected = true;
                        }

                        return value;
                    });
                }

                return param;
            }
        }

        extendedSearchParams.Facets.map(facet => {
            return extendParam(facet, pendingSearch.FacetSelections);
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

        var field = facet.ParamName ? facet.ParamName : facet.Field;
        var searchParamFacets = Object.assign({}, pendingSearchFacets);

        // Create or clear the facet values
        searchParamFacets[field] = [];

        if (facet.FacetType == 'checkbox') {
            facet.Values.forEach(value => {
                if (value.Negated) {
                    searchParamFacets[field].push('-' + value.Value);
                }
                else if (value.Selected) {
                    searchParamFacets[field].push(value.Value);
                }
            });

            if (searchParamFacets[field].length == 0) {
                delete searchParamFacets[field];
            }
        }
        else if (facet.FacetType == 'openRange') {
            searchParamFacets[field].push(facet.Value);
        }

        callback(searchParamFacets);
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