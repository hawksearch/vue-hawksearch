import Vue$2 from'vue';import VueResource from'vue-resource';import Vuex,{mapState}from'vuex';Vue$2.use(Vuex);

var store = new Vuex.Store({
    state: {
        config: {}, // defaults are set in HawkSearchVue class
        searchOutput: null,
        suggestions: null,
        pendingSearch: {
            Keyword: "",
            FacetSelections: {}
        },
        extendedSearchParams: {},
        searchError: false,
        loadingResults: false,
        loadingSuggestions: false
    },
    mutations: {
        updateConfig(state, value) {
            state.config = Object.assign({}, state.config, value);
        },
        updateResults(state, value) {
            state.searchOutput = value;
        },
        updateSuggestions(state, value) {
            state.suggestions = value;
        },
        updatePendingSearch(state, value) {
            state.pendingSearch = value;
        },
        updateExtendedSearchParams(state, value) {
            state.extendedSearchParams = value;
        },
        setSearchError(state, value) {
            state.searchError = value;
        },
        updateLoadingResults(state, value) {
            state.loadingResults = value;
        },
        updateLoadingSuggestions(state, value) {
            state.loadingSuggestions = value;
        }
    },
    actions: {
        fetchResults({ commit, state }, searchParams) {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            commit('updatePendingSearch', pendingSearch);
            commit('updateSuggestions', null);
            commit('updateLoadingSuggestions', false);
            commit('updateLoadingResults', true);

            HawkSearchVue.fetchResults(pendingSearch, (searchOutput) => {
                commit('updateLoadingResults', false);

                if (searchOutput) {
                    commit('setSearchError', false);
                    commit('updateResults', searchOutput);

                    HawkSearchVue.extendSearchData(searchOutput, state.pendingSearch, (extendedSearchParams) => {
                        commit('updateExtendedSearchParams', extendedSearchParams);
                    });
                }
                else {
                    commit('updateResults', null);
                    commit('setSearchError', true);
                }
            });
        },
        fetchSuggestions({ commit, state }, searchParams) {
            HawkSearchVue.fetchSuggestions(searchParams, (suggestions) => {
                if (suggestions) {
                    commit('updateLoadingSuggestions', false);
                    commit('updateSuggestions', suggestions);
                }
            });
        },
        applyFacets({ dispatch, commit, state }, facetData) {
            HawkSearchVue.applyFacets(facetData, state.pendingSearch.FacetSelections, (facetSelections) => {
                dispatch('fetchResults', { FacetSelections: facetSelections });
            });
        },
        applyPageNumber({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { PageNo: value });
        },
        applyPageSize({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { MaxPerPage: value });
        },
        applySort({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { SortBy: value });
        },
        applySearchWithin({ dispatch, commit, state }, value) {
            dispatch('fetchResults', { SearchWithin: value });
        },
        clearFacet({ dispatch, commit, state }, facet, notReload) {
            var pendingSearch = Object.assign({}, state.pendingSearch);

            if (pendingSearch.hasOwnProperty(facet)) {
                delete pendingSearch[facet];
            }
            else if (pendingSearch.FacetSelections && pendingSearch.FacetSelections.hasOwnProperty(facet)) {
                delete pendingSearch.FacetSelections[facet];
            }

            commit('updatePendingSearch', pendingSearch);

            if (!notReload) {
                dispatch('fetchResults', {});
            }
        }
    }
});class HawkSearchVue$1 {
    static config = {
        clientGuid: '',
        apiUrl: 'https://searchapi-dev.hawksearch.net',
        searchUrl: '/api/v2/search',
        autocompleteUrl: '/api/autocomplete',
        dashboardUrl: '',
        searchPageUrl: location.pathname,
        indexName: null,
        indexNameRequired: false,
        additionalParameters: {}
    }

    static configurationApplied = false
    static suggestionRequest = null

    static configure(config) {
        if (!config) {
            return false;
        }

        this.config = Object.assign({}, this.config, config);
        store.commit('updateConfig', this.config);

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
                });
            }

            return urlParams;
        };

        var urlParams = getUrlParams();
        var initialSearchParams = {};

        if (urlParams.keyword) {
            initialSearchParams = { Keyword: urlParams.keyword };
        }

        if (!this.config.indexName && urlParams.indexName) {
            this.config.indexName = urlParams.indexName;
            this.configure({});
        }

        store.dispatch('fetchResults', initialSearchParams);
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

        var params = Object.assign({}, searchParams, { ClientGuid: this.config.clientGuid, IndexName: this.config.indexName }, this.config.additionalParameters);

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
                HawkSearchVue$1.cancelSuggestionsRequest();
                HawkSearchVue$1.suggestionRequest = request;
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
        };

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
            callback({});
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
        };

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
        };
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
}var script = {
    name: 'search-suggestions',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'suggestions',
            'loadingSuggestions'
        ])
    }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}/* script */
const __vue_script__ = script;
/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "autosuggest-menu" },
    [
      _vm.loadingSuggestions || _vm.suggestions
        ? [
            _c(
              "ul",
              { staticClass: "dropdown-menu autosuggest-menu__list" },
              [
                _vm.loadingSuggestions
                  ? [
                      _c("li", { staticClass: "autosuggest-menu__item" }, [
                        _vm._v(_vm._s(_vm.$t("Loading")) + "...")
                      ])
                    ]
                  : _vm.suggestions.Products.length
                  ? _vm._l(_vm.suggestions.Products, function(item) {
                      return _c(
                        "li",
                        { staticClass: "autosuggest-menu__item" },
                        [
                          _c(
                            "a",
                            {
                              staticClass: "autosuggest-menu__item-link",
                              attrs: { href: item.Url }
                            },
                            [_vm._v(_vm._s(item.ProductName))]
                          )
                        ]
                      )
                    })
                  : [
                      _c("li", { staticClass: "autosuggest-menu__item" }, [
                        _vm._v(_vm._s(_vm.$t("No Results")))
                      ])
                    ]
              ],
              2
            )
          ]
        : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = undefined;
  /* scoped */
  const __vue_scope_id__ = "data-v-42b2f1bc";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$1 = {
    name: 'search-box',
    props: [],
    components: {
        SearchSuggestions: __vue_component__
    },
    mounted() {

    },
    data() {
        return {
            keyword: null,
            placeholder: 'Enter search term',
            suggestionDelay: null,
            loadingSuggestions: false
        }
    },
    methods: {
        onKeyDown: function (e) {
            if (e.key == 'Enter') {
                this.cancelSuggestions();

                if (HawkSearchVue$1.isGlobal()) {
                    HawkSearchVue$1.redirectSearch(keyword);
                }
                else {
                    this.$root.$store.dispatch('fetchResults', { Keyword: this.keyword, FacetSelections: {} });
                }
            }
        },
        onInput: function (e) {
            let keyword = e.target.value;

            if (keyword) {
                this.$root.$store.commit('updateLoadingSuggestions', true);

                clearTimeout(this.suggestionDelay);
                this.suggestionDelay = setTimeout(() => {
                    this.$root.$store.dispatch('fetchSuggestions', { Keyword: keyword });
                }, 250);
            }
            else {
                this.cancelSuggestions();
            }
        },
        onBlur: function () {
            this.keyword = null;
            this.cancelSuggestions();
        },
        cancelSuggestions: function () {
            clearTimeout(this.suggestionDelay);
            HawkSearchVue$1.cancelSuggestionsRequest();
            this.$root.$store.commit('updateLoadingSuggestions', false);
            this.$root.$store.commit('updateSuggestions', null);
        }
    },
    computed: {
        ...mapState([
            'loadingResults',
            'loadingSuggestions'
        ])
    }
};/* script */
const __vue_script__$1 = script$1;
/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk__searchBox" },
    [
      _c("div", { staticClass: "hawk__searchBox__searchInput" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.keyword,
              expression: "keyword"
            }
          ],
          attrs: { type: "text", placeholder: _vm.$t("Enter a search term") },
          domProps: { value: _vm.keyword },
          on: {
            input: [
              function($event) {
                if ($event.target.composing) {
                  return
                }
                _vm.keyword = $event.target.value;
              },
              _vm.onInput
            ],
            keydown: _vm.onKeyDown,
            blur: _vm.onBlur
          }
        })
      ]),
      _vm._v(" "),
      _c("search-suggestions")
    ],
    1
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = "data-v-a5038df4";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );/*!
 * vue-i18n v8.18.1 
 * (c) 2020 kazuya kawaguchi
 * Released under the MIT License.
 */
/*  */

/**
 * constants
 */

var numberFormatKeys = [
  'style',
  'currency',
  'currencyDisplay',
  'useGrouping',
  'minimumIntegerDigits',
  'minimumFractionDigits',
  'maximumFractionDigits',
  'minimumSignificantDigits',
  'maximumSignificantDigits',
  'localeMatcher',
  'formatMatcher',
  'unit'
];

/**
 * utilities
 */

function warn (msg, err) {
  if (typeof console !== 'undefined') {
    console.warn('[vue-i18n] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.warn(err.stack);
    }
  }
}

function error (msg, err) {
  if (typeof console !== 'undefined') {
    console.error('[vue-i18n] ' + msg);
    /* istanbul ignore if */
    if (err) {
      console.error(err.stack);
    }
  }
}

var isArray = Array.isArray;

function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function isBoolean (val) {
  return typeof val === 'boolean'
}

function isString (val) {
  return typeof val === 'string'
}

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING
}

function isNull (val) {
  return val === null || val === undefined
}

function parseArgs () {
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var locale = null;
  var params = null;
  if (args.length === 1) {
    if (isObject(args[0]) || Array.isArray(args[0])) {
      params = args[0];
    } else if (typeof args[0] === 'string') {
      locale = args[0];
    }
  } else if (args.length === 2) {
    if (typeof args[0] === 'string') {
      locale = args[0];
    }
    /* istanbul ignore if */
    if (isObject(args[1]) || Array.isArray(args[1])) {
      params = args[1];
    }
  }

  return { locale: locale, params: params }
}

function looseClone (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function remove (arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

function includes (arr, item) {
  return !!~arr.indexOf(item)
}

var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

function merge (target) {
  var arguments$1 = arguments;

  var output = Object(target);
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments$1[i];
    if (source !== undefined && source !== null) {
      var key = (void 0);
      for (key in source) {
        if (hasOwn(source, key)) {
          if (isObject(source[key])) {
            output[key] = merge(output[key], source[key]);
          } else {
            output[key] = source[key];
          }
        }
      }
    }
  }
  return output
}

function looseEqual (a, b) {
  if (a === b) { return true }
  var isObjectA = isObject(a);
  var isObjectB = isObject(b);
  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

/*  */

function extend (Vue) {
  if (!Vue.prototype.hasOwnProperty('$i18n')) {
    // $FlowFixMe
    Object.defineProperty(Vue.prototype, '$i18n', {
      get: function get () { return this._i18n }
    });
  }

  Vue.prototype.$t = function (key) {
    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    var i18n = this.$i18n;
    return i18n._t.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this ].concat( values ))
  };

  Vue.prototype.$tc = function (key, choice) {
    var values = [], len = arguments.length - 2;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];

    var i18n = this.$i18n;
    return i18n._tc.apply(i18n, [ key, i18n.locale, i18n._getMessages(), this, choice ].concat( values ))
  };

  Vue.prototype.$te = function (key, locale) {
    var i18n = this.$i18n;
    return i18n._te(key, i18n.locale, i18n._getMessages(), locale)
  };

  Vue.prototype.$d = function (value) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    return (ref = this.$i18n).d.apply(ref, [ value ].concat( args ))
  };

  Vue.prototype.$n = function (value) {
    var ref;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
    return (ref = this.$i18n).n.apply(ref, [ value ].concat( args ))
  };
}

/*  */

var mixin = {
  beforeCreate: function beforeCreate () {
    var options = this.$options;
    options.i18n = options.i18n || (options.__i18n ? {} : null);

    if (options.i18n) {
      if (options.i18n instanceof VueI18n) {
        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages = {};
            options.__i18n.forEach(function (resource) {
              localeMessages = merge(localeMessages, JSON.parse(resource));
            });
            Object.keys(localeMessages).forEach(function (locale) {
              options.i18n.mergeLocaleMessage(locale, localeMessages[locale]);
            });
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              error("Cannot parse locale messages via custom blocks.", e);
            }
          }
        }
        this._i18n = options.i18n;
        this._i18nWatcher = this._i18n.watchI18nData();
      } else if (isPlainObject(options.i18n)) {
        var rootI18n = this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n
          ? this.$root.$i18n
          : null;
        // component local i18n
        if (rootI18n) {
          options.i18n.root = this.$root;
          options.i18n.formatter = rootI18n.formatter;
          options.i18n.fallbackLocale = rootI18n.fallbackLocale;
          options.i18n.formatFallbackMessages = rootI18n.formatFallbackMessages;
          options.i18n.silentTranslationWarn = rootI18n.silentTranslationWarn;
          options.i18n.silentFallbackWarn = rootI18n.silentFallbackWarn;
          options.i18n.pluralizationRules = rootI18n.pluralizationRules;
          options.i18n.preserveDirectiveContent = rootI18n.preserveDirectiveContent;
        }

        // init locale messages via custom blocks
        if (options.__i18n) {
          try {
            var localeMessages$1 = {};
            options.__i18n.forEach(function (resource) {
              localeMessages$1 = merge(localeMessages$1, JSON.parse(resource));
            });
            options.i18n.messages = localeMessages$1;
          } catch (e) {
            if (process.env.NODE_ENV !== 'production') {
              warn("Cannot parse locale messages via custom blocks.", e);
            }
          }
        }

        var ref = options.i18n;
        var sharedMessages = ref.sharedMessages;
        if (sharedMessages && isPlainObject(sharedMessages)) {
          options.i18n.messages = merge(options.i18n.messages, sharedMessages);
        }

        this._i18n = new VueI18n(options.i18n);
        this._i18nWatcher = this._i18n.watchI18nData();

        if (options.i18n.sync === undefined || !!options.i18n.sync) {
          this._localeWatcher = this.$i18n.watchLocale();
        }

        if (rootI18n) {
          rootI18n.onComponentInstanceCreated(this._i18n);
        }
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn("Cannot be interpreted 'i18n' option.");
        }
      }
    } else if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
      // root i18n
      this._i18n = this.$root.$i18n;
    } else if (options.parent && options.parent.$i18n && options.parent.$i18n instanceof VueI18n) {
      // parent i18n
      this._i18n = options.parent.$i18n;
    }
  },

  beforeMount: function beforeMount () {
    var options = this.$options;
    options.i18n = options.i18n || (options.__i18n ? {} : null);

    if (options.i18n) {
      if (options.i18n instanceof VueI18n) {
        // init locale messages via custom blocks
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;
      } else if (isPlainObject(options.i18n)) {
        this._i18n.subscribeDataChanging(this);
        this._subscribing = true;
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn("Cannot be interpreted 'i18n' option.");
        }
      }
    } else if (this.$root && this.$root.$i18n && this.$root.$i18n instanceof VueI18n) {
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    } else if (options.parent && options.parent.$i18n && options.parent.$i18n instanceof VueI18n) {
      this._i18n.subscribeDataChanging(this);
      this._subscribing = true;
    }
  },

  beforeDestroy: function beforeDestroy () {
    if (!this._i18n) { return }

    var self = this;
    this.$nextTick(function () {
      if (self._subscribing) {
        self._i18n.unsubscribeDataChanging(self);
        delete self._subscribing;
      }

      if (self._i18nWatcher) {
        self._i18nWatcher();
        self._i18n.destroyVM();
        delete self._i18nWatcher;
      }

      if (self._localeWatcher) {
        self._localeWatcher();
        delete self._localeWatcher;
      }
    });
  }
};

/*  */

var interpolationComponent = {
  name: 'i18n',
  functional: true,
  props: {
    tag: {
      type: [String, Boolean],
      default: 'span'
    },
    path: {
      type: String,
      required: true
    },
    locale: {
      type: String
    },
    places: {
      type: [Array, Object]
    }
  },
  render: function render (h, ref) {
    var data = ref.data;
    var parent = ref.parent;
    var props = ref.props;
    var slots = ref.slots;

    var $i18n = parent.$i18n;
    if (!$i18n) {
      if (process.env.NODE_ENV !== 'production') {
        warn('Cannot find VueI18n instance!');
      }
      return
    }

    var path = props.path;
    var locale = props.locale;
    var places = props.places;
    var params = slots();
    var children = $i18n.i(
      path,
      locale,
      onlyHasDefaultPlace(params) || places
        ? useLegacyPlaces(params.default, places)
        : params
    );

    var tag = (!!props.tag && props.tag !== true) || props.tag === false ? props.tag : 'span';
    return tag ? h(tag, data, children) : children
  }
};

function onlyHasDefaultPlace (params) {
  var prop;
  for (prop in params) {
    if (prop !== 'default') { return false }
  }
  return Boolean(prop)
}

function useLegacyPlaces (children, places) {
  var params = places ? createParamsFromPlaces(places) : {};

  if (!children) { return params }

  // Filter empty text nodes
  children = children.filter(function (child) {
    return child.tag || child.text.trim() !== ''
  });

  var everyPlace = children.every(vnodeHasPlaceAttribute);
  if (process.env.NODE_ENV !== 'production' && everyPlace) {
    warn('`place` attribute is deprecated in next major version. Please switch to Vue slots.');
  }

  return children.reduce(
    everyPlace ? assignChildPlace : assignChildIndex,
    params
  )
}

function createParamsFromPlaces (places) {
  if (process.env.NODE_ENV !== 'production') {
    warn('`places` prop is deprecated in next major version. Please switch to Vue slots.');
  }

  return Array.isArray(places)
    ? places.reduce(assignChildIndex, {})
    : Object.assign({}, places)
}

function assignChildPlace (params, child) {
  if (child.data && child.data.attrs && child.data.attrs.place) {
    params[child.data.attrs.place] = child;
  }
  return params
}

function assignChildIndex (params, child, index) {
  params[index] = child;
  return params
}

function vnodeHasPlaceAttribute (vnode) {
  return Boolean(vnode.data && vnode.data.attrs && vnode.data.attrs.place)
}

/*  */

var numberComponent = {
  name: 'i18n-n',
  functional: true,
  props: {
    tag: {
      type: [String, Boolean],
      default: 'span'
    },
    value: {
      type: Number,
      required: true
    },
    format: {
      type: [String, Object]
    },
    locale: {
      type: String
    }
  },
  render: function render (h, ref) {
    var props = ref.props;
    var parent = ref.parent;
    var data = ref.data;

    var i18n = parent.$i18n;

    if (!i18n) {
      if (process.env.NODE_ENV !== 'production') {
        warn('Cannot find VueI18n instance!');
      }
      return null
    }

    var key = null;
    var options = null;

    if (isString(props.format)) {
      key = props.format;
    } else if (isObject(props.format)) {
      if (props.format.key) {
        key = props.format.key;
      }

      // Filter out number format options only
      options = Object.keys(props.format).reduce(function (acc, prop) {
        var obj;

        if (includes(numberFormatKeys, prop)) {
          return Object.assign({}, acc, ( obj = {}, obj[prop] = props.format[prop], obj ))
        }
        return acc
      }, null);
    }

    var locale = props.locale || i18n.locale;
    var parts = i18n._ntp(props.value, locale, key, options);

    var values = parts.map(function (part, index) {
      var obj;

      var slot = data.scopedSlots && data.scopedSlots[part.type];
      return slot ? slot(( obj = {}, obj[part.type] = part.value, obj.index = index, obj.parts = parts, obj )) : part.value
    });

    var tag = (!!props.tag && props.tag !== true) || props.tag === false ? props.tag : 'span';
    return tag
      ? h(tag, {
        attrs: data.attrs,
        'class': data['class'],
        staticClass: data.staticClass
      }, values)
      : values
  }
};

/*  */

function bind (el, binding, vnode) {
  if (!assert(el, vnode)) { return }

  t(el, binding, vnode);
}

function update (el, binding, vnode, oldVNode) {
  if (!assert(el, vnode)) { return }

  var i18n = vnode.context.$i18n;
  if (localeEqual(el, vnode) &&
    (looseEqual(binding.value, binding.oldValue) &&
     looseEqual(el._localeMessage, i18n.getLocaleMessage(i18n.locale)))) { return }

  t(el, binding, vnode);
}

function unbind (el, binding, vnode, oldVNode) {
  var vm = vnode.context;
  if (!vm) {
    warn('Vue instance does not exists in VNode context');
    return
  }

  var i18n = vnode.context.$i18n || {};
  if (!binding.modifiers.preserve && !i18n.preserveDirectiveContent) {
    el.textContent = '';
  }
  el._vt = undefined;
  delete el['_vt'];
  el._locale = undefined;
  delete el['_locale'];
  el._localeMessage = undefined;
  delete el['_localeMessage'];
}

function assert (el, vnode) {
  var vm = vnode.context;
  if (!vm) {
    warn('Vue instance does not exists in VNode context');
    return false
  }

  if (!vm.$i18n) {
    warn('VueI18n instance does not exists in Vue instance');
    return false
  }

  return true
}

function localeEqual (el, vnode) {
  var vm = vnode.context;
  return el._locale === vm.$i18n.locale
}

function t (el, binding, vnode) {
  var ref$1, ref$2;

  var value = binding.value;

  var ref = parseValue(value);
  var path = ref.path;
  var locale = ref.locale;
  var args = ref.args;
  var choice = ref.choice;
  if (!path && !locale && !args) {
    warn('value type not supported');
    return
  }

  if (!path) {
    warn('`path` is required in v-t directive');
    return
  }

  var vm = vnode.context;
  if (choice != null) {
    el._vt = el.textContent = (ref$1 = vm.$i18n).tc.apply(ref$1, [ path, choice ].concat( makeParams(locale, args) ));
  } else {
    el._vt = el.textContent = (ref$2 = vm.$i18n).t.apply(ref$2, [ path ].concat( makeParams(locale, args) ));
  }
  el._locale = vm.$i18n.locale;
  el._localeMessage = vm.$i18n.getLocaleMessage(vm.$i18n.locale);
}

function parseValue (value) {
  var path;
  var locale;
  var args;
  var choice;

  if (isString(value)) {
    path = value;
  } else if (isPlainObject(value)) {
    path = value.path;
    locale = value.locale;
    args = value.args;
    choice = value.choice;
  }

  return { path: path, locale: locale, args: args, choice: choice }
}

function makeParams (locale, args) {
  var params = [];

  locale && params.push(locale);
  if (args && (Array.isArray(args) || isPlainObject(args))) {
    params.push(args);
  }

  return params
}

var Vue$1;

function install (_Vue) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && install.installed && _Vue === Vue$1) {
    warn('already installed.');
    return
  }
  install.installed = true;

  Vue$1 = _Vue;

  var version = (Vue$1.version && Number(Vue$1.version.split('.')[0])) || -1;
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && version < 2) {
    warn(("vue-i18n (" + (install.version) + ") need to use Vue 2.0 or later (Vue: " + (Vue$1.version) + ")."));
    return
  }

  extend(Vue$1);
  Vue$1.mixin(mixin);
  Vue$1.directive('t', { bind: bind, update: update, unbind: unbind });
  Vue$1.component(interpolationComponent.name, interpolationComponent);
  Vue$1.component(numberComponent.name, numberComponent);

  // use simple mergeStrategies to prevent i18n instance lose '__proto__'
  var strats = Vue$1.config.optionMergeStrategies;
  strats.i18n = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };
}

/*  */

var BaseFormatter = function BaseFormatter () {
  this._caches = Object.create(null);
};

BaseFormatter.prototype.interpolate = function interpolate (message, values) {
  if (!values) {
    return [message]
  }
  var tokens = this._caches[message];
  if (!tokens) {
    tokens = parse(message);
    this._caches[message] = tokens;
  }
  return compile(tokens, values)
};



var RE_TOKEN_LIST_VALUE = /^(?:\d)+/;
var RE_TOKEN_NAMED_VALUE = /^(?:\w)+/;

function parse (format) {
  var tokens = [];
  var position = 0;

  var text = '';
  while (position < format.length) {
    var char = format[position++];
    if (char === '{') {
      if (text) {
        tokens.push({ type: 'text', value: text });
      }

      text = '';
      var sub = '';
      char = format[position++];
      while (char !== undefined && char !== '}') {
        sub += char;
        char = format[position++];
      }
      var isClosed = char === '}';

      var type = RE_TOKEN_LIST_VALUE.test(sub)
        ? 'list'
        : isClosed && RE_TOKEN_NAMED_VALUE.test(sub)
          ? 'named'
          : 'unknown';
      tokens.push({ value: sub, type: type });
    } else if (char === '%') {
      // when found rails i18n syntax, skip text capture
      if (format[(position)] !== '{') {
        text += char;
      }
    } else {
      text += char;
    }
  }

  text && tokens.push({ type: 'text', value: text });

  return tokens
}

function compile (tokens, values) {
  var compiled = [];
  var index = 0;

  var mode = Array.isArray(values)
    ? 'list'
    : isObject(values)
      ? 'named'
      : 'unknown';
  if (mode === 'unknown') { return compiled }

  while (index < tokens.length) {
    var token = tokens[index];
    switch (token.type) {
      case 'text':
        compiled.push(token.value);
        break
      case 'list':
        compiled.push(values[parseInt(token.value, 10)]);
        break
      case 'named':
        if (mode === 'named') {
          compiled.push((values)[token.value]);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            warn(("Type of token '" + (token.type) + "' and format of value '" + mode + "' don't match!"));
          }
        }
        break
      case 'unknown':
        if (process.env.NODE_ENV !== 'production') {
          warn("Detect 'unknown' type of token!");
        }
        break
    }
    index++;
  }

  return compiled
}

/*  */

/**
 *  Path parser
 *  - Inspired:
 *    Vue.js Path parser
 */

// actions
var APPEND = 0;
var PUSH = 1;
var INC_SUB_PATH_DEPTH = 2;
var PUSH_SUB_PATH = 3;

// states
var BEFORE_PATH = 0;
var IN_PATH = 1;
var BEFORE_IDENT = 2;
var IN_IDENT = 3;
var IN_SUB_PATH = 4;
var IN_SINGLE_QUOTE = 5;
var IN_DOUBLE_QUOTE = 6;
var AFTER_PATH = 7;
var ERROR = 8;

var pathStateMachine = [];

pathStateMachine[BEFORE_PATH] = {
  'ws': [BEFORE_PATH],
  'ident': [IN_IDENT, APPEND],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[IN_PATH] = {
  'ws': [IN_PATH],
  '.': [BEFORE_IDENT],
  '[': [IN_SUB_PATH],
  'eof': [AFTER_PATH]
};

pathStateMachine[BEFORE_IDENT] = {
  'ws': [BEFORE_IDENT],
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND]
};

pathStateMachine[IN_IDENT] = {
  'ident': [IN_IDENT, APPEND],
  '0': [IN_IDENT, APPEND],
  'number': [IN_IDENT, APPEND],
  'ws': [IN_PATH, PUSH],
  '.': [BEFORE_IDENT, PUSH],
  '[': [IN_SUB_PATH, PUSH],
  'eof': [AFTER_PATH, PUSH]
};

pathStateMachine[IN_SUB_PATH] = {
  "'": [IN_SINGLE_QUOTE, APPEND],
  '"': [IN_DOUBLE_QUOTE, APPEND],
  '[': [IN_SUB_PATH, INC_SUB_PATH_DEPTH],
  ']': [IN_PATH, PUSH_SUB_PATH],
  'eof': ERROR,
  'else': [IN_SUB_PATH, APPEND]
};

pathStateMachine[IN_SINGLE_QUOTE] = {
  "'": [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_SINGLE_QUOTE, APPEND]
};

pathStateMachine[IN_DOUBLE_QUOTE] = {
  '"': [IN_SUB_PATH, APPEND],
  'eof': ERROR,
  'else': [IN_DOUBLE_QUOTE, APPEND]
};

/**
 * Check if an expression is a literal value.
 */

var literalValueRE = /^\s?(?:true|false|-?[\d.]+|'[^']*'|"[^"]*")\s?$/;
function isLiteral (exp) {
  return literalValueRE.test(exp)
}

/**
 * Strip quotes from a string
 */

function stripQuotes (str) {
  var a = str.charCodeAt(0);
  var b = str.charCodeAt(str.length - 1);
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : str
}

/**
 * Determine the type of a character in a keypath.
 */

function getPathCharType (ch) {
  if (ch === undefined || ch === null) { return 'eof' }

  var code = ch.charCodeAt(0);

  switch (code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
      return ch

    case 0x5F: // _
    case 0x24: // $
    case 0x2D: // -
      return 'ident'

    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  return 'ident'
}

/**
 * Format a subPath, return its plain form if it is
 * a literal string or number. Otherwise prepend the
 * dynamic indicator (*).
 */

function formatSubPath (path) {
  var trimmed = path.trim();
  // invalid leading 0
  if (path.charAt(0) === '0' && isNaN(path)) { return false }

  return isLiteral(trimmed) ? stripQuotes(trimmed) : '*' + trimmed
}

/**
 * Parse a string path into an array of segments
 */

function parse$1 (path) {
  var keys = [];
  var index = -1;
  var mode = BEFORE_PATH;
  var subPathDepth = 0;
  var c;
  var key;
  var newChar;
  var type;
  var transition;
  var action;
  var typeMap;
  var actions = [];

  actions[PUSH] = function () {
    if (key !== undefined) {
      keys.push(key);
      key = undefined;
    }
  };

  actions[APPEND] = function () {
    if (key === undefined) {
      key = newChar;
    } else {
      key += newChar;
    }
  };

  actions[INC_SUB_PATH_DEPTH] = function () {
    actions[APPEND]();
    subPathDepth++;
  };

  actions[PUSH_SUB_PATH] = function () {
    if (subPathDepth > 0) {
      subPathDepth--;
      mode = IN_SUB_PATH;
      actions[APPEND]();
    } else {
      subPathDepth = 0;
      if (key === undefined) { return false }
      key = formatSubPath(key);
      if (key === false) {
        return false
      } else {
        actions[PUSH]();
      }
    }
  };

  function maybeUnescapeQuote () {
    var nextChar = path[index + 1];
    if ((mode === IN_SINGLE_QUOTE && nextChar === "'") ||
      (mode === IN_DOUBLE_QUOTE && nextChar === '"')) {
      index++;
      newChar = '\\' + nextChar;
      actions[APPEND]();
      return true
    }
  }

  while (mode !== null) {
    index++;
    c = path[index];

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c);
    typeMap = pathStateMachine[mode];
    transition = typeMap[type] || typeMap['else'] || ERROR;

    if (transition === ERROR) {
      return // parse error
    }

    mode = transition[0];
    action = actions[transition[1]];
    if (action) {
      newChar = transition[2];
      newChar = newChar === undefined
        ? c
        : newChar;
      if (action() === false) {
        return
      }
    }

    if (mode === AFTER_PATH) {
      return keys
    }
  }
}





var I18nPath = function I18nPath () {
  this._cache = Object.create(null);
};

/**
 * External parse that check for a cache hit first
 */
I18nPath.prototype.parsePath = function parsePath (path) {
  var hit = this._cache[path];
  if (!hit) {
    hit = parse$1(path);
    if (hit) {
      this._cache[path] = hit;
    }
  }
  return hit || []
};

/**
 * Get path value from path string
 */
I18nPath.prototype.getPathValue = function getPathValue (obj, path) {
  if (!isObject(obj)) { return null }

  var paths = this.parsePath(path);
  if (paths.length === 0) {
    return null
  } else {
    var length = paths.length;
    var last = obj;
    var i = 0;
    while (i < length) {
      var value = last[paths[i]];
      if (value === undefined) {
        return null
      }
      last = value;
      i++;
    }

    return last
  }
};

/*  */



var htmlTagMatcher = /<\/?[\w\s="/.':;#-\/]+>/;
var linkKeyMatcher = /(?:@(?:\.[a-z]+)?:(?:[\w\-_|.]+|\([\w\-_|.]+\)))/g;
var linkKeyPrefixMatcher = /^@(?:\.([a-z]+))?:/;
var bracketsMatcher = /[()]/g;
var defaultModifiers = {
  'upper': function (str) { return str.toLocaleUpperCase(); },
  'lower': function (str) { return str.toLocaleLowerCase(); },
  'capitalize': function (str) { return ("" + (str.charAt(0).toLocaleUpperCase()) + (str.substr(1))); }
};

var defaultFormatter = new BaseFormatter();

var VueI18n = function VueI18n (options) {
  var this$1 = this;
  if ( options === void 0 ) options = {};

  // Auto install if it is not done yet and `window` has `Vue`.
  // To allow users to avoid auto-installation in some cases,
  // this code should be placed here. See #290
  /* istanbul ignore if */
  if (!Vue$1 && typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
  }

  var locale = options.locale || 'en-US';
  var fallbackLocale = options.fallbackLocale === false
    ? false
    : options.fallbackLocale || 'en-US';
  var messages = options.messages || {};
  var dateTimeFormats = options.dateTimeFormats || {};
  var numberFormats = options.numberFormats || {};

  this._vm = null;
  this._formatter = options.formatter || defaultFormatter;
  this._modifiers = options.modifiers || {};
  this._missing = options.missing || null;
  this._root = options.root || null;
  this._sync = options.sync === undefined ? true : !!options.sync;
  this._fallbackRoot = options.fallbackRoot === undefined
    ? true
    : !!options.fallbackRoot;
  this._formatFallbackMessages = options.formatFallbackMessages === undefined
    ? false
    : !!options.formatFallbackMessages;
  this._silentTranslationWarn = options.silentTranslationWarn === undefined
    ? false
    : options.silentTranslationWarn;
  this._silentFallbackWarn = options.silentFallbackWarn === undefined
    ? false
    : !!options.silentFallbackWarn;
  this._dateTimeFormatters = {};
  this._numberFormatters = {};
  this._path = new I18nPath();
  this._dataListeners = [];
  this._componentInstanceCreatedListener = options.componentInstanceCreatedListener || null;
  this._preserveDirectiveContent = options.preserveDirectiveContent === undefined
    ? false
    : !!options.preserveDirectiveContent;
  this.pluralizationRules = options.pluralizationRules || {};
  this._warnHtmlInMessage = options.warnHtmlInMessage || 'off';
  this._postTranslation = options.postTranslation || null;

  /**
   * @param choice {number} a choice index given by the input to $tc: `$tc('path.to.rule', choiceIndex)`
   * @param choicesLength {number} an overall amount of available choices
   * @returns a final choice index
  */
  this.getChoiceIndex = function (choice, choicesLength) {
    var thisPrototype = Object.getPrototypeOf(this$1);
    if (thisPrototype && thisPrototype.getChoiceIndex) {
      var prototypeGetChoiceIndex = (thisPrototype.getChoiceIndex);
      return (prototypeGetChoiceIndex).call(this$1, choice, choicesLength)
    }

    // Default (old) getChoiceIndex implementation - english-compatible
    var defaultImpl = function (_choice, _choicesLength) {
      _choice = Math.abs(_choice);

      if (_choicesLength === 2) {
        return _choice
          ? _choice > 1
            ? 1
            : 0
          : 1
      }

      return _choice ? Math.min(_choice, 2) : 0
    };

    if (this$1.locale in this$1.pluralizationRules) {
      return this$1.pluralizationRules[this$1.locale].apply(this$1, [choice, choicesLength])
    } else {
      return defaultImpl(choice, choicesLength)
    }
  };


  this._exist = function (message, key) {
    if (!message || !key) { return false }
    if (!isNull(this$1._path.getPathValue(message, key))) { return true }
    // fallback for flat key
    if (message[key]) { return true }
    return false
  };

  if (this._warnHtmlInMessage === 'warn' || this._warnHtmlInMessage === 'error') {
    Object.keys(messages).forEach(function (locale) {
      this$1._checkLocaleMessage(locale, this$1._warnHtmlInMessage, messages[locale]);
    });
  }

  this._initVM({
    locale: locale,
    fallbackLocale: fallbackLocale,
    messages: messages,
    dateTimeFormats: dateTimeFormats,
    numberFormats: numberFormats
  });
};

var prototypeAccessors = { vm: { configurable: true },messages: { configurable: true },dateTimeFormats: { configurable: true },numberFormats: { configurable: true },availableLocales: { configurable: true },locale: { configurable: true },fallbackLocale: { configurable: true },formatFallbackMessages: { configurable: true },missing: { configurable: true },formatter: { configurable: true },silentTranslationWarn: { configurable: true },silentFallbackWarn: { configurable: true },preserveDirectiveContent: { configurable: true },warnHtmlInMessage: { configurable: true },postTranslation: { configurable: true } };

VueI18n.prototype._checkLocaleMessage = function _checkLocaleMessage (locale, level, message) {
  var paths = [];

  var fn = function (level, locale, message, paths) {
    if (isPlainObject(message)) {
      Object.keys(message).forEach(function (key) {
        var val = message[key];
        if (isPlainObject(val)) {
          paths.push(key);
          paths.push('.');
          fn(level, locale, val, paths);
          paths.pop();
          paths.pop();
        } else {
          paths.push(key);
          fn(level, locale, val, paths);
          paths.pop();
        }
      });
    } else if (Array.isArray(message)) {
      message.forEach(function (item, index) {
        if (isPlainObject(item)) {
          paths.push(("[" + index + "]"));
          paths.push('.');
          fn(level, locale, item, paths);
          paths.pop();
          paths.pop();
        } else {
          paths.push(("[" + index + "]"));
          fn(level, locale, item, paths);
          paths.pop();
        }
      });
    } else if (isString(message)) {
      var ret = htmlTagMatcher.test(message);
      if (ret) {
        var msg = "Detected HTML in message '" + message + "' of keypath '" + (paths.join('')) + "' at '" + locale + "'. Consider component interpolation with '<i18n>' to avoid XSS. See https://bit.ly/2ZqJzkp";
        if (level === 'warn') {
          warn(msg);
        } else if (level === 'error') {
          error(msg);
        }
      }
    }
  };

  fn(level, locale, message, paths);
};

VueI18n.prototype._initVM = function _initVM (data) {
  var silent = Vue$1.config.silent;
  Vue$1.config.silent = true;
  this._vm = new Vue$1({ data: data });
  Vue$1.config.silent = silent;
};

VueI18n.prototype.destroyVM = function destroyVM () {
  this._vm.$destroy();
};

VueI18n.prototype.subscribeDataChanging = function subscribeDataChanging (vm) {
  this._dataListeners.push(vm);
};

VueI18n.prototype.unsubscribeDataChanging = function unsubscribeDataChanging (vm) {
  remove(this._dataListeners, vm);
};

VueI18n.prototype.watchI18nData = function watchI18nData () {
  var self = this;
  return this._vm.$watch('$data', function () {
    var i = self._dataListeners.length;
    while (i--) {
      Vue$1.nextTick(function () {
        self._dataListeners[i] && self._dataListeners[i].$forceUpdate();
      });
    }
  }, { deep: true })
};

VueI18n.prototype.watchLocale = function watchLocale () {
  /* istanbul ignore if */
  if (!this._sync || !this._root) { return null }
  var target = this._vm;
  return this._root.$i18n.vm.$watch('locale', function (val) {
    target.$set(target, 'locale', val);
    target.$forceUpdate();
  }, { immediate: true })
};

VueI18n.prototype.onComponentInstanceCreated = function onComponentInstanceCreated (newI18n) {
  if (this._componentInstanceCreatedListener) {
    this._componentInstanceCreatedListener(newI18n, this);
  }
};

prototypeAccessors.vm.get = function () { return this._vm };

prototypeAccessors.messages.get = function () { return looseClone(this._getMessages()) };
prototypeAccessors.dateTimeFormats.get = function () { return looseClone(this._getDateTimeFormats()) };
prototypeAccessors.numberFormats.get = function () { return looseClone(this._getNumberFormats()) };
prototypeAccessors.availableLocales.get = function () { return Object.keys(this.messages).sort() };

prototypeAccessors.locale.get = function () { return this._vm.locale };
prototypeAccessors.locale.set = function (locale) {
  this._vm.$set(this._vm, 'locale', locale);
};

prototypeAccessors.fallbackLocale.get = function () { return this._vm.fallbackLocale };
prototypeAccessors.fallbackLocale.set = function (locale) {
  this._localeChainCache = {};
  this._vm.$set(this._vm, 'fallbackLocale', locale);
};

prototypeAccessors.formatFallbackMessages.get = function () { return this._formatFallbackMessages };
prototypeAccessors.formatFallbackMessages.set = function (fallback) { this._formatFallbackMessages = fallback; };

prototypeAccessors.missing.get = function () { return this._missing };
prototypeAccessors.missing.set = function (handler) { this._missing = handler; };

prototypeAccessors.formatter.get = function () { return this._formatter };
prototypeAccessors.formatter.set = function (formatter) { this._formatter = formatter; };

prototypeAccessors.silentTranslationWarn.get = function () { return this._silentTranslationWarn };
prototypeAccessors.silentTranslationWarn.set = function (silent) { this._silentTranslationWarn = silent; };

prototypeAccessors.silentFallbackWarn.get = function () { return this._silentFallbackWarn };
prototypeAccessors.silentFallbackWarn.set = function (silent) { this._silentFallbackWarn = silent; };

prototypeAccessors.preserveDirectiveContent.get = function () { return this._preserveDirectiveContent };
prototypeAccessors.preserveDirectiveContent.set = function (preserve) { this._preserveDirectiveContent = preserve; };

prototypeAccessors.warnHtmlInMessage.get = function () { return this._warnHtmlInMessage };
prototypeAccessors.warnHtmlInMessage.set = function (level) {
    var this$1 = this;

  var orgLevel = this._warnHtmlInMessage;
  this._warnHtmlInMessage = level;
  if (orgLevel !== level && (level === 'warn' || level === 'error')) {
    var messages = this._getMessages();
    Object.keys(messages).forEach(function (locale) {
      this$1._checkLocaleMessage(locale, this$1._warnHtmlInMessage, messages[locale]);
    });
  }
};

prototypeAccessors.postTranslation.get = function () { return this._postTranslation };
prototypeAccessors.postTranslation.set = function (handler) { this._postTranslation = handler; };

VueI18n.prototype._getMessages = function _getMessages () { return this._vm.messages };
VueI18n.prototype._getDateTimeFormats = function _getDateTimeFormats () { return this._vm.dateTimeFormats };
VueI18n.prototype._getNumberFormats = function _getNumberFormats () { return this._vm.numberFormats };

VueI18n.prototype._warnDefault = function _warnDefault (locale, key, result, vm, values, interpolateMode) {
  if (!isNull(result)) { return result }
  if (this._missing) {
    var missingRet = this._missing.apply(null, [locale, key, vm, values]);
    if (isString(missingRet)) {
      return missingRet
    }
  } else {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key)) {
      warn(
        "Cannot translate the value of keypath '" + key + "'. " +
        'Use the value of keypath as default.'
      );
    }
  }

  if (this._formatFallbackMessages) {
    var parsedArgs = parseArgs.apply(void 0, values);
    return this._render(key, interpolateMode, parsedArgs.params, key)
  } else {
    return key
  }
};

VueI18n.prototype._isFallbackRoot = function _isFallbackRoot (val) {
  return !val && !isNull(this._root) && this._fallbackRoot
};

VueI18n.prototype._isSilentFallbackWarn = function _isSilentFallbackWarn (key) {
  return this._silentFallbackWarn instanceof RegExp
    ? this._silentFallbackWarn.test(key)
    : this._silentFallbackWarn
};

VueI18n.prototype._isSilentFallback = function _isSilentFallback (locale, key) {
  return this._isSilentFallbackWarn(key) && (this._isFallbackRoot() || locale !== this.fallbackLocale)
};

VueI18n.prototype._isSilentTranslationWarn = function _isSilentTranslationWarn (key) {
  return this._silentTranslationWarn instanceof RegExp
    ? this._silentTranslationWarn.test(key)
    : this._silentTranslationWarn
};

VueI18n.prototype._interpolate = function _interpolate (
  locale,
  message,
  key,
  host,
  interpolateMode,
  values,
  visitedLinkStack
) {
  if (!message) { return null }

  var pathRet = this._path.getPathValue(message, key);
  if (Array.isArray(pathRet) || isPlainObject(pathRet)) { return pathRet }

  var ret;
  if (isNull(pathRet)) {
    /* istanbul ignore else */
    if (isPlainObject(message)) {
      ret = message[key];
      if (!isString(ret)) {
        if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallback(locale, key)) {
          warn(("Value of key '" + key + "' is not a string!"));
        }
        return null
      }
    } else {
      return null
    }
  } else {
    /* istanbul ignore else */
    if (isString(pathRet)) {
      ret = pathRet;
    } else {
      if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallback(locale, key)) {
        warn(("Value of key '" + key + "' is not a string!"));
      }
      return null
    }
  }

  // Check for the existence of links within the translated string
  if (ret.indexOf('@:') >= 0 || ret.indexOf('@.') >= 0) {
    ret = this._link(locale, message, ret, host, 'raw', values, visitedLinkStack);
  }

  return this._render(ret, interpolateMode, values, key)
};

VueI18n.prototype._link = function _link (
  locale,
  message,
  str,
  host,
  interpolateMode,
  values,
  visitedLinkStack
) {
  var ret = str;

  // Match all the links within the local
  // We are going to replace each of
  // them with its translation
  var matches = ret.match(linkKeyMatcher);
  for (var idx in matches) {
    // ie compatible: filter custom array
    // prototype method
    if (!matches.hasOwnProperty(idx)) {
      continue
    }
    var link = matches[idx];
    var linkKeyPrefixMatches = link.match(linkKeyPrefixMatcher);
    var linkPrefix = linkKeyPrefixMatches[0];
      var formatterName = linkKeyPrefixMatches[1];

    // Remove the leading @:, @.case: and the brackets
    var linkPlaceholder = link.replace(linkPrefix, '').replace(bracketsMatcher, '');

    if (includes(visitedLinkStack, linkPlaceholder)) {
      if (process.env.NODE_ENV !== 'production') {
        warn(("Circular reference found. \"" + link + "\" is already visited in the chain of " + (visitedLinkStack.reverse().join(' <- '))));
      }
      return ret
    }
    visitedLinkStack.push(linkPlaceholder);

    // Translate the link
    var translated = this._interpolate(
      locale, message, linkPlaceholder, host,
      interpolateMode === 'raw' ? 'string' : interpolateMode,
      interpolateMode === 'raw' ? undefined : values,
      visitedLinkStack
    );

    if (this._isFallbackRoot(translated)) {
      if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(linkPlaceholder)) {
        warn(("Fall back to translate the link placeholder '" + linkPlaceholder + "' with root locale."));
      }
      /* istanbul ignore if */
      if (!this._root) { throw Error('unexpected error') }
      var root = this._root.$i18n;
      translated = root._translate(
        root._getMessages(), root.locale, root.fallbackLocale,
        linkPlaceholder, host, interpolateMode, values
      );
    }
    translated = this._warnDefault(
      locale, linkPlaceholder, translated, host,
      Array.isArray(values) ? values : [values],
      interpolateMode
    );

    if (this._modifiers.hasOwnProperty(formatterName)) {
      translated = this._modifiers[formatterName](translated);
    } else if (defaultModifiers.hasOwnProperty(formatterName)) {
      translated = defaultModifiers[formatterName](translated);
    }

    visitedLinkStack.pop();

    // Replace the link with the translated
    ret = !translated ? ret : ret.replace(link, translated);
  }

  return ret
};

VueI18n.prototype._render = function _render (message, interpolateMode, values, path) {
  var ret = this._formatter.interpolate(message, values, path);

  // If the custom formatter refuses to work - apply the default one
  if (!ret) {
    ret = defaultFormatter.interpolate(message, values, path);
  }

  // if interpolateMode is **not** 'string' ('row'),
  // return the compiled data (e.g. ['foo', VNode, 'bar']) with formatter
  return interpolateMode === 'string' && !isString(ret) ? ret.join('') : ret
};

VueI18n.prototype._appendItemToChain = function _appendItemToChain (chain, item, blocks) {
  var follow = false;
  if (!includes(chain, item)) {
    follow = true;
    if (item) {
      follow = item[item.length - 1] !== '!';
      item = item.replace(/!/g, '');
      chain.push(item);
      if (blocks && blocks[item]) {
        follow = blocks[item];
      }
    }
  }
  return follow
};

VueI18n.prototype._appendLocaleToChain = function _appendLocaleToChain (chain, locale, blocks) {
  var follow;
  var tokens = locale.split('-');
  do {
    var item = tokens.join('-');
    follow = this._appendItemToChain(chain, item, blocks);
    tokens.splice(-1, 1);
  } while (tokens.length && (follow === true))
  return follow
};

VueI18n.prototype._appendBlockToChain = function _appendBlockToChain (chain, block, blocks) {
  var follow = true;
  for (var i = 0; (i < block.length) && (isBoolean(follow)); i++) {
    var locale = block[i];
    if (isString(locale)) {
      follow = this._appendLocaleToChain(chain, locale, blocks);
    }
  }
  return follow
};

VueI18n.prototype._getLocaleChain = function _getLocaleChain (start, fallbackLocale) {
  if (start === '') { return [] }

  if (!this._localeChainCache) {
    this._localeChainCache = {};
  }

  var chain = this._localeChainCache[start];
  if (!chain) {
    if (!fallbackLocale) {
      fallbackLocale = this.fallbackLocale;
    }
    chain = [];

    // first block defined by start
    var block = [start];

    // while any intervening block found
    while (isArray(block)) {
      block = this._appendBlockToChain(
        chain,
        block,
        fallbackLocale
      );
    }

    // last block defined by default
    var defaults;
    if (isArray(fallbackLocale)) {
      defaults = fallbackLocale;
    } else if (isObject(fallbackLocale)) {
      /* $FlowFixMe */
      if (fallbackLocale['default']) {
        defaults = fallbackLocale['default'];
      } else {
        defaults = null;
      }
    } else {
      defaults = fallbackLocale;
    }

    // convert defaults to array
    if (isString(defaults)) {
      block = [defaults];
    } else {
      block = defaults;
    }
    if (block) {
      this._appendBlockToChain(
        chain,
        block,
        null
      );
    }
    this._localeChainCache[start] = chain;
  }
  return chain
};

VueI18n.prototype._translate = function _translate (
  messages,
  locale,
  fallback,
  key,
  host,
  interpolateMode,
  args
) {
  var chain = this._getLocaleChain(locale, fallback);
  var res;
  for (var i = 0; i < chain.length; i++) {
    var step = chain[i];
    res =
      this._interpolate(step, messages[step], key, host, interpolateMode, args, [key]);
    if (!isNull(res)) {
      if (step !== locale && process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
        warn(("Fall back to translate the keypath '" + key + "' with '" + step + "' locale."));
      }
      return res
    }
  }
  return null
};

VueI18n.prototype._t = function _t (key, _locale, messages, host) {
    var ref;

    var values = [], len = arguments.length - 4;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 4 ];
  if (!key) { return '' }

  var parsedArgs = parseArgs.apply(void 0, values);
  var locale = parsedArgs.locale || _locale;

  var ret = this._translate(
    messages, locale, this.fallbackLocale, key,
    host, 'string', parsedArgs.params
  );
  if (this._isFallbackRoot(ret)) {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
      warn(("Fall back to translate the keypath '" + key + "' with root locale."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return (ref = this._root).$t.apply(ref, [ key ].concat( values ))
  } else {
    ret = this._warnDefault(locale, key, ret, host, values, 'string');
    if (this._postTranslation && ret !== null && ret !== undefined) {
      ret = this._postTranslation(ret, key);
    }
    return ret
  }
};

VueI18n.prototype.t = function t (key) {
    var ref;

    var values = [], len = arguments.length - 1;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];
  return (ref = this)._t.apply(ref, [ key, this.locale, this._getMessages(), null ].concat( values ))
};

VueI18n.prototype._i = function _i (key, locale, messages, host, values) {
  var ret =
    this._translate(messages, locale, this.fallbackLocale, key, host, 'raw', values);
  if (this._isFallbackRoot(ret)) {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key)) {
      warn(("Fall back to interpolate the keypath '" + key + "' with root locale."));
    }
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.i(key, locale, values)
  } else {
    return this._warnDefault(locale, key, ret, host, [values], 'raw')
  }
};

VueI18n.prototype.i = function i (key, locale, values) {
  /* istanbul ignore if */
  if (!key) { return '' }

  if (!isString(locale)) {
    locale = this.locale;
  }

  return this._i(key, locale, this._getMessages(), null, values)
};

VueI18n.prototype._tc = function _tc (
  key,
  _locale,
  messages,
  host,
  choice
) {
    var ref;

    var values = [], len = arguments.length - 5;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 5 ];
  if (!key) { return '' }
  if (choice === undefined) {
    choice = 1;
  }

  var predefined = { 'count': choice, 'n': choice };
  var parsedArgs = parseArgs.apply(void 0, values);
  parsedArgs.params = Object.assign(predefined, parsedArgs.params);
  values = parsedArgs.locale === null ? [parsedArgs.params] : [parsedArgs.locale, parsedArgs.params];
  return this.fetchChoice((ref = this)._t.apply(ref, [ key, _locale, messages, host ].concat( values )), choice)
};

VueI18n.prototype.fetchChoice = function fetchChoice (message, choice) {
  /* istanbul ignore if */
  if (!message && !isString(message)) { return null }
  var choices = message.split('|');

  choice = this.getChoiceIndex(choice, choices.length);
  if (!choices[choice]) { return message }
  return choices[choice].trim()
};

VueI18n.prototype.tc = function tc (key, choice) {
    var ref;

    var values = [], len = arguments.length - 2;
    while ( len-- > 0 ) values[ len ] = arguments[ len + 2 ];
  return (ref = this)._tc.apply(ref, [ key, this.locale, this._getMessages(), null, choice ].concat( values ))
};

VueI18n.prototype._te = function _te (key, locale, messages) {
    var args = [], len = arguments.length - 3;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 3 ];

  var _locale = parseArgs.apply(void 0, args).locale || locale;
  return this._exist(messages[_locale], key)
};

VueI18n.prototype.te = function te (key, locale) {
  return this._te(key, this.locale, this._getMessages(), locale)
};

VueI18n.prototype.getLocaleMessage = function getLocaleMessage (locale) {
  return looseClone(this._vm.messages[locale] || {})
};

VueI18n.prototype.setLocaleMessage = function setLocaleMessage (locale, message) {
  if (this._warnHtmlInMessage === 'warn' || this._warnHtmlInMessage === 'error') {
    this._checkLocaleMessage(locale, this._warnHtmlInMessage, message);
  }
  this._vm.$set(this._vm.messages, locale, message);
};

VueI18n.prototype.mergeLocaleMessage = function mergeLocaleMessage (locale, message) {
  if (this._warnHtmlInMessage === 'warn' || this._warnHtmlInMessage === 'error') {
    this._checkLocaleMessage(locale, this._warnHtmlInMessage, message);
  }
  this._vm.$set(this._vm.messages, locale, merge({}, this._vm.messages[locale] || {}, message));
};

VueI18n.prototype.getDateTimeFormat = function getDateTimeFormat (locale) {
  return looseClone(this._vm.dateTimeFormats[locale] || {})
};

VueI18n.prototype.setDateTimeFormat = function setDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, format);
  this._clearDateTimeFormat(locale, format);
};

VueI18n.prototype.mergeDateTimeFormat = function mergeDateTimeFormat (locale, format) {
  this._vm.$set(this._vm.dateTimeFormats, locale, merge(this._vm.dateTimeFormats[locale] || {}, format));
  this._clearDateTimeFormat(locale, format);
};

VueI18n.prototype._clearDateTimeFormat = function _clearDateTimeFormat (locale, format) {
  for (var key in format) {
    var id = locale + "__" + key;

    if (!this._dateTimeFormatters.hasOwnProperty(id)) {
      continue
    }

    delete this._dateTimeFormatters[id];
  }
};

VueI18n.prototype._localizeDateTime = function _localizeDateTime (
  value,
  locale,
  fallback,
  dateTimeFormats,
  key
) {
  var _locale = locale;
  var formats = dateTimeFormats[_locale];

  var chain = this._getLocaleChain(locale, fallback);
  for (var i = 0; i < chain.length; i++) {
    var current = _locale;
    var step = chain[i];
    formats = dateTimeFormats[step];
    _locale = step;
    // fallback locale
    if (isNull(formats) || isNull(formats[key])) {
      if (step !== locale && process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
        warn(("Fall back to '" + step + "' datetime formats from '" + current + "' datetime formats."));
      }
    } else {
      break
    }
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];
    var id = _locale + "__" + key;
    var formatter = this._dateTimeFormatters[id];
    if (!formatter) {
      formatter = this._dateTimeFormatters[id] = new Intl.DateTimeFormat(_locale, format);
    }
    return formatter.format(value)
  }
};

VueI18n.prototype._d = function _d (value, locale, key) {
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && !VueI18n.availabilities.dateTimeFormat) {
    warn('Cannot format a Date value due to not supported Intl.DateTimeFormat.');
    return ''
  }

  if (!key) {
    return new Intl.DateTimeFormat(locale).format(value)
  }

  var ret =
    this._localizeDateTime(value, locale, this.fallbackLocale, this._getDateTimeFormats(), key);
  if (this._isFallbackRoot(ret)) {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
      warn(("Fall back to datetime localization of root: key '" + key + "'."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.d(value, key, locale)
  } else {
    return ret || ''
  }
};

VueI18n.prototype.d = function d (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;

  if (args.length === 1) {
    if (isString(args[0])) {
      key = args[0];
    } else if (isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }
    }
  } else if (args.length === 2) {
    if (isString(args[0])) {
      key = args[0];
    }
    if (isString(args[1])) {
      locale = args[1];
    }
  }

  return this._d(value, locale, key)
};

VueI18n.prototype.getNumberFormat = function getNumberFormat (locale) {
  return looseClone(this._vm.numberFormats[locale] || {})
};

VueI18n.prototype.setNumberFormat = function setNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, format);
  this._clearNumberFormat(locale, format);
};

VueI18n.prototype.mergeNumberFormat = function mergeNumberFormat (locale, format) {
  this._vm.$set(this._vm.numberFormats, locale, merge(this._vm.numberFormats[locale] || {}, format));
  this._clearNumberFormat(locale, format);
};

VueI18n.prototype._clearNumberFormat = function _clearNumberFormat (locale, format) {
  for (var key in format) {
    var id = locale + "__" + key;

    if (!this._numberFormatters.hasOwnProperty(id)) {
      continue
    }

    delete this._numberFormatters[id];
  }
};

VueI18n.prototype._getNumberFormatter = function _getNumberFormatter (
  value,
  locale,
  fallback,
  numberFormats,
  key,
  options
) {
  var _locale = locale;
  var formats = numberFormats[_locale];

  var chain = this._getLocaleChain(locale, fallback);
  for (var i = 0; i < chain.length; i++) {
    var current = _locale;
    var step = chain[i];
    formats = numberFormats[step];
    _locale = step;
    // fallback locale
    if (isNull(formats) || isNull(formats[key])) {
      if (step !== locale && process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
        warn(("Fall back to '" + step + "' number formats from '" + current + "' number formats."));
      }
    } else {
      break
    }
  }

  if (isNull(formats) || isNull(formats[key])) {
    return null
  } else {
    var format = formats[key];

    var formatter;
    if (options) {
      // If options specified - create one time number formatter
      formatter = new Intl.NumberFormat(_locale, Object.assign({}, format, options));
    } else {
      var id = _locale + "__" + key;
      formatter = this._numberFormatters[id];
      if (!formatter) {
        formatter = this._numberFormatters[id] = new Intl.NumberFormat(_locale, format);
      }
    }
    return formatter
  }
};

VueI18n.prototype._n = function _n (value, locale, key, options) {
  /* istanbul ignore if */
  if (!VueI18n.availabilities.numberFormat) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Cannot format a Number value due to not supported Intl.NumberFormat.');
    }
    return ''
  }

  if (!key) {
    var nf = !options ? new Intl.NumberFormat(locale) : new Intl.NumberFormat(locale, options);
    return nf.format(value)
  }

  var formatter = this._getNumberFormatter(value, locale, this.fallbackLocale, this._getNumberFormats(), key, options);
  var ret = formatter && formatter.format(value);
  if (this._isFallbackRoot(ret)) {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key) && !this._isSilentFallbackWarn(key)) {
      warn(("Fall back to number localization of root: key '" + key + "'."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n.n(value, Object.assign({}, { key: key, locale: locale }, options))
  } else {
    return ret || ''
  }
};

VueI18n.prototype.n = function n (value) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

  var locale = this.locale;
  var key = null;
  var options = null;

  if (args.length === 1) {
    if (isString(args[0])) {
      key = args[0];
    } else if (isObject(args[0])) {
      if (args[0].locale) {
        locale = args[0].locale;
      }
      if (args[0].key) {
        key = args[0].key;
      }

      // Filter out number format options only
      options = Object.keys(args[0]).reduce(function (acc, key) {
          var obj;

        if (includes(numberFormatKeys, key)) {
          return Object.assign({}, acc, ( obj = {}, obj[key] = args[0][key], obj ))
        }
        return acc
      }, null);
    }
  } else if (args.length === 2) {
    if (isString(args[0])) {
      key = args[0];
    }
    if (isString(args[1])) {
      locale = args[1];
    }
  }

  return this._n(value, locale, key, options)
};

VueI18n.prototype._ntp = function _ntp (value, locale, key, options) {
  /* istanbul ignore if */
  if (!VueI18n.availabilities.numberFormat) {
    if (process.env.NODE_ENV !== 'production') {
      warn('Cannot format to parts a Number value due to not supported Intl.NumberFormat.');
    }
    return []
  }

  if (!key) {
    var nf = !options ? new Intl.NumberFormat(locale) : new Intl.NumberFormat(locale, options);
    return nf.formatToParts(value)
  }

  var formatter = this._getNumberFormatter(value, locale, this.fallbackLocale, this._getNumberFormats(), key, options);
  var ret = formatter && formatter.formatToParts(value);
  if (this._isFallbackRoot(ret)) {
    if (process.env.NODE_ENV !== 'production' && !this._isSilentTranslationWarn(key)) {
      warn(("Fall back to format number to parts of root: key '" + key + "' ."));
    }
    /* istanbul ignore if */
    if (!this._root) { throw Error('unexpected error') }
    return this._root.$i18n._ntp(value, locale, key, options)
  } else {
    return ret || []
  }
};

Object.defineProperties( VueI18n.prototype, prototypeAccessors );

var availabilities;
// $FlowFixMe
Object.defineProperty(VueI18n, 'availabilities', {
  get: function get () {
    if (!availabilities) {
      var intlDefined = typeof Intl !== 'undefined';
      availabilities = {
        dateTimeFormat: intlDefined && typeof Intl.DateTimeFormat !== 'undefined',
        numberFormat: intlDefined && typeof Intl.NumberFormat !== 'undefined'
      };
    }

    return availabilities
  }
});

VueI18n.install = install;
VueI18n.version = '8.18.1';Vue$2.use(VueI18n);

// Ready translated locale messages
//const messages = {
//    en: {
//        "No Results": "No results (en)"
//    }
//}
const messages = {
    en: {
        "response_error_generic": "An error occurred while searching for your results. Please contact the site administrator."
    }
};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
});const HawkSearchField = Vue$2.extend({
	data: function () {
		return {

		}
	},
	store,
	i18n,
	components: {
		SearchBox: __vue_component__$1
    }
});var script$2 = {
    name: 'search-results-label',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'searchOutput'
        ]),
        keyword: function () {
            return this.searchOutput ? this.searchOutput.Keyword : null;
        }
    }
};/* script */
const __vue_script__$2 = script$2;
/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail__results-label" }, [
    _c(
      "h3",
      [
        _vm.keyword
          ? [
              _vm._v(
                "\n            " +
                  _vm._s(_vm.$t("Search Results for")) +
                  " " +
                  _vm._s(_vm.keyword) +
                  "\n        "
              )
            ]
          : [
              _vm._v(
                "\n            " +
                  _vm._s(_vm.$t("Search Results")) +
                  "\n        "
              )
            ]
      ],
      2
    )
  ])
};
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = undefined;
  /* scoped */
  const __vue_scope_id__$2 = "data-v-69124ea2";
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$2 = normalizeComponent(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    false,
    undefined,
    undefined,
    undefined
  );//
//
//
//
//
//
//
//


var script$3 = {
    name: 'x-circle-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$3 = script$3;
/* template */
var __vue_render__$3 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon icon-help-header " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          fill: "#d9534f",
          d:
            "M15.998 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16v0c0-8.837 7.163-16 16-16v0z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        attrs: {
          fill: "#fff",
          d:
            "M13.6 11.646l7.171 7.171c0.541 0.541 0.541 1.417 0 1.958l0.002-0.002c-0.541 0.541-1.417 0.541-1.958 0l-7.171-7.171c-0.541-0.541-0.541-1.417 0-1.958l-0.002 0.002c0.541-0.541 1.417-0.541 1.958 0z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        attrs: {
          fill: "#fff",
          d:
            "M20.774 13.6l-7.174 7.174c-0.54 0.54-1.415 0.54-1.955 0l-0.002-0.002c-0.54-0.54-0.54-1.415 0-1.955l7.174-7.174c0.54-0.54 1.415-0.54 1.955 0l0.002 0.002c0.54 0.54 0.54 1.415 0 1.955z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  const __vue_inject_styles__$3 = undefined;
  /* scoped */
  const __vue_scope_id__$3 = "data-v-4b1d7076";
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$3 = normalizeComponent(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$4 = {
    name: 'selections',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    components: {
        XCircleSvg: __vue_component__$3
    },
    methods: {
        itemClass: function (item) {
            if (item.startsWith('-')) {
                return 'hawk-selections__item-name hawk-selections__item-name--negated';
            }
            else {
                return 'hawk-selections__item-name';
            }
        },
        clearSelectionField: function (field) {
            var selections = Object.assign({}, this.facetSelections);

            if (selections.hasOwnProperty(field)) {
                delete selections[field];
                this.refreshResults(selections);
            }
        },
        clearSelectionItem: function (field, item) {
            var selections = Object.assign({}, this.facetSelections);

            if (selections.hasOwnProperty(field)) {
                selections[field] = selections[field].filter(v => v != item);

                if (selections[field].length == 0) {
                    delete selections[field];
                }

                this.refreshResults(selections);
            }
        },
        clearAll: function () {
            this.refreshResults({});
        },
        refreshResults: function (facetSelections) {
            this.$root.$store.dispatch('fetchResults', { FacetSelections: facetSelections });
        },
        getFacetType: function (field) {
            if (this.searchOutput) {
                var facets = this.searchOutput.Facets;
                var type;

                facets.forEach(facet => {
                    if (HawkSearchVue.getFacetParamName(facet) == field) {
                        type = facet.FieldType;
                    }
                });

                return type;
            }
        },
        rangeLabel: function (item) {
            return item.split(',').join(' - ');
        }
    },
    computed: {
        ...mapState([
            'pendingSearch',
            'searchOutput'
        ]),
        facetSelections: function () {
            return this.pendingSearch.FacetSelections;
        },
        hasSelections: function () {
            return Object.keys(this.facetSelections).length != 0;
        },
        facetSelectionsLabels: function () {
            var facetSelectionsLabels = Object.assign({}, this.pendingSearch.FacetSelections);

            if (this.searchOutput) {
                var facets = this.searchOutput.Facets;
                var field;

                facets.forEach(facet => {
                    field = HawkSearchVue.getFacetParamName(facet);

                    if (facetSelectionsLabels.hasOwnProperty(field)) {
                        facetSelectionsLabels[field] = facet.Name;
                    }
                });
            }

            return facetSelectionsLabels
        }
    }
};/* script */
const __vue_script__$4 = script$4;
/* template */
var __vue_render__$4 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.hasSelections
    ? _c("div", { staticClass: "hawk-facet-rail__selections" }, [
        _c("h4", [_vm._v(_vm._s(_vm.$t("You've Selected")))]),
        _vm._v(" "),
        _c(
          "ul",
          { staticClass: "hawk-selections" },
          [
            _vm._l(_vm.facetSelections, function(facetValues, field) {
              return _c(
                "li",
                { key: field, staticClass: "hawk-selections__category" },
                [
                  _c(
                    "div",
                    { staticClass: "hawk-selections__category-wrapper" },
                    [
                      _c(
                        "span",
                        { staticClass: "hawk-selections__category-name" },
                        [_vm._v(_vm._s(_vm.facetSelectionsLabels[field]) + ":")]
                      ),
                      _vm._v(" "),
                      _c(
                        "ul",
                        { staticClass: "hawk-selections__item-list" },
                        _vm._l(facetValues, function(item) {
                          return _c(
                            "li",
                            { key: item, staticClass: "hawk-selections__item" },
                            [
                              _c(
                                "button",
                                {
                                  staticClass: "hawk-selections__item-remove",
                                  on: {
                                    click: function($event) {
                                      return _vm.clearSelectionItem(field, item)
                                    }
                                  }
                                },
                                [_c("x-circle-svg")],
                                1
                              ),
                              _vm._v(" "),
                              _c(
                                "span",
                                { class: _vm.itemClass(item) },
                                [
                                  _vm.getFacetType(field) == "range"
                                    ? [
                                        _vm._v(
                                          "\n                                " +
                                            _vm._s(_vm.rangeLabel(item)) +
                                            "\n                            "
                                        )
                                      ]
                                    : [
                                        _vm._v(
                                          "\n                                " +
                                            _vm._s(item) +
                                            "\n                            "
                                        )
                                      ]
                                ],
                                2
                              )
                            ]
                          )
                        }),
                        0
                      )
                    ]
                  ),
                  _vm._v(" "),
                  _c(
                    "button",
                    {
                      staticClass: "hawk-selections__category-remove",
                      on: {
                        click: function($event) {
                          return _vm.clearSelectionField(field)
                        }
                      }
                    },
                    [_c("x-circle-svg")],
                    1
                  )
                ]
              )
            }),
            _vm._v(" "),
            _c("li", { staticClass: "hawk-selections__category" }, [
              _c(
                "button",
                {
                  staticClass: "hawk-btn hawk-btn-primary-outline",
                  on: { click: _vm.clearAll }
                },
                [
                  _vm._v(
                    "\n                " +
                      _vm._s(_vm.$t("Clear All")) +
                      "\n            "
                  )
                ]
              )
            ])
          ],
          2
        )
      ])
    : _vm._e()
};
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  const __vue_inject_styles__$4 = undefined;
  /* scoped */
  const __vue_scope_id__$4 = "data-v-78ab9ab7";
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$4 = normalizeComponent(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    false,
    undefined,
    undefined,
    undefined
  );var script$5 = {
    name: 'sorting',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {
        onChange: function (e) {
            this.$root.$store.dispatch('applySort', e.target.value);
        }
    },
    computed: {
        ...mapState([
            'searchOutput'
        ]),
        sorting: function () {
            return this.searchOutput.Sorting;
        }
    }
};/* script */
const __vue_script__$5 = script$5;
/* template */
var __vue_render__$5 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-sorting" }, [
    _c("span", { staticClass: "hawk-sorting__label" }, [
      _vm._v(_vm._s(_vm.$t("Sort By")))
    ]),
    _vm._v(" "),
    _c(
      "select",
      { on: { change: _vm.onChange } },
      _vm._l(_vm.sorting.Items, function(sortingItem, key) {
        return _c(
          "option",
          { key: sortingItem.Value, domProps: { value: sortingItem.Value } },
          [_vm._v("\n            " + _vm._s(sortingItem.Label) + "\n        ")]
        )
      }),
      0
    )
  ])
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  const __vue_inject_styles__$5 = undefined;
  /* scoped */
  const __vue_scope_id__$5 = "data-v-da79e6ec";
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$5 = normalizeComponent(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    false,
    undefined,
    undefined,
    undefined
  );var script$6 = {
    name: 'left-chevron-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$6 = script$6;
/* template */
var __vue_render__$6 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 19 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M18.462 27.891c0.457 0.427 0.742 1.034 0.742 1.707s-0.285 1.279-0.741 1.705l-0.001 0.001c-0.467 0.437-1.097 0.705-1.789 0.705s-1.322-0.268-1.79-0.706l0.002 0.001-14.146-13.598c-0.457-0.427-0.742-1.034-0.742-1.707s0.285-1.28 0.741-1.705l0.001-0.001 14.142-13.589c0.468-0.436 1.097-0.704 1.79-0.704s1.322 0.268 1.791 0.706l-0.002-0.001c0.457 0.427 0.742 1.034 0.742 1.707s-0.285 1.28-0.741 1.705l-0.001 0.001-11.597 11.883z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  const __vue_inject_styles__$6 = undefined;
  /* scoped */
  const __vue_scope_id__$6 = "data-v-727de6e9";
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$6 = normalizeComponent(
    { render: __vue_render__$6, staticRenderFns: __vue_staticRenderFns__$6 },
    __vue_inject_styles__$6,
    __vue_script__$6,
    __vue_scope_id__$6,
    __vue_is_functional_template__$6,
    __vue_module_identifier__$6,
    false,
    undefined,
    undefined,
    undefined
  );var script$7 = {
    name: 'right-chevron-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$7 = script$7;
/* template */
var __vue_render__$7 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 19 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M0.738 4.109c-0.457-0.427-0.742-1.034-0.742-1.707s0.285-1.28 0.741-1.705l0.001-0.001c0.467-0.437 1.097-0.705 1.789-0.705s1.322 0.268 1.79 0.706l-0.002-0.001 14.146 13.598c0.457 0.427 0.742 1.034 0.742 1.707s-0.285 1.279-0.741 1.705l-0.001 0.001-14.142 13.589c-0.468 0.436-1.097 0.704-1.79 0.704s-1.322-0.268-1.791-0.706l0.002 0.001c-0.457-0.427-0.742-1.034-0.742-1.707s0.285-1.279 0.741-1.705l0.001-0.001 11.597-11.883z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  const __vue_inject_styles__$7 = undefined;
  /* scoped */
  const __vue_scope_id__$7 = "data-v-77afa9fe";
  /* module identifier */
  const __vue_module_identifier__$7 = undefined;
  /* functional template */
  const __vue_is_functional_template__$7 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$7 = normalizeComponent(
    { render: __vue_render__$7, staticRenderFns: __vue_staticRenderFns__$7 },
    __vue_inject_styles__$7,
    __vue_script__$7,
    __vue_scope_id__$7,
    __vue_is_functional_template__$7,
    __vue_module_identifier__$7,
    false,
    undefined,
    undefined,
    undefined
  );var script$8 = {
    name: 'pager',
    props: [],
    components: {
        LeftChevronSvg: __vue_component__$6,
        RightChevronSvg: __vue_component__$7
    },
    mounted() {

    },
    data() {
        return {
            hasError: false
        }
    },
    methods: {
        goToPreviousPage: function () {
            if (this.page > 1) {
                this.goToPage(parseInt(this.page, 10) - 1);
            }
        },
        goToNextPage: function () {
            if (this.page < this.totalPages) {
                this.goToPage(parseInt(this.page, 10) + 1);
            }
        },
        onChange: function (e) {
            this.goToPage(e.target.value);
        },
        goToPage: function (page) {
            if (page >= 1 && page <= this.totalPages) {
                this.$root.$store.dispatch('applyPageNumber', page);
            }
        }
    },
    computed: {
        ...mapState([
            'searchOutput'
        ]),
        pagination: function () {
            return this.searchOutput.Pagination;
        },
        page: function () {
            return this.pagination.CurrentPage;
        },
        totalPages: function () {
            return this.pagination.NofPages;
        }
    }
};/* script */
const __vue_script__$8 = script$8;
/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-pagination__controls" }, [
    _c(
      "button",
      {
        staticClass: "hawk-pagination__item",
        on: { click: _vm.goToPreviousPage }
      },
      [
        _c("left-chevron-svg", {
          attrs: { "icon-class": "hawk-pagination__left" }
        })
      ],
      1
    ),
    _vm._v(" "),
    _c("input", {
      class: _vm.hasError
        ? "hawk-pagination__input error"
        : "hawk-pagination__input",
      attrs: { type: "number" },
      domProps: { value: _vm.page },
      on: { change: _vm.onChange }
    }),
    _vm._v(" "),
    _c("span", { staticClass: "hawk-pagination__total-text" }, [
      _c("span", { staticClass: "break" }),
      _vm._v(" of " + _vm._s(_vm.totalPages))
    ]),
    _vm._v(" "),
    _c(
      "button",
      { staticClass: "hawk-pagination__item", on: { click: _vm.goToNextPage } },
      [
        _c("right-chevron-svg", {
          attrs: { "icon-class": "hawk-pagination__right" }
        })
      ],
      1
    )
  ])
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  const __vue_inject_styles__$8 = undefined;
  /* scoped */
  const __vue_scope_id__$8 = "data-v-4c864ec4";
  /* module identifier */
  const __vue_module_identifier__$8 = undefined;
  /* functional template */
  const __vue_is_functional_template__$8 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$8 = normalizeComponent(
    { render: __vue_render__$8, staticRenderFns: __vue_staticRenderFns__$8 },
    __vue_inject_styles__$8,
    __vue_script__$8,
    __vue_scope_id__$8,
    __vue_is_functional_template__$8,
    __vue_module_identifier__$8,
    false,
    undefined,
    undefined,
    undefined
  );var script$9 = {
    name: 'items-per-page',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {
        onChange: function (e) {
            this.$root.$store.dispatch('applyPageSize', e.target.value);
        }
    },
    computed: {
        ...mapState([
            'searchOutput'
        ]),
        pagination: function () {
            return this.searchOutput.Pagination;
        }
    }
};/* script */
const __vue_script__$9 = script$9;
/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-items-per-page" }, [
    _c(
      "select",
      {
        attrs: { value: "pagination.MaxPerPage" },
        on: { change: _vm.onChange }
      },
      _vm._l(_vm.pagination.Items, function(paginationItem) {
        return _c(
          "option",
          {
            key: paginationItem.PageSize,
            domProps: { value: paginationItem.PageSize }
          },
          [
            _vm._v(
              "\n            " + _vm._s(paginationItem.Label) + "\n        "
            )
          ]
        )
      }),
      0
    )
  ])
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  const __vue_inject_styles__$9 = undefined;
  /* scoped */
  const __vue_scope_id__$9 = "data-v-37e0625a";
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$9 = normalizeComponent(
    { render: __vue_render__$9, staticRenderFns: __vue_staticRenderFns__$9 },
    __vue_inject_styles__$9,
    __vue_script__$9,
    __vue_scope_id__$9,
    __vue_is_functional_template__$9,
    __vue_module_identifier__$9,
    false,
    undefined,
    undefined,
    undefined
  );var script$a = {
    name: 'pagination',
    props: [],
    components: {
        Pager: __vue_component__$8,
        ItemsPerPage: __vue_component__$9
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$a = script$a;
/* template */
var __vue_render__$a = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-pagination" },
    [_c("pager"), _vm._v(" "), _c("items-per-page")],
    1
  )
};
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  const __vue_inject_styles__$a = undefined;
  /* scoped */
  const __vue_scope_id__$a = "data-v-7d3f1983";
  /* module identifier */
  const __vue_module_identifier__$a = undefined;
  /* functional template */
  const __vue_is_functional_template__$a = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$a = normalizeComponent(
    { render: __vue_render__$a, staticRenderFns: __vue_staticRenderFns__$a },
    __vue_inject_styles__$a,
    __vue_script__$a,
    __vue_scope_id__$a,
    __vue_is_functional_template__$a,
    __vue_module_identifier__$a,
    false,
    undefined,
    undefined,
    undefined
  );var script$b = {
    name: 'tool-row',
    components: {
        Sorting: __vue_component__$5,
        Pagination: __vue_component__$a
    },
    computed: {
        ...mapState([
            'searchOutput'
        ])
    }
};/* script */
const __vue_script__$b = script$b;
/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.searchOutput
    ? _c("div", { staticClass: "hawk-tool-row" }, [
        _c("div", { staticClass: "hawk-tool-row__item" }, [_c("sorting")], 1),
        _vm._v(" "),
        _c("div", { staticClass: "hawk-tool-row__item" }, [_c("pagination")], 1)
      ])
    : _vm._e()
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  const __vue_inject_styles__$b = undefined;
  /* scoped */
  const __vue_scope_id__$b = "data-v-c07391c8";
  /* module identifier */
  const __vue_module_identifier__$b = undefined;
  /* functional template */
  const __vue_is_functional_template__$b = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$b = normalizeComponent(
    { render: __vue_render__$b, staticRenderFns: __vue_staticRenderFns__$b },
    __vue_inject_styles__$b,
    __vue_script__$b,
    __vue_scope_id__$b,
    __vue_is_functional_template__$b,
    __vue_module_identifier__$b,
    false,
    undefined,
    undefined,
    undefined
  );var script$c = {
    name: 'result-image',
    props: {
        imagePath: {
            default: null
        }
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'config'
        ]),
        imageUrl: function () {
            return this.imagePath;
        } 
    }
};/* script */
const __vue_script__$c = script$c;
/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { className: "hawk-results__item-image" } }, [
    _c("img", { attrs: { src: _vm.imageUrl } })
  ])
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  const __vue_inject_styles__$c = undefined;
  /* scoped */
  const __vue_scope_id__$c = "data-v-548895e8";
  /* module identifier */
  const __vue_module_identifier__$c = undefined;
  /* functional template */
  const __vue_is_functional_template__$c = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$c = normalizeComponent(
    { render: __vue_render__$c, staticRenderFns: __vue_staticRenderFns__$c },
    __vue_inject_styles__$c,
    __vue_script__$c,
    __vue_scope_id__$c,
    __vue_is_functional_template__$c,
    __vue_module_identifier__$c,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$d = {
    name: "ResultItem",
    data: function () {
        return {}
    },
    components: {
        ResultImage: __vue_component__$c
    },
    props: {
        result: {
            default: null
        }
    },
    methods: {
        getField: function (fieldName) {
            if (this.result &&
                this.result.Document &&
                this.result.Document[fieldName] &&
                this.result.Document[fieldName].length) {

                return this.result.Document[fieldName][0];
            }
        }
    }
};/* script */
const __vue_script__$d = script$d;
/* template */
var __vue_render__$d = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-results__item" },
    [
      _c("result-image", { attrs: { imagePath: _vm.getField("image") } }),
      _vm._v(" "),
      _c("div", { staticClass: "hawk-results__item-name" }, [
        _c("span", [_vm._v(_vm._s(this.getField("itemname")))])
      ])
    ],
    1
  )
};
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  const __vue_inject_styles__$d = undefined;
  /* scoped */
  const __vue_scope_id__$d = "data-v-4170b38b";
  /* module identifier */
  const __vue_module_identifier__$d = undefined;
  /* functional template */
  const __vue_is_functional_template__$d = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$d = normalizeComponent(
    { render: __vue_render__$d, staticRenderFns: __vue_staticRenderFns__$d },
    __vue_inject_styles__$d,
    __vue_script__$d,
    __vue_scope_id__$d,
    __vue_is_functional_template__$d,
    __vue_module_identifier__$d,
    false,
    undefined,
    undefined,
    undefined
  );//
//
//
//
//
//


var script$e = {
    name: 'placeholder-image',
    props: ['showSpinner'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {
        getHeight: function () {
            return Math.round(Math.random() * (175 - 125) + 125);
        }
    },
    computed: {

    }
};/* script */
const __vue_script__$e = script$e;
/* template */
var __vue_render__$e = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      staticClass: "hawk-results__item-placeholder",
      style: "height: " + _vm.getHeight() + "px"
    },
    [
      _vm.showSpinner
        ? _c("div", { staticClass: "hawk-placeholder__image" }, [
            _vm._v(_vm._s(_vm.$t("Loading")) + "...")
          ])
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  const __vue_inject_styles__$e = undefined;
  /* scoped */
  const __vue_scope_id__$e = "data-v-20f93802";
  /* module identifier */
  const __vue_module_identifier__$e = undefined;
  /* functional template */
  const __vue_is_functional_template__$e = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$e = normalizeComponent(
    { render: __vue_render__$e, staticRenderFns: __vue_staticRenderFns__$e },
    __vue_inject_styles__$e,
    __vue_script__$e,
    __vue_scope_id__$e,
    __vue_is_functional_template__$e,
    __vue_module_identifier__$e,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$f = {
    name: 'placeholder-item',
    props: [],
    components: {
        PlaceholderImage: __vue_component__$e
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$f = script$f;
/* template */
var __vue_render__$f = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-results__item" }, [
    _c(
      "div",
      { staticClass: "hawk-results__item-image" },
      [_c("placeholder-image")],
      1
    ),
    _vm._v(" "),
    _vm._m(0)
  ])
};
var __vue_staticRenderFns__$f = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("div", { staticClass: "hawk-results__item-name" }, [
      _c("div", { staticClass: "hawk-results__item-name-placeholder" })
    ])
  }
];
__vue_render__$f._withStripped = true;

  /* style */
  const __vue_inject_styles__$f = undefined;
  /* scoped */
  const __vue_scope_id__$f = "data-v-4c490d1f";
  /* module identifier */
  const __vue_module_identifier__$f = undefined;
  /* functional template */
  const __vue_is_functional_template__$f = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$f = normalizeComponent(
    { render: __vue_render__$f, staticRenderFns: __vue_staticRenderFns__$f },
    __vue_inject_styles__$f,
    __vue_script__$f,
    __vue_scope_id__$f,
    __vue_is_functional_template__$f,
    __vue_module_identifier__$f,
    false,
    undefined,
    undefined,
    undefined
  );//
//
//
//
//
//
//
//


var script$g = {
    name: 'spinner',
    props: [],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$g = script$g;
/* template */
var __vue_render__$g = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-modal" }, [
    _c("div", { staticClass: "hawk-modal__content" }, [
      _vm._v("\n        " + _vm._s(_vm.$t("Loading")) + "...\n    ")
    ])
  ])
};
var __vue_staticRenderFns__$g = [];
__vue_render__$g._withStripped = true;

  /* style */
  const __vue_inject_styles__$g = undefined;
  /* scoped */
  const __vue_scope_id__$g = "data-v-c2ec5186";
  /* module identifier */
  const __vue_module_identifier__$g = undefined;
  /* functional template */
  const __vue_is_functional_template__$g = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$g = normalizeComponent(
    { render: __vue_render__$g, staticRenderFns: __vue_staticRenderFns__$g },
    __vue_inject_styles__$g,
    __vue_script__$g,
    __vue_scope_id__$g,
    __vue_is_functional_template__$g,
    __vue_module_identifier__$g,
    false,
    undefined,
    undefined,
    undefined
  );var script$h = {
    name: 'result-listing',
    props: [],
    components: {
        ResultItem: __vue_component__$d,
        PlaceholderItem: __vue_component__$f,
        Spinner: __vue_component__$g
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'searchOutput',
            'loadingResults'
        ]),
        results: function () {
            return this.searchOutput ? this.searchOutput.Results : null;
        }
    }
};/* script */
const __vue_script__$h = script$h;
/* template */
var __vue_render__$h = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-results__listing" },
    [
      _vm.loadingResults ? [_c("spinner")] : _vm._e(),
      _vm._v(" "),
      _vm.results && _vm.results.length
        ? _vm._l(_vm.results, function(result) {
            return _c("result-item", {
              key: result.DocId,
              attrs: { result: result }
            })
          })
        : _vm._l(12, function(index) {
            return _c("placeholder-item", { key: index })
          })
    ],
    2
  )
};
var __vue_staticRenderFns__$h = [];
__vue_render__$h._withStripped = true;

  /* style */
  const __vue_inject_styles__$h = undefined;
  /* scoped */
  const __vue_scope_id__$h = "data-v-b71336ca";
  /* module identifier */
  const __vue_module_identifier__$h = undefined;
  /* functional template */
  const __vue_is_functional_template__$h = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$h = normalizeComponent(
    { render: __vue_render__$h, staticRenderFns: __vue_staticRenderFns__$h },
    __vue_inject_styles__$h,
    __vue_script__$h,
    __vue_scope_id__$h,
    __vue_is_functional_template__$h,
    __vue_module_identifier__$h,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$i = {
    name: 'results',
    props: [],
    components: {
        SearchResultsLabel: __vue_component__$2,
        Selections: __vue_component__$4,
        ToolRow: __vue_component__$b,
        ResultListing: __vue_component__$h
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'searchOutput',
            'searchError'
        ])
    }
};/* script */
const __vue_script__$i = script$i;
/* template */
var __vue_render__$i = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-results" },
    [
      _vm.searchError
        ? [_c("span", [_vm._v(_vm._s(_vm.$t("response_error_generic")))])]
        : _vm.searchOutput &&
          _vm.searchOutput.Results &&
          _vm.searchOutput.Results.length == 0
        ? [_c("span", [_vm._v(_vm._s(_vm.$t("No Results")))])]
        : [
            _c("search-results-label"),
            _vm._v(" "),
            _c("selections"),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "hawk-results__top-tool-row" },
              [_c("tool-row")],
              1
            ),
            _vm._v(" "),
            _c("result-listing"),
            _vm._v(" "),
            _c(
              "div",
              { staticClass: "hawk-results__bottom-tool-row" },
              [_c("tool-row")],
              1
            )
          ]
    ],
    2
  )
};
var __vue_staticRenderFns__$i = [];
__vue_render__$i._withStripped = true;

  /* style */
  const __vue_inject_styles__$i = undefined;
  /* scoped */
  const __vue_scope_id__$i = "data-v-20cbd694";
  /* module identifier */
  const __vue_module_identifier__$i = undefined;
  /* functional template */
  const __vue_is_functional_template__$i = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$i = normalizeComponent(
    { render: __vue_render__$i, staticRenderFns: __vue_staticRenderFns__$i },
    __vue_inject_styles__$i,
    __vue_script__$i,
    __vue_scope_id__$i,
    __vue_is_functional_template__$i,
    __vue_module_identifier__$i,
    false,
    undefined,
    undefined,
    undefined
  );const HawkSearchResults = Vue$2.extend({
	data: function () {
		return {};
	},
	store,
	i18n,
	components: {
		Results: __vue_component__$i
    },
	computed: {
		...mapState([
			'searchOutput'
		])
	}
});var script$j = {
    name: 'questionmark-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$j = script$j;
/* template */
var __vue_render__$j = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M 10.976562 14.785156 C 10.976562 15.324219 10.539062 15.761719 10 15.761719 C 9.460938 15.761719 9.023438 15.324219 9.023438 14.785156 C 9.023438 14.246094 9.460938 13.808594 10 13.808594 C 10.539062 13.808594 10.976562 14.246094 10.976562 14.785156 Z M 10.976562 14.785156 "
        }
      }),
      _vm._v(" "),
      _c("path", {
        attrs: {
          d:
            "M 10 0 C 4.472656 0 0 4.472656 0 10 C 0 15.527344 4.472656 20 10 20 C 15.527344 20 20 15.527344 20 10 C 20 4.472656 15.527344 0 10 0 Z M 10 18.4375 C 5.335938 18.4375 1.5625 14.664062 1.5625 10 C 1.5625 5.335938 5.335938 1.5625 10 1.5625 C 14.664062 1.5625 18.4375 5.335938 18.4375 10 C 18.4375 14.664062 14.664062 18.4375 10 18.4375 Z M 10 18.4375 "
        }
      }),
      _vm._v(" "),
      _c("path", {
        attrs: {
          d:
            "M 10 5.019531 C 8.277344 5.019531 6.875 6.421875 6.875 8.144531 C 6.875 8.574219 7.226562 8.925781 7.65625 8.925781 C 8.085938 8.925781 8.4375 8.574219 8.4375 8.144531 C 8.4375 7.28125 9.136719 6.582031 10 6.582031 C 10.863281 6.582031 11.5625 7.28125 11.5625 8.144531 C 11.5625 9.007812 10.863281 9.707031 10 9.707031 C 9.570312 9.707031 9.21875 10.058594 9.21875 10.488281 L 9.21875 12.441406 C 9.21875 12.871094 9.570312 13.222656 10 13.222656 C 10.429688 13.222656 10.78125 12.871094 10.78125 12.441406 L 10.78125 11.171875 C 12.128906 10.824219 13.125 9.597656 13.125 8.144531 C 13.125 6.421875 11.722656 5.019531 10 5.019531 Z M 10 5.019531 "
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$j = [];
__vue_render__$j._withStripped = true;

  /* style */
  const __vue_inject_styles__$j = undefined;
  /* scoped */
  const __vue_scope_id__$j = "data-v-9ddf6c22";
  /* module identifier */
  const __vue_module_identifier__$j = undefined;
  /* functional template */
  const __vue_is_functional_template__$j = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$j = normalizeComponent(
    { render: __vue_render__$j, staticRenderFns: __vue_staticRenderFns__$j },
    __vue_inject_styles__$j,
    __vue_script__$j,
    __vue_scope_id__$j,
    __vue_is_functional_template__$j,
    __vue_module_identifier__$j,
    false,
    undefined,
    undefined,
    undefined
  );var script$k = {
    name: 'plus-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$k = script$k;
/* template */
var __vue_render__$k = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M31 12h-11v-11c0-0.552-0.448-1-1-1h-6c-0.552 0-1 0.448-1 1v11h-11c-0.552 0-1 0.448-1 1v6c0 0.552 0.448 1 1 1h11v11c0 0.552 0.448 1 1 1h6c0.552 0 1-0.448 1-1v-11h11c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$k = [];
__vue_render__$k._withStripped = true;

  /* style */
  const __vue_inject_styles__$k = undefined;
  /* scoped */
  const __vue_scope_id__$k = "data-v-0a6471ac";
  /* module identifier */
  const __vue_module_identifier__$k = undefined;
  /* functional template */
  const __vue_is_functional_template__$k = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$k = normalizeComponent(
    { render: __vue_render__$k, staticRenderFns: __vue_staticRenderFns__$k },
    __vue_inject_styles__$k,
    __vue_script__$k,
    __vue_scope_id__$k,
    __vue_is_functional_template__$k,
    __vue_module_identifier__$k,
    false,
    undefined,
    undefined,
    undefined
  );var script$l = {
    name: 'minus-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$l = script$l;
/* template */
var __vue_render__$l = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M0 13v6c0 0.552 0.448 1 1 1h30c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1h-30c-0.552 0-1 0.448-1 1z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$l = [];
__vue_render__$l._withStripped = true;

  /* style */
  const __vue_inject_styles__$l = undefined;
  /* scoped */
  const __vue_scope_id__$l = "data-v-4adbe69f";
  /* module identifier */
  const __vue_module_identifier__$l = undefined;
  /* functional template */
  const __vue_is_functional_template__$l = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$l = normalizeComponent(
    { render: __vue_render__$l, staticRenderFns: __vue_staticRenderFns__$l },
    __vue_inject_styles__$l,
    __vue_script__$l,
    __vue_scope_id__$l,
    __vue_is_functional_template__$l,
    __vue_module_identifier__$l,
    false,
    undefined,
    undefined,
    undefined
  );var script$m = {
    name: 'checkmark-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$m = script$m;
/* template */
var __vue_render__$m = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [_c("path", { attrs: { d: "M27 4l-15 15-7-7-5 5 12 12 20-20z" } })]
  )
};
var __vue_staticRenderFns__$m = [];
__vue_render__$m._withStripped = true;

  /* style */
  const __vue_inject_styles__$m = undefined;
  /* scoped */
  const __vue_scope_id__$m = "data-v-1fe3da33";
  /* module identifier */
  const __vue_module_identifier__$m = undefined;
  /* functional template */
  const __vue_is_functional_template__$m = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$m = normalizeComponent(
    { render: __vue_render__$m, staticRenderFns: __vue_staticRenderFns__$m },
    __vue_inject_styles__$m,
    __vue_script__$m,
    __vue_scope_id__$m,
    __vue_is_functional_template__$m,
    __vue_module_identifier__$m,
    false,
    undefined,
    undefined,
    undefined
  );var script$n = {
    name: 'plus-circle-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$n = script$n;
/* template */
var __vue_render__$n = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 20 20", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          d:
            "M11 9v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM10 20c-5.523 0-10-4.477-10-10s4.477-10 10-10v0c5.523 0 10 4.477 10 10s-4.477 10-10 10v0z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$n = [];
__vue_render__$n._withStripped = true;

  /* style */
  const __vue_inject_styles__$n = undefined;
  /* scoped */
  const __vue_scope_id__$n = "data-v-69522f14";
  /* module identifier */
  const __vue_module_identifier__$n = undefined;
  /* functional template */
  const __vue_is_functional_template__$n = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$n = normalizeComponent(
    { render: __vue_render__$n, staticRenderFns: __vue_staticRenderFns__$n },
    __vue_inject_styles__$n,
    __vue_script__$n,
    __vue_scope_id__$n,
    __vue_is_functional_template__$n,
    __vue_module_identifier__$n,
    false,
    undefined,
    undefined,
    undefined
  );var script$o = {
    name: 'dash-circle-svg',
    props: ['iconClass'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$o = script$o;
/* template */
var __vue_render__$o = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "svg",
    {
      class: "icon " + _vm.iconClass,
      attrs: { viewBox: "0 0 32 32", focusable: "false", "aria-hidden": "true" }
    },
    [
      _c("path", {
        attrs: {
          fill: "#5c5c5c",
          d:
            "M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16c-8.837 0-16-7.163-16-16v0c0-8.837 7.163-16 16-16v0z"
        }
      }),
      _vm._v(" "),
      _c("path", {
        attrs: {
          fill: "#fff",
          d:
            "M21.51 17.594h-11.733c-0.884 0-1.6-0.716-1.6-1.6s0.716-1.6 1.6-1.6h11.733c0.884 0 1.6 0.716 1.6 1.6s-0.716 1.6-1.6 1.6z"
        }
      })
    ]
  )
};
var __vue_staticRenderFns__$o = [];
__vue_render__$o._withStripped = true;

  /* style */
  const __vue_inject_styles__$o = undefined;
  /* scoped */
  const __vue_scope_id__$o = "data-v-a0212550";
  /* module identifier */
  const __vue_module_identifier__$o = undefined;
  /* functional template */
  const __vue_is_functional_template__$o = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$o = normalizeComponent(
    { render: __vue_render__$o, staticRenderFns: __vue_staticRenderFns__$o },
    __vue_inject_styles__$o,
    __vue_script__$o,
    __vue_scope_id__$o,
    __vue_is_functional_template__$o,
    __vue_module_identifier__$o,
    false,
    undefined,
    undefined,
    undefined
  );var script$p = {
    name: 'checkbox',
    props: ['facetData'],
    components: {
        CheckmarkSvg: __vue_component__$m,
        PlusCircleSvg: __vue_component__$n,
        DashCircleSvg: __vue_component__$o
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {
        selectFacet: function (value) {
            if (value.Negated) {
                value.Selected = true;
                value.Negated = false;
            }
            else {
                value.Selected = !value.Selected;
            }

            this.applyFacets();
        },
        negateFacet: function (value) {
            value.Negated = !value.Negated;
            value.Selected = value.Negated;
            this.applyFacets();
        },
        applyFacets: function () {
            this.$root.$store.dispatch('applyFacets', this.facetData);
        }
    },
    computed: {
        items: function () {
            return this.facetData.Values;
        }
    }
};/* script */
const __vue_script__$p = script$p;
/* template */
var __vue_render__$p = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-facet-rail__facet-values" },
    [
      _c("div", { staticClass: "hawk-facet-rail__facet-values-checkbox" }, [
        _c(
          "ul",
          { staticClass: "hawk-facet-rail__facet-list" },
          _vm._l(_vm.items, function(value) {
            return _c(
              "li",
              {
                key: value.Value,
                staticClass: "hawk-facet-rail__facet-list-item"
              },
              [
                _c(
                  "button",
                  {
                    staticClass: "hawk-facet-rail__facet-btn",
                    on: {
                      click: function($event) {
                        return _vm.selectFacet(value)
                      }
                    }
                  },
                  [
                    _c(
                      "span",
                      {
                        class: value.Selected
                          ? "hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked"
                          : "hawk-facet-rail__facet-checkbox"
                      },
                      [
                        value.Selected
                          ? _c("checkmark-svg", {
                              staticClass:
                                "hawk-facet-rail__facet-checkbox-icon"
                            })
                          : _vm._e()
                      ],
                      1
                    ),
                    _vm._v(" "),
                    _vm.rangeValueAssetUrl
                      ? _c("span", { staticClass: "hawk-selectionInner" }, [
                          _c("span", {
                            staticClass: "hawk-range-asset",
                            attrs: { title: value.Label }
                          }),
                          _vm._v(" "),
                          _c("img", {
                            attrs: {
                              src: _vm.rangeValueAssetUrl,
                              alt: value.Label
                            }
                          })
                        ])
                      : _vm._e(),
                    _vm._v(" "),
                    _c(
                      "span",
                      {
                        class: value.Negated
                          ? "hawk-facet-rail__facet-name line-through"
                          : "hawk-facet-rail__facet-name"
                      },
                      [
                        _vm._v(
                          "\n                        " +
                            _vm._s(value.Label) +
                            " (" +
                            _vm._s(value.Count) +
                            ")\n                    "
                        )
                      ]
                    )
                  ]
                ),
                _vm._v(" "),
                _c(
                  "button",
                  {
                    staticClass: "hawk-facet-rail__facet-btn-exclude",
                    on: {
                      click: function($event) {
                        return _vm.negateFacet(value)
                      }
                    }
                  },
                  [
                    value.Negated
                      ? [
                          _c("plus-circle-svg", {
                            staticClass: "hawk-facet-rail__facet-btn-include"
                          })
                        ]
                      : [_c("dash-circle-svg")]
                  ],
                  2
                )
              ]
            )
          }),
          0
        )
      ]),
      _vm._v(" "),
      _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__$p = [];
__vue_render__$p._withStripped = true;

  /* style */
  const __vue_inject_styles__$p = undefined;
  /* scoped */
  const __vue_scope_id__$p = "data-v-02a9df84";
  /* module identifier */
  const __vue_module_identifier__$p = undefined;
  /* functional template */
  const __vue_is_functional_template__$p = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$p = normalizeComponent(
    { render: __vue_render__$p, staticRenderFns: __vue_staticRenderFns__$p },
    __vue_inject_styles__$p,
    __vue_script__$p,
    __vue_scope_id__$p,
    __vue_is_functional_template__$p,
    __vue_module_identifier__$p,
    false,
    undefined,
    undefined,
    undefined
  );var script$q = {
    name: 'nested-item',
    props: ['facetData', 'itemData'],
    components: {
        CheckmarkSvg: __vue_component__$m,
        PlusCircleSvg: __vue_component__$n,
        DashCircleSvg: __vue_component__$o
    },
    mounted() {

    },
    data() {
        return {
            isExpanded: false
        }
    },
    methods: {
        toggleExpanded: function () {
            this.isExpanded = !this.isExpanded;
        },
        selectFacet: function (value) {
            if (value.Negated) {
                value.Selected = true;
                value.Negated = false;
            }
            else {
                value.Selected = !value.Selected;
            }

            this.applyFacets();
        },
        negateFacet: function (value) {
            value.Negated = !value.Negated;
            value.Selected = value.Negated;
            this.applyFacets();
        },
        applyFacets: function () {
            this.$root.$store.dispatch('applyFacets', this.facetData);
        }
    },
    computed: {
    }
};/* script */
const __vue_script__$q = script$q;
/* template */
var __vue_render__$q = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "li",
    { staticClass: "hawk-facet-rail__facet-list-item hawkFacet-group" },
    [
      _c("div", { staticClass: "hawkFacet-group__inline" }, [
        _c(
          "button",
          {
            staticClass: "hawk-facet-rail__facet-btn",
            on: {
              click: function($event) {
                return _vm.selectFacet(_vm.itemData)
              }
            }
          },
          [
            _c(
              "span",
              {
                class: _vm.itemData.Selected
                  ? "hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked"
                  : "hawk-facet-rail__facet-checkbox"
              },
              [
                _vm.itemData.Selected
                  ? [
                      _c("checkmark-svg", {
                        staticClass: "hawk-facet-rail__facet-checkbox-icon"
                      })
                    ]
                  : _vm._e()
              ],
              2
            ),
            _vm._v(" "),
            _c(
              "span",
              {
                class: _vm.itemData.Negated
                  ? "hawk-facet-rail__facet-name line-through"
                  : "hawk-facet-rail__facet-name"
              },
              [
                _vm._v(
                  "\n                " +
                    _vm._s(_vm.itemData.Label) +
                    " (" +
                    _vm._s(_vm.itemData.Count) +
                    ")\n            "
                )
              ]
            )
          ]
        ),
        _vm._v(" "),
        _c(
          "button",
          {
            staticClass: "hawk-facet-rail__facet-btn-exclude",
            on: {
              click: function($event) {
                return _vm.negateFacet(_vm.itemData)
              }
            }
          },
          [
            _vm.itemData.Negated
              ? [
                  _c("plus-circle-svg", {
                    staticClass: "hawk-facet-rail__facet-btn-include"
                  })
                ]
              : [_c("dash-circle-svg")]
          ],
          2
        ),
        _vm._v(" "),
        _vm.itemData.Children && _vm.itemData.Children.length
          ? _c("button", {
              class: _vm.isExpanded
                ? "hawk-collapseState"
                : "hawk-collapseState collapsed",
              attrs: { "aria-expanded": "false" },
              on: { click: _vm.toggleExpanded }
            })
          : _vm._e()
      ]),
      _vm._v(" "),
      _vm.isExpanded && _vm.itemData.Children
        ? _c("div", { staticClass: "hawk-facet-rail__w-100" }, [
            _c(
              "ul",
              { staticClass: "hawkFacet-group-inside" },
              _vm._l(_vm.itemData.Children, function(item) {
                return _c("nested-item", {
                  key: item.Value,
                  attrs: { "item-data": item, "facet-data": _vm.facetData }
                })
              }),
              1
            )
          ])
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$q = [];
__vue_render__$q._withStripped = true;

  /* style */
  const __vue_inject_styles__$q = undefined;
  /* scoped */
  const __vue_scope_id__$q = "data-v-fb61375c";
  /* module identifier */
  const __vue_module_identifier__$q = undefined;
  /* functional template */
  const __vue_is_functional_template__$q = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$q = normalizeComponent(
    { render: __vue_render__$q, staticRenderFns: __vue_staticRenderFns__$q },
    __vue_inject_styles__$q,
    __vue_script__$q,
    __vue_scope_id__$q,
    __vue_is_functional_template__$q,
    __vue_module_identifier__$q,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$r = {
    name: 'nested-checkbox',
    props: ['facetData'],
    components: {
        NestedItem: __vue_component__$q
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        items: function () {
            return this.facetData.Values;
        }
    }
};/* script */
const __vue_script__$r = script$r;
/* template */
var __vue_render__$r = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-facet-rail__facet-values" },
    [
      _c("div", { staticClass: "hawk-facet-rail__facet-values-checkbox" }, [
        _c(
          "ul",
          { staticClass: "hawk-facet-rail__facet-list" },
          _vm._l(_vm.items, function(item) {
            return _c("nested-item", {
              key: item.Value,
              attrs: { "item-data": item, "facet-data": _vm.facetData }
            })
          }),
          1
        )
      ]),
      _vm._v(" "),
      _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__$r = [];
__vue_render__$r._withStripped = true;

  /* style */
  const __vue_inject_styles__$r = undefined;
  /* scoped */
  const __vue_scope_id__$r = "data-v-05a63a24";
  /* module identifier */
  const __vue_module_identifier__$r = undefined;
  /* functional template */
  const __vue_is_functional_template__$r = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$r = normalizeComponent(
    { render: __vue_render__$r, staticRenderFns: __vue_staticRenderFns__$r },
    __vue_inject_styles__$r,
    __vue_script__$r,
    __vue_scope_id__$r,
    __vue_is_functional_template__$r,
    __vue_module_identifier__$r,
    false,
    undefined,
    undefined,
    undefined
  );var script$s = {
    name: 'search',
    props: [],
    mounted() {

    },
    data() {
        return {
            value: null
        }
    },
    methods: {
        search: function (value) {
            if (this.value) {
                this.$root.$store.dispatch('applySearchWithin', this.value);
            }
        },
        clearFacet: function () {
            if (this.value) {
                this.$root.$store.dispatch('clearFacet', 'SearchWithin');
                this.value = null;
            }
        }
    },
    computed: {

    }
};/* script */
const __vue_script__$s = script$s;
/* template */
var __vue_render__$s = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", [
    _c("div", { staticClass: "hawk-facet-rail__facet-values" }, [
      _c("div", { staticClass: "hawk-facet-rail__facet-values__search" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.value,
              expression: "value"
            }
          ],
          domProps: { value: _vm.value },
          on: {
            change: _vm.search,
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.value = $event.target.value;
            }
          }
        })
      ])
    ]),
    _vm._v(" "),
    _vm.value
      ? _c(
          "div",
          { staticClass: "hawk-facet-rail__facet-values__search-clear" },
          [
            _c(
              "button",
              { staticClass: "link-button", on: { click: _vm.clearFacet } },
              [
                _vm._v(
                  "\n            " + _vm._s(_vm.$t("Clear")) + "\n        "
                )
              ]
            )
          ]
        )
      : _vm._e()
  ])
};
var __vue_staticRenderFns__$s = [];
__vue_render__$s._withStripped = true;

  /* style */
  const __vue_inject_styles__$s = undefined;
  /* scoped */
  const __vue_scope_id__$s = "data-v-6eb7ce49";
  /* module identifier */
  const __vue_module_identifier__$s = undefined;
  /* functional template */
  const __vue_is_functional_template__$s = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$s = normalizeComponent(
    { render: __vue_render__$s, staticRenderFns: __vue_staticRenderFns__$s },
    __vue_inject_styles__$s,
    __vue_script__$s,
    __vue_scope_id__$s,
    __vue_is_functional_template__$s,
    __vue_module_identifier__$s,
    false,
    undefined,
    undefined,
    undefined
  );var script$t = {
    name: 'open-range',
    props: ['facetData'],
    mounted() {

    },
    data() {
        return {
            minValue: undefined,
            maxValue: undefined
        }
    },
    methods: {
        onChange: function () {
            if (this.minValue || this.maxValue) {
                this.facetData.Value = (this.minValue || '') + ',' + (this.maxValue || '');
                this.$root.$store.dispatch('applyFacets', this.facetData);
            }
            else {
                var field = this.facetData.ParamName ? this.facetData.ParamName : this.facetData.Field;
                this.$root.$store.dispatch('clearFacet', field);
            }
        }
    },
    computed: {

    }
};/* script */
const __vue_script__$t = script$t;
/* template */
var __vue_render__$t = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail__facet-values" }, [
    _c("div", { staticClass: "hawk-facet-rail__facet-values-link" }, [
      _c("div", { staticClass: "hawk-open-range" }, [
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.minValue,
              expression: "minValue"
            }
          ],
          staticClass: "hawk-text-input value-start",
          attrs: { type: "text" },
          domProps: { value: _vm.minValue },
          on: {
            change: _vm.onChange,
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.minValue = $event.target.value;
            }
          }
        }),
        _vm._v(" "),
        _c("input", {
          directives: [
            {
              name: "model",
              rawName: "v-model",
              value: _vm.maxValue,
              expression: "maxValue"
            }
          ],
          staticClass: "hawk-text-input value-end",
          attrs: { type: "text" },
          domProps: { value: _vm.maxValue },
          on: {
            change: _vm.onChange,
            input: function($event) {
              if ($event.target.composing) {
                return
              }
              _vm.maxValue = $event.target.value;
            }
          }
        })
      ])
    ])
  ])
};
var __vue_staticRenderFns__$t = [];
__vue_render__$t._withStripped = true;

  /* style */
  const __vue_inject_styles__$t = undefined;
  /* scoped */
  const __vue_scope_id__$t = "data-v-eecd672a";
  /* module identifier */
  const __vue_module_identifier__$t = undefined;
  /* functional template */
  const __vue_is_functional_template__$t = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$t = normalizeComponent(
    { render: __vue_render__$t, staticRenderFns: __vue_staticRenderFns__$t },
    __vue_inject_styles__$t,
    __vue_script__$t,
    __vue_scope_id__$t,
    __vue_is_functional_template__$t,
    __vue_module_identifier__$t,
    false,
    undefined,
    undefined,
    undefined
  );//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


var script$u = {
    name: 'swatch-item',
    props: ['facetData', 'item'],
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {
        selectFacet: function () {
            if (this.item.Negated) {
                this.item.Selected = true;
                this.item.Negated = false;
            }
            else {
                this.item.Selected = !this.item.Selected;
            }

            this.applyFacets();
        },
        negateFacet: function () {
            this.item.Negated = !this.item.Negated;
            this.item.Selected = this.item.Negated;
            this.applyFacets();
        },
        applyFacets: function () {
            this.$root.$store.dispatch('applyFacets', this.facetData);
        }
    },
    computed: {
        listItemClass: function () {
            return 'hawk-facet-rail__facet-list-item' + (this.item.Selected ? ' hawkFacet-active' : '') + (this.item.Negated ? ' hawkFacet-negative' : '');
        },
        colorStyle: function () {
            return 'background: ' + this.item.Color;
        },
        url: function () {
            return HawkSearchVue.config.dashboardUrl + (!this.item.AssetUrl ? this.item.AssetName : this.item.AssetUrl);
        }
    }
};/* script */
const __vue_script__$u = script$u;
/* template */
var __vue_render__$u = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("li", { class: _vm.listItemClass }, [
    _c(
      "button",
      {
        staticClass: "hawk-facet-rail__facet-btn hawk-styleSwatch",
        on: { click: _vm.selectFacet }
      },
      [
        _c(
          "span",
          { staticClass: "hawk-selectionInner" },
          [
            _vm.item.isColor
              ? [
                  _c("span", {
                    staticClass: "hawk-swatchColor",
                    style: _vm.colorStyle,
                    attrs: { title: _vm.item.Value }
                  })
                ]
              : [_c("img", { attrs: { src: _vm.url, alt: _vm.item.Value } })]
          ],
          2
        )
      ]
    ),
    _vm._v(" "),
    _c("button", { staticClass: "hawk-negativeIcon" }, [
      _c("i", {
        staticClass: "hawkIcon-blocked",
        on: { click: _vm.negateFacet }
      })
    ])
  ])
};
var __vue_staticRenderFns__$u = [];
__vue_render__$u._withStripped = true;

  /* style */
  const __vue_inject_styles__$u = undefined;
  /* scoped */
  const __vue_scope_id__$u = "data-v-75824be5";
  /* module identifier */
  const __vue_module_identifier__$u = undefined;
  /* functional template */
  const __vue_is_functional_template__$u = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$u = normalizeComponent(
    { render: __vue_render__$u, staticRenderFns: __vue_staticRenderFns__$u },
    __vue_inject_styles__$u,
    __vue_script__$u,
    __vue_scope_id__$u,
    __vue_is_functional_template__$u,
    __vue_module_identifier__$u,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$v = {
    name: 'swatch',
    props: ['facetData'],
    components: {
        SwatchItem: __vue_component__$u
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        items: function () {
            return this.facetData.Values;
        }
    }
};/* script */
const __vue_script__$v = script$v;
/* template */
var __vue_render__$v = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-facet-rail__facet-values" },
    [
      _c("div", { staticClass: "hawk-facet-rail__facet-values-swatch" }, [
        _c(
          "ul",
          { staticClass: "hawk-facet-rail__facet-list" },
          _vm._l(_vm.items, function(item) {
            return _c("swatch-item", {
              key: item.Value,
              attrs: { item: item, "facet-data": _vm.facetData }
            })
          }),
          1
        )
      ]),
      _vm._v(" "),
      _vm._t("default")
    ],
    2
  )
};
var __vue_staticRenderFns__$v = [];
__vue_render__$v._withStripped = true;

  /* style */
  const __vue_inject_styles__$v = undefined;
  /* scoped */
  const __vue_scope_id__$v = "data-v-48972e8a";
  /* module identifier */
  const __vue_module_identifier__$v = undefined;
  /* functional template */
  const __vue_is_functional_template__$v = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$v = normalizeComponent(
    { render: __vue_render__$v, staticRenderFns: __vue_staticRenderFns__$v },
    __vue_inject_styles__$v,
    __vue_script__$v,
    __vue_scope_id__$v,
    __vue_is_functional_template__$v,
    __vue_module_identifier__$v,
    false,
    undefined,
    undefined,
    undefined
  );//

var script$w = {
    name: 'facet',
    props: ['facetData'],
    components: {
        QuestionmarkSvg: __vue_component__$j,
        PlusSvg: __vue_component__$k,
        MinusSvg: __vue_component__$l,
        Checkbox: __vue_component__$p,
        NestedCheckbox: __vue_component__$r,
        Search: __vue_component__$s,
        OpenRange: __vue_component__$t,
        Swatch: __vue_component__$v
    },
    created: function () {
        this.setFilter();
    },
    data() {
        return {
            isCollapsed: false,
            filter: null,
            filteredData: null,
            isTruncated: true
        }
    },
    methods: {
        toggleCollapse: function () {
            this.isCollapsed = !this.isCollapsed;
        },
        setFilter: function () {
            if (this.filteredData && this.filter) {
                this.filteredData.Values = this.facetData.Values.filter(item => this.valueIncludesString(item.Label, this.filter) || this.valueIncludesString(item.Value, this.filter));
            }
            else {
                let facetData = Object.assign({}, this.facetData);

                if (this.isTruncated && this.shouldTruncate) {
                    facetData.Values = facetData.Values.slice(0, facetData.TruncateThreshold);
                }

                this.filteredData = facetData;
            }
        },
        valueIncludesString: function (value, str) {
            return value.toLowerCase().includes(str.toLowerCase());
        },
        toggleTruncate: function () {
            this.isTruncated = !this.isTruncated;
            this.setFilter();
        }
    },
    watch: {
        facetData: {
            handler(newValue, oldValue) {
                this.setFilter();
            },
            deep: true
        }
    },
    computed: {
        shouldSearch: function () {
            return this.facetData.IsSearch && this.facetData.Values.length > this.facetData.SearchThreshold;
        },
        shouldTruncate: function () {
            return this.facetData.DisplayType === 'truncating' && this.facetData.Values.length > this.facetData.TruncateThreshold;
        },
        componentName: function () {
            switch (this.facetData.FacetType) {
                case "checkbox":
                    return "checkbox";

                //case "link":
                //    return "link";
                //    break;

                case "nestedcheckbox":
                    return "nested-checkbox";

                case "search":
                    return "search";

                //case "slider":
                //    return "slider";
                //    break;

                case "swatch":
                    return "swatch";

                case "openRange":
                    return "open-range";

                default:
                    return false;
            }
        },
        remainingFacets: function () {
            return this.facetData.Values.length - this.filteredData.Values.length;
        },
        truncateVisible: function () {
            return this.shouldTruncate && !this.filter;
        }
    }
};/* script */
const __vue_script__$w = script$w;
/* template */
var __vue_render__$w = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    [
      _vm.componentName
        ? [
            _c("div", { staticClass: "hawk-facet-rail__facet" }, [
              _c(
                "div",
                {
                  staticClass: "hawk-facet-rail__facet-heading",
                  on: { click: _vm.toggleCollapse }
                },
                [
                  _c("h4", [_vm._v(_vm._s(_vm.facetData.Name))]),
                  _vm._v(" "),
                  _vm.facetData.Tooltip
                    ? _c(
                        "div",
                        { staticClass: "custom-tooltip" },
                        [
                          _c("questionmark-svg", {
                            staticClass: "hawk-questionmark"
                          }),
                          _vm._v(" "),
                          _c("div", { staticClass: "right" }, [
                            _c("div", {
                              domProps: {
                                innerHTML: _vm._s(_vm.facetData.Tooltip)
                              }
                            }),
                            _vm._v(" "),
                            _c("i")
                          ])
                        ],
                        1
                      )
                    : _vm._e(),
                  _vm._v(" "),
                  _vm.isCollapsed ? [_c("plus-svg")] : [_c("minus-svg")]
                ],
                2
              ),
              _vm._v(" "),
              !_vm.isCollapsed
                ? _c(
                    "div",
                    { staticClass: "hawk-facet-rail__facet-body" },
                    [
                      _vm.shouldSearch
                        ? _c(
                            "div",
                            {
                              staticClass:
                                "hawk-facet-rail__facet__quick-lookup"
                            },
                            [
                              _c("input", {
                                directives: [
                                  {
                                    name: "model",
                                    rawName: "v-model",
                                    value: _vm.filter,
                                    expression: "filter"
                                  }
                                ],
                                attrs: {
                                  type: "text",
                                  placeholder: _vm.$t("Quick Lookup")
                                },
                                domProps: { value: _vm.filter },
                                on: {
                                  input: [
                                    function($event) {
                                      if ($event.target.composing) {
                                        return
                                      }
                                      _vm.filter = $event.target.value;
                                    },
                                    _vm.setFilter
                                  ]
                                }
                              })
                            ]
                          )
                        : _vm._e(),
                      _vm._v(" "),
                      _vm.filteredData
                        ? [
                            _c(
                              _vm.componentName,
                              {
                                tag: "component",
                                attrs: { "facet-data": _vm.filteredData }
                              },
                              [
                                _vm.truncateVisible
                                  ? _c(
                                      "button",
                                      {
                                        staticClass:
                                          "hawk-facet-rail__show-more-btn",
                                        on: { click: _vm.toggleTruncate }
                                      },
                                      [
                                        _vm.isTruncated
                                          ? [
                                              _vm._v(
                                                "\n                                (+) Show " +
                                                  _vm._s(_vm.remainingFacets) +
                                                  " More\n                            "
                                              )
                                            ]
                                          : [
                                              _vm._v(
                                                "\n                                (-) Show Less\n                            "
                                              )
                                            ]
                                      ],
                                      2
                                    )
                                  : _vm._e()
                              ]
                            )
                          ]
                        : _vm._e()
                    ],
                    2
                  )
                : _vm._e()
            ])
          ]
        : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$w = [];
__vue_render__$w._withStripped = true;

  /* style */
  const __vue_inject_styles__$w = undefined;
  /* scoped */
  const __vue_scope_id__$w = "data-v-76c2f4c2";
  /* module identifier */
  const __vue_module_identifier__$w = undefined;
  /* functional template */
  const __vue_is_functional_template__$w = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$w = normalizeComponent(
    { render: __vue_render__$w, staticRenderFns: __vue_staticRenderFns__$w },
    __vue_inject_styles__$w,
    __vue_script__$w,
    __vue_scope_id__$w,
    __vue_is_functional_template__$w,
    __vue_module_identifier__$w,
    false,
    undefined,
    undefined,
    undefined
  );//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//


  var script$x = {
    name: 'placeholder-facet',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {
        getWidth: function () {
            return Math.round(Math.random() * (250 - 125) + 125);
        },
        getCount: function () {
            return Math.round(Math.random() * (8 - 1) + 1);
        }
    },
    computed: {

    }
};/* script */
const __vue_script__$x = script$x;
/* template */
var __vue_render__$x = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail__facet" }, [
    _c("div", { staticClass: "hawk-facet-rail__facet-heading" }, [
      _c("div", {
        staticClass: "hawk-facet-rail__facet-heading-placeholder",
        style: "width: " + _vm.getWidth() + "px"
      })
    ]),
    _vm._v(" "),
    _c("div", { staticClass: "hawk-facet-rail__facet-body" }, [
      _c(
        "div",
        {
          staticClass:
            "hawk-facet-rail__facet-values hawk-facet-rail__facet-values-placeholder"
        },
        [
          _c("div", { staticClass: "hawk-facet-rail__facet-values-checkbox" }, [
            _c(
              "ul",
              { staticClass: "hawk-facet-rail__facet-list" },
              _vm._l(_vm.getCount(), function(index) {
                return _c(
                  "li",
                  {
                    key: index,
                    staticClass: "hawk-facet-rail__facet-list-item"
                  },
                  [
                    _c("span", {
                      staticClass:
                        "hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox-placeholder"
                    }),
                    _vm._v(" "),
                    _c(
                      "button",
                      { staticClass: "hawk-facet-rail__facet-btn" },
                      [
                        _c(
                          "span",
                          { staticClass: "hawk-facet-rail__facet-name" },
                          [
                            _c("div", {
                              staticClass:
                                "hawk-facet-rail__facet-name-placeholder",
                              style: "width: " + _vm.getWidth() + "px"
                            })
                          ]
                        )
                      ]
                    )
                  ]
                )
              }),
              0
            )
          ])
        ]
      )
    ])
  ])
};
var __vue_staticRenderFns__$x = [];
__vue_render__$x._withStripped = true;

  /* style */
  const __vue_inject_styles__$x = undefined;
  /* scoped */
  const __vue_scope_id__$x = "data-v-3b6dfca2";
  /* module identifier */
  const __vue_module_identifier__$x = undefined;
  /* functional template */
  const __vue_is_functional_template__$x = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$x = normalizeComponent(
    { render: __vue_render__$x, staticRenderFns: __vue_staticRenderFns__$x },
    __vue_inject_styles__$x,
    __vue_script__$x,
    __vue_scope_id__$x,
    __vue_is_functional_template__$x,
    __vue_module_identifier__$x,
    false,
    undefined,
    undefined,
    undefined
  );var script$y = {
    name: 'facet-list',
    props: [],
    components: {
        Facet: __vue_component__$w,
        PlaceholderFacet: __vue_component__$x
    },
    mounted() {

    },
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState([
            'extendedSearchParams'
        ]),
        facets: function () {
            return this.extendedSearchParams ? this.extendedSearchParams.Facets : null;
        }
    }
};/* script */
const __vue_script__$y = script$y;
/* template */
var __vue_render__$y = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail" }, [
    _c("div", { staticClass: "hawk-facet-rail__heading" }, [
      _vm._v(_vm._s(_vm.$t("Narrow Results")))
    ]),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "hawk-facet-rail__facet-list" },
      [
        _vm.facets && _vm.facets.length
          ? _vm._l(_vm.facets, function(facetData) {
              return _c("facet", {
                key: facetData.FacetId,
                attrs: { "facet-data": facetData }
              })
            })
          : _vm._l(4, function(index) {
              return _c("placeholder-facet", { key: index })
            })
      ],
      2
    )
  ])
};
var __vue_staticRenderFns__$y = [];
__vue_render__$y._withStripped = true;

  /* style */
  const __vue_inject_styles__$y = undefined;
  /* scoped */
  const __vue_scope_id__$y = "data-v-3f7868d9";
  /* module identifier */
  const __vue_module_identifier__$y = undefined;
  /* functional template */
  const __vue_is_functional_template__$y = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$y = normalizeComponent(
    { render: __vue_render__$y, staticRenderFns: __vue_staticRenderFns__$y },
    __vue_inject_styles__$y,
    __vue_script__$y,
    __vue_scope_id__$y,
    __vue_is_functional_template__$y,
    __vue_module_identifier__$y,
    false,
    undefined,
    undefined,
    undefined
  );const HawkSearchFacets = Vue$2.extend({
    store,
    i18n,
    components: {
        FacetList: __vue_component__$y
    }
});var script$z = {
    name: 'link',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$z = script$z;
/* template */
var __vue_render__$z = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm._m(0)
};
var __vue_staticRenderFns__$z = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("section", { staticClass: "link" }, [
      _c("h1", [_vm._v("link Component")])
    ])
  }
];
__vue_render__$z._withStripped = true;

  /* style */
  const __vue_inject_styles__$z = undefined;
  /* scoped */
  const __vue_scope_id__$z = "data-v-75818897";
  /* module identifier */
  const __vue_module_identifier__$z = undefined;
  /* functional template */
  const __vue_is_functional_template__$z = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$z = normalizeComponent(
    { render: __vue_render__$z, staticRenderFns: __vue_staticRenderFns__$z },
    __vue_inject_styles__$z,
    __vue_script__$z,
    __vue_scope_id__$z,
    __vue_is_functional_template__$z,
    __vue_module_identifier__$z,
    false,
    undefined,
    undefined,
    undefined
  );var script$A = {
    name: 'slider',
    props: [],
    mounted () {

    },
    data () {
      return {

      }
    },
    methods: {

    },
    computed: {

    }
};/* script */
const __vue_script__$A = script$A;
/* template */
var __vue_render__$A = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm._m(0)
};
var __vue_staticRenderFns__$A = [
  function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("section", { staticClass: "slider" }, [
      _c("h1", [_vm._v("slider Component")])
    ])
  }
];
__vue_render__$A._withStripped = true;

  /* style */
  const __vue_inject_styles__$A = undefined;
  /* scoped */
  const __vue_scope_id__$A = "data-v-4385633d";
  /* module identifier */
  const __vue_module_identifier__$A = undefined;
  /* functional template */
  const __vue_is_functional_template__$A = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$A = normalizeComponent(
    { render: __vue_render__$A, staticRenderFns: __vue_staticRenderFns__$A },
    __vue_inject_styles__$A,
    __vue_script__$A,
    __vue_scope_id__$A,
    __vue_is_functional_template__$A,
    __vue_module_identifier__$A,
    false,
    undefined,
    undefined,
    undefined
  );window.Vue = Vue$2;

Vue$2.config.devtools = true;
Vue$2.use(VueResource);
window.HawkSearchVue = HawkSearchVue$1;export default HawkSearchVue$1;export{__vue_component__$p as Checkbox,__vue_component__$m as CheckmarkSvg,__vue_component__$o as DashCircleSvg,__vue_component__$w as Facet,__vue_component__$y as FacetList,HawkSearchFacets,HawkSearchField,HawkSearchResults,store as HawkSearchStore,__vue_component__$9 as ItemsPerPage,__vue_component__$6 as LeftChevronSvg,__vue_component__$z as Link,__vue_component__$l as MinusSvg,__vue_component__$r as NestedCheckbox,__vue_component__$q as NestedItem,__vue_component__$t as OpenRange,__vue_component__$8 as Pager,__vue_component__$a as Pagination,__vue_component__$n as PlusCircleSvg,__vue_component__$k as PlusSvg,__vue_component__$j as QuestionmarkSvg,__vue_component__$c as ResultImage,__vue_component__$d as ResultItem,__vue_component__$h as ResultListing,__vue_component__$i as Results,__vue_component__$7 as RightChevronSvg,__vue_component__$s as Search,__vue_component__$1 as SearchBox,__vue_component__$2 as SearchResultsLabel,__vue_component__$4 as Selections,__vue_component__$A as Slider,__vue_component__$5 as Sorting,__vue_component__$v as Swatch,__vue_component__$u as SwatchItem,__vue_component__$b as ToolRow,i18n as tConfig};