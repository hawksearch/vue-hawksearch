import { default as getVueStore } from './store';
import { mapState } from 'vuex';
import i18n from './i18n';
import { parseSearchQueryString, updateUrl } from './QueryString';
import SearchBox from './components/search-box/SearchBox';
import FacetList from './components/facets/FacetList.vue';
import Results from './components/results/Results.vue';
import PageContent from './components/results/PageContent.vue';
import Recommendations from './components/results/recommendations/Recommendations.vue';
import TrackingEvent from './TrackingEvent';
import { getVisitorId, getVisitId } from './CookieHandler';

var _ = require('lodash');
var axios = require('axios').default;
const CancelToken = axios.CancelToken;

class HawksearchVue {
    static defaultConfig = {
        clientGuid: '',
        apiUrl: 'https://searchapi-dev.hawksearch.net',
        searchUrl: '/api/v2/search',
        autocompleteUrl: '/api/autocomplete',
        recommendationUrl: '/api/recommendation/v2/getwidgetitems',
        dashboardUrl: '',
        widgetGuid: null,
        widgetUniqueid: null,
        websiteUrl: location.origin,
        trackEventUrl: null,
        indexName: null,
        indexNameRequired: false,
        language: null,
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
        searchConfig: {
            scrollUpOnRefresh: true
        },
        resultItem: {
            itemSelect: true,
            linkField: 'url',
            langIndiffFields: []
        },
        suggestionItem: {
            linkField: 'link',
            titleField: 'title'
        },
        pagination:{
            type: "dispatch"
        }
    }

    static widgetInstances = {}

    static storeInstances = {}

    static init() {
        this.addTemplateOverride();
    }

    static generateStoreInstance(appliedConfig, storeOverrides) {
        if (!storeOverrides) {
            storeOverrides = {}
        }

        var store = getVueStore(storeOverrides);
        var storeId = this.getUniqueIdentifier();

        var config = this.mergeConfig(this.defaultConfig, appliedConfig);

        store.commit('updateConfig', config);
        store.commit('setStoreId', storeId);

        this.storeInstances[storeId] = store;

        // console.info("Created store, id: " + storeId);

        return store;
    }

    /**
     * Creates the widget instance
     * This widget is the wrapping entity that holds all the structural logic
     * @param {HTMLElement} / @param {String} el The target element on which the widget is rendered
     * @param {Object} param1 Object containing the config object or/and Vuex store instance
     *
     *      Examples:
     *          1. HawksearchVue.createWidget(el, { config }): The most basic instance initialization.
     *          It creates a Vue widget based on the passed config object. The config object is initially enriched with
     *          the default values if they are missing. A store instance is created to manage the data handling.
     *
     *          2. HawksearchVue.createWidget(el, { config, store }): This construct also creates a widget instance, but
     *          instead of creating a store instance, attaches the one provided. The provided store instance is retrivied
     *          from another widget. This way the two or more widgets are using the same data layer and all data driven
     *          actions are performed on all of them. The provided config object ensures that all widget specific
     *          handling is managed separetely from other synchronized widges.
     *
     *          3. HawksearchVue.createWidget(el, { store }): An edge case of Ex. 2. The created widget is fully synchronized
     *          with the provided data layer. It doesn't have specific context and behavior.
     */
    static createWidget(el, { config, store }) {
        if (!el || (!config && !store)) {
            return false;
        }

        var widgetId = this.getUniqueIdentifier();

        // Generate a store instance to attach to widget
        // This is the base create sequence
        if (!store) {
            // console.info("Create widget, id: " + widgetId + ", single initialization");

            // Fill in the default values for the config
            config = this.mergeConfig(this.defaultConfig, config);

            store = this.generateStoreInstance(config);
        }
        // If store instance is avalable, update it with the new config, if provided
        else if (config) {
            // console.info("Create widget, id: " + widgetId + ", attached to existing data layer (" + store.state.storeId + "), specific configuration");

            // Extend the existing store config
            config = this.mergeConfig(store.state.config, config);

            store.commit('updateConfig', config);
        }
        // If the store instance is available, but the config is not, create a default config to keep things consistent
        else {
            // console.info("Create widget, id: " + widgetId + ", attached to existing data layer (" + store.state.storeId + "), using existing configuration");
            config = this.mergeConfig(this.defaultConfig, store.state.config);
        }

        var widget = new Vue({
            el,
            store,
            i18n,
            components: {
                SearchBox,
                FacetList,
                Results,
                PageContent,
                Recommendations
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
                    return _.cloneDeep(this.appliedConfig);
                }
            },
            watch: {
                searchOutput: function (n, o) {
                    this.$emit('resultsupdate', n);
                },
                pendingSearch: function (n, o) {
                    this.$emit('searchupdate', n);
                }
            },
            methods: {
                dispatchToStore: function (action, params) {
                    this.$store.dispatch(action, params).then(() => {
                        var trackingActions = [
                            'fetchResults',
                            'applyFacets',
                            'applyPageNumber',
                            'applyPageSize',
                            'applySort',
                            'applySearchWithin',
                            'clearFacet',
                        ];

                        if (trackingActions.includes(action)) {
                            var storeState = this.$store.state;

                            updateUrl(storeState, this).then(() => {
                              this.$emit('urlUpdated');
                            });

                            if (this.trackEvent) {
                                this.trackEvent.track('searchtracking', {
                                    trackingId: storeState.searchOutput.TrackingId,
                                    typeId: this.trackEvent.getSearchType(storeState.pendingSearch, storeState.prevSearchOutput)
                                });
                            }
                        }

                        var pageLoadingActions = [
                            'fetchResults',
                            'applyFacets',
                            'applyPageNumber',
                            'applyPageSize',
                            'applySort',
                            'applySearchWithin',
                            'clearFacet',
                        ];

                        if (pageLoadingActions.includes(action)) {
                            HawksearchVue.scrollToBeginning(this);
                        }
                    });
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
            this.truncateFacetSelections(store);
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

        if (store.state.searchCancelation) {
            store.state.searchCancelation();
            store.commit('updateSearchCancelation', null);
        }

        if (!searchParams) {
            searchParams = {};
        }

        var config = store.state.config;
        var clientData = this.getClientData(store);
        var params = Object.assign({}, searchParams,
            {
                ClientGuid: config.clientGuid,
                IndexName: this.getIndexName(config),
                ClientData: clientData
            },
            config.additionalParameters);

        this.cancelSuggestionsRequest();

        store.commit('updateWaitingForInitialSearch', false);

        axios.post(this.getFullSearchUrl(store), params, {
            cancelToken: new CancelToken(function executor(c) {
                store.commit('updateSearchCancelation', c);
            })
        }).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        }).catch(err => {
            if (!axios.isCancel(err)) {
                callback(false, true);
            }
        });
    }

    static fetchRecommendations(store, widgetParams, callback) {
        if (!callback) {
            callback = function () { };
        }

        if (!this.requestConditionsMet(store)) {
            callback(false)
            return false;
        }

        var config = store.state.config;
        var params = {
                ClientGuid: config.clientGuid,
                IndexName: this.getIndexName(config),
                DisplayFullResponse: true,
                visitId: getVisitId(),
                visitorId: getVisitorId(),
                enablePreview: true,
                widgetUids: [
                   {
                      widgetGuid: widgetParams.widgetGuid || config.widgetGuid,
                      uniqueid: widgetParams.widgetUniqueid || config.widgetUniqueid
                   }
                ],
                contextProperties: {
                   uniqueid: widgetParams.widgetUniqueid || config.widgetUniqueid
                },
                renderHTML: false
             }

        axios.post(config.recommendationUrl, params).then(response => {
            if (response.status == '200' && response.data) {
                callback(response.data);
            }
        }).catch(err => {
            if (!axios.isCancel(err)) {
                callback(false, true);
            }
        });
    }

    static fetchSuggestions(searchParams, store, callback) {
        if (!this.requestConditionsMet(store)) {
            return false;
        }

        if (store.state.autocompleteCancelation) {
            store.state.autocompleteCancelation();
            store.commit('updateAutocompleteCancelation', null);
        }

        if (!callback) {
            callback = function () { };
        }

        if (!searchParams) {
            searchParams = {};
        }

        var config = store.state.config;
        var clientData = this.getClientData(store);
        var params = Object.assign({}, searchParams,
            {
                ClientGuid: config.clientGuid,
                IndexName: this.getIndexName(config),
                ClientData: clientData,
                DisplayFullResponse: true
            },
            config.additionalParameters);

        axios.post(this.getFullAutocompleteUrl(store), params, {
            cancelToken: new CancelToken(function executor(c) {
                store.commit('updateAutocompleteCancelation', c);
            }),
        }).then(response => {
            if (response && response.status == '200' && response.data) {
                callback(response.data);
            }
        }).catch(err => {
            if (!axios.isCancel(err)) {
                callback(false);
            }
        });
    }

    static suggestionRequest = null

    static cancelSuggestionsRequest() {
        if (this.suggestionRequest) {
            this.suggestionRequest.abort();
        }
    }

    static requestConditionsMet(store) {
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
            case 'link':
            case 'nestedcheckbox':
            case 'nestedlinklist':
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
            var templateOverride = (options.propsData && options.propsData.templateOverride) || options.templateOverride;

            if (templateOverride &&
                typeof templateOverride === 'string' &&
                templateOverride.charAt(0) === '#' &&
                document.querySelector(templateOverride)) {

                let renderFunctions = Vue.compile(document.querySelector(templateOverride).innerHTML);
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

    static paramWhitelist = ['CustomUrl', 'Query']

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

        if (!String.prototype.replaceAll) {
            String.prototype.replaceAll = function(str, newStr){

                if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') {
                    return this.replace(str, newStr);
                }

                return this.replace(new RegExp(str, 'g'), newStr);
            };
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

    static getClientData(store) {
        var config = store.state.config;
        var visitorId = getVisitorId()
        var clientData = {
            "VisitorId": visitorId
        };

        if (config.language && visitorId) {
            clientData["Custom"] = {
                "language": config.language
            };
        }

        return clientData;
    }

    static applyTabSelection(widget) {
        var store = this.getWidgetStore(widget);
        var data = store.state.searchOutput;

        if (data.Results.length && data.Facets.find(facet => facet.FieldType == 'tab')) {
            var tabs = data.Facets.find(facet => facet.FieldType == 'tab');

            if (!tabs.Values.find(value => value.Selected == true) && widget.config.tabConfig.alwaysOn) {
                var facetData = Object.assign({}, tabs);

                facetData.Values[0].Selected = true;

                widget.dispatchToStore('applyFacets', facetData);
            }
        }
    }

    static mergeConfig(configA, configB) {
        var a = _.cloneDeep(configA);
        var b = _.cloneDeep(configB);

        var mergedConfig = _.merge({}, a, b);

        Object.keys(mergedConfig).forEach((key) => {
            if (_.isArray(mergedConfig[key]) && a[key] && _.isArray(a[key]) && b[key] && _.isArray(b[key])) {
                mergedConfig[key] = _.union(a[key], b[key]);
            }
        });

        return mergedConfig
    }

    static scrollToBeginning(widget) {
        if (widget.config.searchConfig.scrollUpOnRefresh) {
            window.scrollTo(widget.$el.getBoundingClientRect().top, 0);
        }
    }

    static collapseAllFacets() {
        Object.values(HawksearchVue.widgetInstances).forEach(w => {
            w.$children.forEach(c => {
                if (c.$options.name == 'facet-list') {
                    c.collapseAll();
                }
            })
        })
    }

    static getIndexName(config) {
        var urlParams = new URLSearchParams(location.search);
        var urlIndexName = urlParams.get('indexName');
        var configIndexName = config.indexName;

        return configIndexName || urlIndexName || "";
    }

    static getTabField(store) {
        var field;

        store.state.searchOutput.Facets.forEach(facet => {
            if (facet.FieldType == "tab") {
                field = facet.Field;
            }
        })

        return field;
    }

    static getFacetFieldNames(store) {
        var fields = [];

        store.state.searchOutput.Facets.forEach(facet => {
            fields.push(this.getFacetParamName(facet));
        })

        return fields;
    }

    static truncateFacetSelections(store){
        var pendingSearch = _.cloneDeep(store.state.pendingSearch);
        pendingSearch.FacetSelections = _.pickBy(pendingSearch.FacetSelections, (value,field) => {return _.includes(this.getFacetFieldNames(store),field)});

        store.commit('updatePendingSearch',pendingSearch);
    }

    static isMobile() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
}

export default HawksearchVue;
