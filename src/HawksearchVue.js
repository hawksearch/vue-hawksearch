import HawksearchStore from './store';
import { mapState } from 'vuex';
import i18n from './i18n';
import { parseSearchQueryString } from './QueryString';
import SearchBox from './components/search-box/SearchBox';
import FacetList from './components/facets/FacetList.vue';
import Results from './components/results/Results.vue';
import TrackingEvent from './TrackingEvent';

var _ = require('lodash');

class HawksearchVue {
    static config = {
        clientGuid: '',
        apiUrl: 'https://searchapi-dev.hawksearch.net',
        searchUrl: '/api/v2/search',
        autocompleteUrl: '/api/autocomplete',
        dashboardUrl: '',
        websiteUrl: location.origin,
        trackEventUrl: null,
        indexName: null,
        indexNameRequired: false,
        additionalParameters: {},
        searchBoxConfig: {
            reloadOnEmpty: false,
            redirectOnEmpty: false,
            redirectToCurrentPage: false
        },
        facetConfig: {},
        tabConfig: {
            alwaysOn: true
        },
        urlUpdate: {
            enabled: true,
            parameters: null
        },
        language: null
    }

    static storeInstances = {}

    static init() {
        this.addTemplateOverride();
    }

    static getStoreInstance(config) {
        var store;
        var storeInstance;
        var urlParams = this.getUrlParams();
        var appliedConfig = Object.assign({}, this.config, config);

        Object.keys(this.storeInstances).forEach(storeKey => {
            storeInstance = this.storeInstances[storeKey];

            if (_.isEqual(_.cloneDeep(storeInstance.state.config), _.cloneDeep(appliedConfig))) {
                store = storeInstance;
            }
        });

        if (!store) {
            store = HawksearchStore();
            var storeId = this.getUniqueIdentifier();

            // apply the index name if it is not initally configured and available from the URL
            if (!appliedConfig.indexName && urlParams.get('indexName')) {
                appliedConfig.indexName = urlParams.get('indexName');
            }

            store.commit('updateConfig', appliedConfig);
            store.commit('setStoreId', storeId);
            store.commit('setTrackEvent', this.createTrackEvent(appliedConfig));

            this.storeInstances[storeId] = store;
        }

        return store;
    }

    static createWidget(el, { config, store }) {
        if (!el || (!config && !store)) {
            return false;
        }

        if (!store) {
            store = this.getStoreInstance(config);
        }

        if (!config) {
            config = _.cloneDeep(this.config);
        }

        return new Vue({
            el,
            store,
            i18n,
            components: {
                SearchBox,
                FacetList,
                Results
            },
            mounted() {
                try {
                    if (store.state.trackEvent) {
                        store.state.trackEvent.track('pageload', { pageType: (config.additionalParameters && config.additionalParameters.CustomUrl) ? 'landing' : 'custom' });
                    }
                }
                catch (e) { }
            },
            data: {
                appliedConfig: config
            },
            computed: {
                ...mapState([
                    'searchOutput',
                    'pendingSearch'
                ]),
                config: function () {
                    return _.merge({}, this.$store.state.config, this.appliedConfig)
                }
            },
            watch: {
                searchOutput: function (n, o) {
                    this.$emit('resultsupdate', n);
                },
                pendingSearch: function (n, o) {
                    this.$emit('searchupdate', n);
                }
            }
        });
    }

    static getWidgetStore(widget) {
        if (widget) {
            return widget.$store
        }
    }

    static getUrlParams() {
        var urlObj = new URL(location.href);

        return urlObj.searchParams;
    }

    static initialSearch(widget) {
        if (!widget) {
            console.error('Widget not supplied');
            return false;
        }

        var store = widget.$store;

        if (!store) {
            console.error("Store instance not supplied");
            return false
        }

        var urlParams = this.getUrlParams();
        var additionalParameters = {};

        this.paramWhitelist.forEach(key => {
            if (urlParams.get(key)) {
                additionalParameters[key] = urlParams.get(key);
            }
        });

        if (Object.keys(additionalParameters).length) {
            var config = Object.assign({}, store.state.config);
            config.additionalParameters = Object.assign({}, additionalParameters, config.additionalParameters);
            store.commit('updateConfig', config);
        }

        var searchParams = parseSearchQueryString(location.search);
        var language = searchParams['Language'];
        delete searchParams['Language'];
        if (language) {
            var config = Object.assign({}, store.state.config);
            config.language = language;
            store.commit('updateConfig', config);
        }

        store.dispatch('fetchResults', searchParams);
    }

    static fetchResults(searchParams, store, callback) {
        if (!callback) {
            callback = function () { };
        }

        if (!this.requestConditionsMet(store)) {
            callback(false)
            return false;
        }

        if (!searchParams) {
            searchParams = {};
        }

        var config = store.state.config;
        var params = Object.assign({}, searchParams, { ClientGuid: config.clientGuid, IndexName: config.indexName }, config.additionalParameters);

        this.cancelSuggestionsRequest();

        store.commit('updateWaitingForInitialSearch', false);

        Vue.http.post(this.getFullSearchUrl(store), params).then(response => {
            if (response.status == '200' && response.data) {
                this.searchResponseDataHandler(response.data, store, callback);
            }
        }, response => {
            callback(false, true);
        });
    }

    static searchResponseDataHandler(data, store, callback) {
        if (data.Results.length && data.Facets.find(facet => facet.FieldType == 'tab')) {
            var tabs = data.Facets.find(facet => facet.FieldType == 'tab');

            if (!tabs.Values.find(value => value.Selected == true) && store.state.config.tabConfig.alwaysOn) {
                var facetData = Object.assign({}, tabs);

                facetData.Values[0].Selected = true;

                store.dispatch('applyFacets', facetData);
            }
            else {
                callback(data);
            }
        }
        else {
            callback(data);
        }
    }

    static fetchSuggestions(searchParams, store, callback) {
        if (!this.requestConditionsMet(store)) {
            return false;
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var config = store.state.config;
        var params = Object.assign({}, searchParams, { ClientGuid: config.clientGuid, IndexName: config.indexName, DisplayFullResponse: true });

        Vue.http.post(this.getFullAutocompleteUrl(store), params, {
            before(request) {
                // TOOD: Fix scope
                HawksearchVue.cancelSuggestionsRequest();
                HawksearchVue.suggestionRequest = request;
            }
        }).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        }, response => {
            callback(false);
        });

    }

    static suggestionRequest = null

    static cancelSuggestionsRequest() {
        if (this.suggestionRequest) {
            this.suggestionRequest.abort();
        }
    }

    static sanitizeParams(params) {
        // Check for specific edge cases
        if (params.hasOwnProperty('Keyword') && params.hasOwnProperty('CustomUrl')) {
            delete params.CustomUrl;
        }

        return params
    }

    static requestConditionsMet(store) {
        if (!Vue.http) {
            console.error("Vue http missing");
            return false;
        }

        if (!store) {
            console.error("Store instance not supplied");
            return false;
        }

        var config = store.state.config;

        if (config.indexNameRequired && !config.indexName) {
            console.error("Index name is required to execute the request");
            return false;
        }

        return true;
    }

    static extendSearchData(searchOutput, pendingSearch, searchParams, callback) {
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
            else if (facet.Values && facet.Values.length && facet.Ranges && facet.Ranges.length) {
                facet.Values = facet.Values.map(facetValue => {
                    return Object.assign({}, facet.Ranges.find(item => item.Value.toLowerCase() == facetValue.Value.toLowerCase()), facetValue);
                });
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
            case 'slider':
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

    static redirectSearch(keyword, store, searchPageUrl) {
        var redirect = new URL(searchPageUrl, location.href);
        var config = store.state.config;

        if (keyword) {
            redirect.searchParams.set('keyword', keyword);
        }

        if (config.indexName) {
            redirect.searchParams.set('indexName', config.indexName);
        }

        for (let [key, value] of Object.entries(config.additionalParameters)) {
            if (this.isWhitelistedParam(key)) {
                redirect.searchParams.set(key, value);
            }
        }

        if (keyword || config.searchBoxConfig.redirectOnEmpty) {
            location.assign(redirect.href);
        }
    }

    static paramWhitelist = ['CustomUrl']

    static isWhitelistedParam(key) {
        return this.paramWhitelist.includes(key);
    }

    static getFullSearchUrl(store) {
        var config = store.state.config;
        let url = new URL(config.searchUrl, config.apiUrl);
        return url.href;
    }

    static getFullAutocompleteUrl(store) {
        var config = store.state.config;
        let url = new URL(config.autocompleteUrl, config.apiUrl);
        return url.href;
    }

    static getUniqueIdentifier() {
        return _.times(16, () => (Math.random() * 0xF << 0).toString(16)).join('');
    }

    static getAbsoluteUrl(path, store) {
        var config = store.state.config;
        var url = new URL(path, config.websiteUrl);
        return url.href;
    }

    static createTrackEvent(config) {
        var trackEvent;

        if (config.trackEventUrl) {
            trackEvent = new TrackingEvent(config);
        }

        return trackEvent;
    }

    static getTrackEvent(component) {
        if (component && component.$root && component.$root.$store) {
            return component.$root.$store.state.trackEvent;
        }
    }

    static isIE() {
        var ua = window.navigator.userAgent;
        var old_ie = ua.indexOf('MSIE ');
        var new_ie = ua.indexOf('Trident/');

        return ((old_ie > -1) || (new_ie > -1))
    }

    static loadPolyfills() {
        if (this.isIE()) {
            var polyfillElement = document.createElement('script');
            polyfillElement.setAttribute('src', 'https://cdn.polyfill.io/v3/polyfill.min.js?features=fetch');
            document.head.appendChild(polyfillElement);
        }
    }

}

export default HawksearchVue;
