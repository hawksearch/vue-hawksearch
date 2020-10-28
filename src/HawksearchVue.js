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
    static defaultConfig = {
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

    static widgetInstances = {}

    static storeInstances = {}

    static init() {
        this.addTemplateOverride();
    }

    static generateStoreInstance(appliedConfig) {
        var store = HawksearchStore();
        var storeId = this.getUniqueIdentifier();

        store.commit('updateConfig', appliedConfig);
        store.commit('setStoreId', storeId);

        // TODO: Refactor track events
        //store.commit('setTrackEvent', this.createTrackEvent(appliedConfig));

        this.storeInstances[storeId] = store;

        return store;
    }

    static createWidget(el, { config, store }) {
        if (!el || (!config && !store)) {
            return false;
        }

        // Generate a store instance to attach to widget
        // This is the base create sequence
        if (!store) {
            store = this.generateStoreInstance(config);
        }

        // If the store is passed as a create argument the config is anyway attached to the widget
        // The default one is used if not provided
        if (!config) {
            config = _.cloneDeep(this.defaultConfig);
        }

        var widgetId = this.getUniqueIdentifier();

        var widget = new Vue({
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
                    this.trackEvent = HawksearchVue.createTrackEvent(this.config);
        
                    if (this.trackEvent) {
                        this.trackEvent.track('pageload', { pageType: (this.config.additionalParameters && this.config.additionalParameters.CustomUrl) ? 'landing' : 'custom' });
                    }
                }
                catch (e) { }
            },
            data: {
                widgetId,
                appliedConfig: config,
                trackEvent: null
            },
            computed: {
                ...mapState([
                    'searchOutput',
                    'pendingSearch'
                ]),
                config: function () {
                    return _.merge({}, _.cloneDeep(this.$store.state.config), this.appliedConfig)
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

        this.widgetInstances[widgetId] = widget;

        return widget;
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

        var store = this.getWidgetStore(widget);

        if (!store) {
            console.error("Store instance not supplied");
            return false
        }

        this.handleAdditionalParameters(widget);

        var searchParams = parseSearchQueryString(location.search);

        this.handleLanguageParameters(widget, searchParams);

        store.dispatch('fetchResults', searchParams).then(() => {
            this.applyTabSelection(widget);
        });
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
                callback(response.data);
            }
        }, response => {
            callback(false, true);
        });
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

    static redirectSearch(keyword, widget, searchPageUrl) {
        var redirect = new URL(searchPageUrl, location.href);
        var config = widget.config;

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

    static addWhitelistParams(params) {
        if (params) {
            if (typeof params == 'string') {
                params = [params];
            }

            if (_.isArray(params)) {
                this.paramWhitelist = _.union(this.paramWhitelist, params);
            }
        }
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
        if (path) {
            var config = store.state.config;
            var url = new URL(path, config.websiteUrl);
            return url.href;
        }
    }

    static createTrackEvent(config) {
        var trackEvent;

        if (config.trackEventUrl) {
            trackEvent = new TrackingEvent(config);
        }

        return trackEvent;
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

    static handleAdditionalParameters(widget) {
        var store = this.getWidgetStore(widget);
        var urlParams = this.getUrlParams();
        var additionalParameters = {};

        this.paramWhitelist.forEach(key => {
            if (urlParams.get(key)) {
                additionalParameters[key] = urlParams.get(key);
            }
        });

        if (Object.keys(additionalParameters).length) {
            var config = _.cloneDeep(widget.config);
            config.additionalParameters = _.merge({}, config.additionalParameters, additionalParameters);
            store.commit('updateConfig', config);
        }
    }

    static handleLanguageParameters(widget, searchParams) {
        var store = this.getWidgetStore(widget);
        var language = searchParams['Language'];

        delete searchParams['Language'];

        if (language) {
            var config = _.cloneDeep(widget.config);
            config.language = language;
            store.commit('updateConfig', config);
        }
    }

    static applyTabSelection(widget) {
        var store = this.getWidgetStore(widget);
        var data = store.state.searchOutput;

        if (data.Results.length && data.Facets.find(facet => facet.FieldType == 'tab')) {
            var tabs = data.Facets.find(facet => facet.FieldType == 'tab');

            if (!tabs.Values.find(value => value.Selected == true) && widget.config.tabConfig.alwaysOn) {
                var facetData = Object.assign({}, tabs);

                facetData.Values[0].Selected = true;

                store.dispatch('applyFacets', facetData);
            }
        }
    }

}

export default HawksearchVue;
