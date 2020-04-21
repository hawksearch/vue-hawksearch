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

    static fetchResults(searchParams, callback) {
        if (!Vue.http) {
            callback(false);
            return false;
        }

        Vue.http.post(this.config.apiUrl, {
            Keyword: searchParams.keyword,
            FacetSelections: {},
            ClientGuid: this.config.clientGuid
        }).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data.Results);
            }
        });
    }
}

export default HawkSearchVue;