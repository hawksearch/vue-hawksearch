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
            FacetSelections: {},
            ClientGuid: this.config.clientGuid
        }).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        });
    }
}

export default HawkSearchVue;