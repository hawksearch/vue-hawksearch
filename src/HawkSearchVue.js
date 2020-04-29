import VueStore from 'src/store'

class HawkSearchVue {
    config = {
        clientGuid: '',
        apiUrl: '',
        dashboardUrl: '',
        searchPageUrl: location.pathname
    }

    static configure(config) {
        if (!config) {
            return false;
        }

        this.config = Object.assign({}, this.config, config);
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

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid });

        Vue.http.post(this.config.apiUrl, params).then(response => {
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

        var field = facet.Field;
        var searchParamFacets = Object.assign({}, pendingSearchFacets);

        // Create or clear the facet values
        searchParamFacets[field] = [];

        facet.Values.forEach(value => {
            if (value.Negated) {
                searchParamFacets[field].push('-' + value.Value);
            }
            else if (value.Selected) {
                searchParamFacets[field].push(value.Value);
            }
        });

        callback(searchParamFacets);
    }
}

export default HawkSearchVue;