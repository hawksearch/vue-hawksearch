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

        if (urlParams.keyword) {
            VueStore.dispatch('fetchResults', { keyword: urlParams.keyword });
        }
    }

    static fetchResults(searchParams, callback) {
        if (!Vue.http) {
            callback(false);
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        Vue.http.post(this.config.apiUrl, {
            Keyword: searchParams.keyword,
            FacetSelections: searchParams,
            ClientGuid: this.config.clientGuid
        }).then(response => {
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

        var extendParam = function (param) {
            if (param && param.Field && pendingSearch.hasOwnProperty(param.Field)) {
                if (param.Values.length) {
                    param.Values.map(value => {
                        value.Selected = Boolean(pendingSearch[param.Field].find(param => {
                            return param == value.Value
                        }));

                        value.Negated = Boolean(pendingSearch[param.Field].find(param => {
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
            return extendParam(facet);
        });

        callback(extendedSearchParams);
    }

    static applyFacets(facet, pendingSearch, callback) {
        if (!callback) {
            callback = function () { };
        }

        if (!facet || !pendingSearch) {
            callback({})
            return false;
        }

        var field = facet.Field;
        var searchParams = Object.assign({}, pendingSearch);

        // Create or clear the facet values
        searchParams[field] = [];

        facet.Values.forEach(value => {
            if (value.Negated) {
                searchParams[field].push('-' + value.Value);
            }
            else if (value.Selected) {
                searchParams[field].push(value.Value);
            }
        });

        callback(searchParams);
    }
}

export default HawkSearchVue;