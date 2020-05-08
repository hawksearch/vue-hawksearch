import Vue$1 from 'vue';
import VueResource from 'vue-resource';
import Vuex, { mapState } from 'vuex';

Vue$1.use(Vuex);

var store = new Vuex.Store({
    state: {
        config: {},
        searchOutput: null,
        pendingSearch: {
            Keyword: "",
            FacetSelections: {}
        },
        extendedSearchParams: {}
    },
    mutations: {
        updateConfig(state, value) {
            state.config = Object.assign({}, state.config, value);
        },
        updateResults(state, value) {
            state.searchOutput = value;
        },
        updatePendingSearch(state, value) {
            state.pendingSearch = value;
        },
        updateExtendedSearchParams(state, value) {
            state.extendedSearchParams = value;
        }
    },
    actions: {
        fetchResults({ commit, state }, searchParams) {
            var pendingSearch = Object.assign({}, state.pendingSearch, searchParams);
            commit('updatePendingSearch', pendingSearch);

            HawkSearchVue.fetchResults(pendingSearch, (searchOutput) => {
                commit('updateResults', searchOutput);

                HawkSearchVue.extendSearchData(searchOutput, state.pendingSearch, (extendedSearchParams) => {
                    commit('updateExtendedSearchParams', extendedSearchParams);
                });
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
        }
    }
});

class HawkSearchVue$1 {
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
        store.commit('updateConfig', this.config);

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
                });
            }

            return urlParams;
        };

        var urlParams = getUrlParams();
        var initialSearchParams = {};

        if (urlParams.keyword) {
            initialSearchParams = { Keyword: urlParams.keyword };
        }

        store.dispatch('fetchResults', initialSearchParams);
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
        };

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
            callback({});
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
}

//
//
//
//
//
//
//
//

var script = {
    name: 'search-box',
    props: [],
    mounted() {

    },
    data() {
        return {
            keyword: null
        }
    },
    methods: {
        onInput: function (e) {
            if (e.key == 'Enter') {
                this.$root.$store.dispatch('fetchResults', { Keyword: this.keyword });
            }
        }
    },
    computed: {

    }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk__searchBox" }, [
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
        attrs: { type: "text" },
        domProps: { value: _vm.keyword },
        on: {
          keydown: _vm.onInput,
          input: function($event) {
            if ($event.target.composing) {
              return
            }
            _vm.keyword = $event.target.value;
          }
        }
      })
    ])
  ])
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-4682f0aa_0", { source: "\n\n/*# sourceMappingURL=SearchBox.vue.map */", map: {"version":3,"sources":["SearchBox.vue"],"names":[],"mappings":";;AAEA,wCAAwC","file":"SearchBox.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = "data-v-4682f0aa";
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
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
    createInjector,
    undefined,
    undefined
  );

const HawkSearchField = Vue$1.extend({
	data: function () {
		return {

		}
	},
	store,
	components: {
		SearchBox: __vue_component__
    },
	methods: {

	}
});

var script$1 = {
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
            return this.searchOutput.Keyword;
        }
    }
};

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { className: "hawk-facet-rail__results-label" } }, [
    _c("h3", [
      _vm._v(
        "Search Results " + _vm._s(_vm.keyword ? "for " + _vm.keyword : null)
      )
    ])
  ])
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = function (inject) {
    if (!inject) return
    inject("data-v-f8b5f3b4_0", { source: "\n\n/*# sourceMappingURL=SearchResultsLabel.vue.map */", map: {"version":3,"sources":["SearchResultsLabel.vue"],"names":[],"mappings":";;AAEA,iDAAiD","file":"SearchResultsLabel.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$1 = "data-v-f8b5f3b4";
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$2 = {
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
};

/* script */
const __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-sorting" }, [
    _c("span", { staticClass: "hawk-sorting__label" }, [_vm._v("Sort By")]),
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
var __vue_staticRenderFns__$2 = [];
__vue_render__$2._withStripped = true;

  /* style */
  const __vue_inject_styles__$2 = function (inject) {
    if (!inject) return
    inject("data-v-3814f145_0", { source: "\n\n/*# sourceMappingURL=Sorting.vue.map */", map: {"version":3,"sources":["Sorting.vue"],"names":[],"mappings":";;AAEA,sCAAsC","file":"Sorting.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$2 = "data-v-3814f145";
  /* module identifier */
  const __vue_module_identifier__$2 = undefined;
  /* functional template */
  const __vue_is_functional_template__$2 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$3 = {
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
};

/* script */
const __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function() {
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
var __vue_staticRenderFns__$3 = [];
__vue_render__$3._withStripped = true;

  /* style */
  const __vue_inject_styles__$3 = function (inject) {
    if (!inject) return
    inject("data-v-727de6e9_0", { source: "\n\n/*# sourceMappingURL=LeftChevronSvg.vue.map */", map: {"version":3,"sources":["LeftChevronSvg.vue"],"names":[],"mappings":";;AAEA,6CAA6C","file":"LeftChevronSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$3 = "data-v-727de6e9";
  /* module identifier */
  const __vue_module_identifier__$3 = undefined;
  /* functional template */
  const __vue_is_functional_template__$3 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$4 = {
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
};

/* script */
const __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function() {
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
var __vue_staticRenderFns__$4 = [];
__vue_render__$4._withStripped = true;

  /* style */
  const __vue_inject_styles__$4 = function (inject) {
    if (!inject) return
    inject("data-v-77afa9fe_0", { source: "\n\n/*# sourceMappingURL=RightChevronSvg.vue.map */", map: {"version":3,"sources":["RightChevronSvg.vue"],"names":[],"mappings":";;AAEA,8CAA8C","file":"RightChevronSvg.vue","sourcesContent":["\n\n/*# sourceMappingURL=RightChevronSvg.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$4 = "data-v-77afa9fe";
  /* module identifier */
  const __vue_module_identifier__$4 = undefined;
  /* functional template */
  const __vue_is_functional_template__$4 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$5 = {
    name: 'pager',
    props: [],
    components: {
        LeftChevronSvg: __vue_component__$3,
        RightChevronSvg: __vue_component__$4
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
};

/* script */
const __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function() {
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
        }),
        _vm._v(" "),
        _c("span", { staticClass: "visually-hidden" }, [
          _vm._v("Previous page")
        ])
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
        }),
        _vm._v(" "),
        _c("span", { staticClass: "visually-hidden" }, [_vm._v("Next page")])
      ],
      1
    )
  ])
};
var __vue_staticRenderFns__$5 = [];
__vue_render__$5._withStripped = true;

  /* style */
  const __vue_inject_styles__$5 = function (inject) {
    if (!inject) return
    inject("data-v-083e0c10_0", { source: ".break[data-v-083e0c10] {\n  width: 6px;\n  display: inline-block;\n}\n\n/*# sourceMappingURL=Pager.vue.map */", map: {"version":3,"sources":["C:\\projects1\\HAWK\\vue-hawksearch\\src\\components\\results\\tools\\Pager.vue","Pager.vue"],"names":[],"mappings":"AA2EA;EACA,UAAA;EACA,qBAAA;AC1EA;;AAEA,oCAAoC","file":"Pager.vue","sourcesContent":["<template>\r\n    <div class=\"hawk-pagination__controls\">\r\n        <button class=\"hawk-pagination__item\" @click=\"goToPreviousPage\">\r\n            <left-chevron-svg icon-class=\"hawk-pagination__left\" />\r\n            <span class=\"visually-hidden\">Previous page</span>\r\n        </button>\r\n        <input type=\"number\" :value=\"page\" @change=\"onChange\" :class=\"hasError ? 'hawk-pagination__input error' : 'hawk-pagination__input'\" />\r\n        <span class=\"hawk-pagination__total-text\"><span class=\"break\"></span> of {{ totalPages }}</span>\r\n        <button class=\"hawk-pagination__item\" @click=\"goToNextPage\">\r\n            <right-chevron-svg icon-class=\"hawk-pagination__right\" />\r\n            <span class=\"visually-hidden\">Next page</span>\r\n        </button>\r\n    </div>\r\n</template>\r\n\r\n<script lang=\"js\">\r\n    import { mapState } from 'vuex';\r\n    import LeftChevronSvg from '../../svg/LeftChevronSvg'\r\n    import RightChevronSvg from '../../svg/RightChevronSvg'\r\n\r\n    export default {\r\n        name: 'pager',\r\n        props: [],\r\n        components: {\r\n            LeftChevronSvg,\r\n            RightChevronSvg\r\n        },\r\n        mounted() {\r\n\r\n        },\r\n        data() {\r\n            return {\r\n                hasError: false\r\n            }\r\n        },\r\n        methods: {\r\n            goToPreviousPage: function () {\r\n                if (this.page > 1) {\r\n                    this.goToPage(parseInt(this.page, 10) - 1);\r\n                }\r\n            },\r\n            goToNextPage: function () {\r\n                if (this.page < this.totalPages) {\r\n                    this.goToPage(parseInt(this.page, 10) + 1);\r\n                }\r\n            },\r\n            onChange: function (e) {\r\n                this.goToPage(e.target.value);\r\n            },\r\n            goToPage: function (page) {\r\n                if (page >= 1 && page <= this.totalPages) {\r\n                    this.$root.$store.dispatch('applyPageNumber', page);\r\n                }\r\n            }\r\n        },\r\n        computed: {\r\n            ...mapState([\r\n                'searchOutput'\r\n            ]),\r\n            pagination: function () {\r\n                return this.searchOutput.Pagination;\r\n            },\r\n            page: function () {\r\n                return this.pagination.CurrentPage;\r\n            },\r\n            totalPages: function () {\r\n                return this.pagination.NofPages;\r\n            }\r\n        }\r\n    }\r\n\r\n\r\n</script>\r\n\r\n<style scoped lang=\"scss\">\r\n    .break {\r\n        width: 6px;\r\n        display: inline-block;\r\n    }\r\n</style>\r\n",".break {\n  width: 6px;\n  display: inline-block;\n}\n\n/*# sourceMappingURL=Pager.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$5 = "data-v-083e0c10";
  /* module identifier */
  const __vue_module_identifier__$5 = undefined;
  /* functional template */
  const __vue_is_functional_template__$5 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$6 = {
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
};

/* script */
const __vue_script__$6 = script$6;

/* template */
var __vue_render__$6 = function() {
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
var __vue_staticRenderFns__$6 = [];
__vue_render__$6._withStripped = true;

  /* style */
  const __vue_inject_styles__$6 = function (inject) {
    if (!inject) return
    inject("data-v-37e0625a_0", { source: "\n\n/*# sourceMappingURL=ItemsPerPage.vue.map */", map: {"version":3,"sources":["ItemsPerPage.vue"],"names":[],"mappings":";;AAEA,2CAA2C","file":"ItemsPerPage.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$6 = "data-v-37e0625a";
  /* module identifier */
  const __vue_module_identifier__$6 = undefined;
  /* functional template */
  const __vue_is_functional_template__$6 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$7 = {
    name: 'pagination',
    props: [],
    components: {
        Pager: __vue_component__$5,
        ItemsPerPage: __vue_component__$6
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
};

/* script */
const __vue_script__$7 = script$7;

/* template */
var __vue_render__$7 = function() {
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
var __vue_staticRenderFns__$7 = [];
__vue_render__$7._withStripped = true;

  /* style */
  const __vue_inject_styles__$7 = function (inject) {
    if (!inject) return
    inject("data-v-7d3f1983_0", { source: "\n\n/*# sourceMappingURL=Pagination.vue.map */", map: {"version":3,"sources":["Pagination.vue"],"names":[],"mappings":";;AAEA,yCAAyC","file":"Pagination.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$7 = "data-v-7d3f1983";
  /* module identifier */
  const __vue_module_identifier__$7 = undefined;
  /* functional template */
  const __vue_is_functional_template__$7 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$8 = {
    name: 'tool-row',
    props: [],
    components: {
        Sorting: __vue_component__$2,
        Pagination: __vue_component__$7
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
};

/* script */
const __vue_script__$8 = script$8;

/* template */
var __vue_render__$8 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-tool-row" }, [
    _c("div", { staticClass: "hawk-tool-row__item" }, [_c("sorting")], 1),
    _vm._v(" "),
    _c("div", { staticClass: "hawk-tool-row__item" }, [_c("pagination")], 1)
  ])
};
var __vue_staticRenderFns__$8 = [];
__vue_render__$8._withStripped = true;

  /* style */
  const __vue_inject_styles__$8 = function (inject) {
    if (!inject) return
    inject("data-v-02a830e7_0", { source: "\n\n/*# sourceMappingURL=ToolRow.vue.map */", map: {"version":3,"sources":["ToolRow.vue"],"names":[],"mappings":";;AAEA,sCAAsC","file":"ToolRow.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$8 = "data-v-02a830e7";
  /* module identifier */
  const __vue_module_identifier__$8 = undefined;
  /* functional template */
  const __vue_is_functional_template__$8 = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$9 = {
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
};

/* script */
const __vue_script__$9 = script$9;

/* template */
var __vue_render__$9 = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { attrs: { className: "hawk-results__item-image" } }, [
    _c("img", { attrs: { src: _vm.imageUrl } })
  ])
};
var __vue_staticRenderFns__$9 = [];
__vue_render__$9._withStripped = true;

  /* style */
  const __vue_inject_styles__$9 = function (inject) {
    if (!inject) return
    inject("data-v-548895e8_0", { source: "\n\n/*# sourceMappingURL=ResultImage.vue.map */", map: {"version":3,"sources":["ResultImage.vue"],"names":[],"mappings":";;AAEA,0CAA0C","file":"ResultImage.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$9 = "data-v-548895e8";
  /* module identifier */
  const __vue_module_identifier__$9 = undefined;
  /* functional template */
  const __vue_is_functional_template__$9 = false;
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
    createInjector,
    undefined,
    undefined
  );

//

var script$a = {
    name: "ResultItem",
    data: function () {
        return {}
    },
    components: {
        ResultImage: __vue_component__$9
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
};

/* script */
const __vue_script__$a = script$a;

/* template */
var __vue_render__$a = function() {
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
var __vue_staticRenderFns__$a = [];
__vue_render__$a._withStripped = true;

  /* style */
  const __vue_inject_styles__$a = undefined;
  /* scoped */
  const __vue_scope_id__$a = undefined;
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
  );

var script$b = {
    name: 'result-listing',
    props: [],
    components: {
        ResultItem: __vue_component__$a
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
            'searchOutput'
        ]),
        results: function () {
            return this.searchOutput.Results
        }
    }
};

/* script */
const __vue_script__$b = script$b;

/* template */
var __vue_render__$b = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    { staticClass: "hawk-results__listing" },
    [
      _vm._l(_vm.results, function(result) {
        return [_c("result-item", { attrs: { result: result } })]
      })
    ],
    2
  )
};
var __vue_staticRenderFns__$b = [];
__vue_render__$b._withStripped = true;

  /* style */
  const __vue_inject_styles__$b = function (inject) {
    if (!inject) return
    inject("data-v-45711ab8_0", { source: "\n\n/*# sourceMappingURL=ResultListing.vue.map */", map: {"version":3,"sources":["ResultListing.vue"],"names":[],"mappings":";;AAEA,4CAA4C","file":"ResultListing.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$b = "data-v-45711ab8";
  /* module identifier */
  const __vue_module_identifier__$b = undefined;
  /* functional template */
  const __vue_is_functional_template__$b = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$c = {
    name: 'results',
    props: [],
    components: {
        SearchResultsLabel: __vue_component__$1,
        //Selections,
        ToolRow: __vue_component__$8,
        ResultListing: __vue_component__$b
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
            'searchOutput'
        ])
    }
};

/* script */
const __vue_script__$c = script$c;

/* template */
var __vue_render__$c = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.searchOutput
    ? _c(
        "div",
        { staticClass: "hawk-results" },
        [
          _c("search-results-label"),
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
        ],
        1
      )
    : _vm._e()
};
var __vue_staticRenderFns__$c = [];
__vue_render__$c._withStripped = true;

  /* style */
  const __vue_inject_styles__$c = function (inject) {
    if (!inject) return
    inject("data-v-7587c202_0", { source: "\n\n/*# sourceMappingURL=Results.vue.map */", map: {"version":3,"sources":["Results.vue"],"names":[],"mappings":";;AAEA,sCAAsC","file":"Results.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$c = "data-v-7587c202";
  /* module identifier */
  const __vue_module_identifier__$c = undefined;
  /* functional template */
  const __vue_is_functional_template__$c = false;
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
    createInjector,
    undefined,
    undefined
  );

const HawkSearchResults = Vue$1.extend({
	data: function () {
		return {};
	},
	store,
	components: {
		Results: __vue_component__$c
    },
	computed: {
		...mapState([
			'searchOutput'
		])
	}
});

var script$d = {
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
};

/* script */
const __vue_script__$d = script$d;

/* template */
var __vue_render__$d = function() {
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
var __vue_staticRenderFns__$d = [];
__vue_render__$d._withStripped = true;

  /* style */
  const __vue_inject_styles__$d = function (inject) {
    if (!inject) return
    inject("data-v-9ddf6c22_0", { source: "\n\n/*# sourceMappingURL=QuestionmarkSvg.vue.map */", map: {"version":3,"sources":["QuestionmarkSvg.vue"],"names":[],"mappings":";;AAEA,8CAA8C","file":"QuestionmarkSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$d = "data-v-9ddf6c22";
  /* module identifier */
  const __vue_module_identifier__$d = undefined;
  /* functional template */
  const __vue_is_functional_template__$d = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$e = {
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
};

/* script */
const __vue_script__$e = script$e;

/* template */
var __vue_render__$e = function() {
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
var __vue_staticRenderFns__$e = [];
__vue_render__$e._withStripped = true;

  /* style */
  const __vue_inject_styles__$e = function (inject) {
    if (!inject) return
    inject("data-v-0a6471ac_0", { source: "\n\n/*# sourceMappingURL=PlusSvg.vue.map */", map: {"version":3,"sources":["PlusSvg.vue"],"names":[],"mappings":";;AAEA,sCAAsC","file":"PlusSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$e = "data-v-0a6471ac";
  /* module identifier */
  const __vue_module_identifier__$e = undefined;
  /* functional template */
  const __vue_is_functional_template__$e = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$f = {
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
};

/* script */
const __vue_script__$f = script$f;

/* template */
var __vue_render__$f = function() {
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
var __vue_staticRenderFns__$f = [];
__vue_render__$f._withStripped = true;

  /* style */
  const __vue_inject_styles__$f = function (inject) {
    if (!inject) return
    inject("data-v-4adbe69f_0", { source: "\n\n/*# sourceMappingURL=MinusSvg.vue.map */", map: {"version":3,"sources":["MinusSvg.vue"],"names":[],"mappings":";;AAEA,uCAAuC","file":"MinusSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$f = "data-v-4adbe69f";
  /* module identifier */
  const __vue_module_identifier__$f = undefined;
  /* functional template */
  const __vue_is_functional_template__$f = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$g = {
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
};

/* script */
const __vue_script__$g = script$g;

/* template */
var __vue_render__$g = function() {
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
var __vue_staticRenderFns__$g = [];
__vue_render__$g._withStripped = true;

  /* style */
  const __vue_inject_styles__$g = function (inject) {
    if (!inject) return
    inject("data-v-1fe3da33_0", { source: "\n\n/*# sourceMappingURL=CheckmarkSvg.vue.map */", map: {"version":3,"sources":["CheckmarkSvg.vue"],"names":[],"mappings":";;AAEA,2CAA2C","file":"CheckmarkSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$g = "data-v-1fe3da33";
  /* module identifier */
  const __vue_module_identifier__$g = undefined;
  /* functional template */
  const __vue_is_functional_template__$g = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$h = {
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
};

/* script */
const __vue_script__$h = script$h;

/* template */
var __vue_render__$h = function() {
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
var __vue_staticRenderFns__$h = [];
__vue_render__$h._withStripped = true;

  /* style */
  const __vue_inject_styles__$h = function (inject) {
    if (!inject) return
    inject("data-v-69522f14_0", { source: "\n\n/*# sourceMappingURL=PlusCircleSvg.vue.map */", map: {"version":3,"sources":["PlusCircleSvg.vue"],"names":[],"mappings":";;AAEA,4CAA4C","file":"PlusCircleSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$h = "data-v-69522f14";
  /* module identifier */
  const __vue_module_identifier__$h = undefined;
  /* functional template */
  const __vue_is_functional_template__$h = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$i = {
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
};

/* script */
const __vue_script__$i = script$i;

/* template */
var __vue_render__$i = function() {
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
var __vue_staticRenderFns__$i = [];
__vue_render__$i._withStripped = true;

  /* style */
  const __vue_inject_styles__$i = function (inject) {
    if (!inject) return
    inject("data-v-a0212550_0", { source: "\n\n/*# sourceMappingURL=DashCircleSvg.vue.map */", map: {"version":3,"sources":["DashCircleSvg.vue"],"names":[],"mappings":";;AAEA,4CAA4C","file":"DashCircleSvg.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$i = "data-v-a0212550";
  /* module identifier */
  const __vue_module_identifier__$i = undefined;
  /* functional template */
  const __vue_is_functional_template__$i = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$j = {
    name: 'checkbox',
    props: ['facetData'],
    components: {
        CheckmarkSvg: __vue_component__$g,
        PlusCircleSvg: __vue_component__$h,
        DashCircleSvg: __vue_component__$i
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
};

/* script */
const __vue_script__$j = script$j;

/* template */
var __vue_render__$j = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail__facet-values" }, [
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
                            staticClass: "hawk-facet-rail__facet-checkbox-icon"
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
                        }),
                        _vm._v(" "),
                        _c("span", { staticClass: "visually-hidden" }, [
                          _vm._v("Include facet")
                        ])
                      ]
                    : [
                        _c("dash-circle-svg"),
                        _vm._v(" "),
                        _c("span", { staticClass: "visually-hidden" }, [
                          _vm._v("Exclude facet")
                        ])
                      ]
                ],
                2
              )
            ]
          )
        }),
        0
      )
    ])
  ])
};
var __vue_staticRenderFns__$j = [];
__vue_render__$j._withStripped = true;

  /* style */
  const __vue_inject_styles__$j = function (inject) {
    if (!inject) return
    inject("data-v-22c6f930_0", { source: ".line-through[data-v-22c6f930] {\n  text-decoration: line-through;\n}\n\n/*# sourceMappingURL=Checkbox.vue.map */", map: {"version":3,"sources":["C:\\projects1\\HAWK\\vue-hawksearch\\src\\components\\facets\\types\\Checkbox.vue","Checkbox.vue"],"names":[],"mappings":"AA0FA;EACA,6BAAA;ACzFA;;AAEA,uCAAuC","file":"Checkbox.vue","sourcesContent":["<template>\r\n    <div class=\"hawk-facet-rail__facet-values\">\r\n        <div class=\"hawk-facet-rail__facet-values-checkbox\">\r\n            <ul class=\"hawk-facet-rail__facet-list\">\r\n                <li v-for=\"value in items\" :key=\"value.Value\" class=\"hawk-facet-rail__facet-list-item\">\r\n                    <button @click=\"selectFacet(value)\" class=\"hawk-facet-rail__facet-btn\">\r\n                        <span :class=\"value.Selected ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked' : 'hawk-facet-rail__facet-checkbox'\">\r\n                            <checkmark-svg v-if=\"value.Selected\" class=\"hawk-facet-rail__facet-checkbox-icon\" />\r\n                        </span>\r\n\r\n                        <span v-if=\"rangeValueAssetUrl\" class=\"hawk-selectionInner\">\r\n                            <span class=\"hawk-range-asset\" :title=\"value.Label\" />\r\n\r\n                            <img :src=\"rangeValueAssetUrl\" :alt=\"value.Label\"  />\r\n                        </span>\r\n\r\n                        <span :class=\"value.Negated ? 'hawk-facet-rail__facet-name line-through' : 'hawk-facet-rail__facet-name' \">\r\n                            {{ value.Label }} ({{ value.Count }})\r\n                        </span>\r\n                    </button>\r\n\r\n                    <button @click=\"negateFacet(value)\" class=\"hawk-facet-rail__facet-btn-exclude\">\r\n                        <template v-if=\"value.Negated\">\r\n                            <plus-circle-svg class=\"hawk-facet-rail__facet-btn-include\" />\r\n                            <span class=\"visually-hidden\">Include facet</span>\r\n                        </template>\r\n                        <template v-else>\r\n                            <dash-circle-svg />\r\n                            <span class=\"visually-hidden\">Exclude facet</span>\r\n                        </template>\r\n                    </button>\r\n                </li>\r\n            </ul>\r\n        </div>\r\n    </div>\r\n</template>\r\n\r\n<script lang=\"js\">\r\n    import CheckmarkSvg from '../../svg/CheckmarkSvg';\r\n    import PlusCircleSvg from '../../svg/PlusCircleSvg';\r\n    import DashCircleSvg from '../../svg/DashCircleSvg';\r\n\r\n    export default {\r\n        name: 'checkbox',\r\n        props: ['facetData'],\r\n        components: {\r\n            CheckmarkSvg,\r\n            PlusCircleSvg,\r\n            DashCircleSvg\r\n        },\r\n        mounted() {\r\n\r\n        },\r\n        data() {\r\n            return {\r\n\r\n            }\r\n        },\r\n        methods: {\r\n            selectFacet: function (value) {\r\n                if (value.Negated) {\r\n                    value.Selected = true;\r\n                    value.Negated = false;\r\n                }\r\n                else {\r\n                    value.Selected = !value.Selected;\r\n                }\r\n\r\n                this.applyFacets();\r\n            },\r\n            negateFacet: function (value) {\r\n                value.Negated = !value.Negated;\r\n                value.Selected = value.Negated;\r\n                this.applyFacets();\r\n            },\r\n            applyFacets: function () {\r\n                this.$root.$store.dispatch('applyFacets', this.facetData);\r\n            }\r\n        },\r\n        computed: {\r\n            items: function () {\r\n                return this.facetData.Values;\r\n            }\r\n        }\r\n    }\r\n\r\n\r\n</script>\r\n\r\n<style scoped lang=\"scss\">\r\n    .line-through {\r\n        text-decoration: line-through;\r\n    }\r\n</style>\r\n",".line-through {\n  text-decoration: line-through;\n}\n\n/*# sourceMappingURL=Checkbox.vue.map */"]}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$j = "data-v-22c6f930";
  /* module identifier */
  const __vue_module_identifier__$j = undefined;
  /* functional template */
  const __vue_is_functional_template__$j = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$k = {
    name: 'nested-item',
    props: ['itemData'],
    components: {
        CheckmarkSvg: __vue_component__$g,
        PlusCircleSvg: __vue_component__$h,
        DashCircleSvg: __vue_component__$i
    },
    mounted() {

    },
    data() {
        return {
            isExpanded: false,
            isSelected: false,
            isNegated: false
        }
    },
    methods: {
        onValueSelected: function () {
            console.log('Value selected');
        },
        toggleExpanded: function () {
            this.isExpanded = !this.isExpanded;
        }
    },
    computed: {
    }
};

/* script */
const __vue_script__$k = script$k;

/* template */
var __vue_render__$k = function() {
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
            on: { click: _vm.onValueSelected }
          },
          [
            _c(
              "span",
              {
                class: _vm.isSelected
                  ? "hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked"
                  : "hawk-facet-rail__facet-checkbox"
              },
              [
                _vm.isSelected
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
                staticClass: "hawk-facet-rail__facet-name",
                style: _vm.isNegated ? "{ textDecoration: 'line-through' }" : ""
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
            on: { click: _vm.onValueSelected }
          },
          [
            _vm.isNegated
              ? [
                  _c("plus-circle-svg", {
                    staticClass: "hawk-facet-rail__facet-btn-include"
                  }),
                  _vm._v(" "),
                  _c("span", { staticClass: "visually-hidden" }, [
                    _vm._v("Include facet")
                  ])
                ]
              : [
                  _c("dash-circle-svg"),
                  _vm._v(" "),
                  _c("span", { staticClass: "visually-hidden" }, [
                    _vm._v("Exclude facet")
                  ])
                ]
          ],
          2
        ),
        _vm._v(" "),
        _c("button", {
          class: _vm.isExpanded
            ? "hawk-collapseState"
            : "hawk-collapseState collapsed",
          attrs: { "aria-expanded": "false" },
          on: { click: _vm.toggleExpanded }
        })
      ]),
      _vm._v(" "),
      _vm.isExpanded && _vm.itemData.children
        ? _c("div", { staticClass: "hawk-facet-rail__w-100" }, [
            _c(
              "ul",
              { staticClass: "hawkFacet-group-inside" },
              _vm._l(_vm.itemData.children, function(item) {
                return _c("nested-item", {
                  key: item.Value,
                  attrs: { "item-data": item }
                })
              }),
              1
            )
          ])
        : _vm._e()
    ]
  )
};
var __vue_staticRenderFns__$k = [];
__vue_render__$k._withStripped = true;

  /* style */
  const __vue_inject_styles__$k = function (inject) {
    if (!inject) return
    inject("data-v-3d6b9714_0", { source: "\n\n/*# sourceMappingURL=NestedItem.vue.map */", map: {"version":3,"sources":["NestedItem.vue"],"names":[],"mappings":";;AAEA,yCAAyC","file":"NestedItem.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$k = "data-v-3d6b9714";
  /* module identifier */
  const __vue_module_identifier__$k = undefined;
  /* functional template */
  const __vue_is_functional_template__$k = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$l = {
    name: 'nested-checkbox',
    props: ['facetData'],
    components: {
        NestedItem: __vue_component__$k
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
};

/* script */
const __vue_script__$l = script$l;

/* template */
var __vue_render__$l = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c("div", { staticClass: "hawk-facet-rail__facet-values" }, [
    _c("div", { staticClass: "hawk-facet-rail__facet-values-checkbox" }, [
      _c(
        "ul",
        { staticClass: "hawk-facet-rail__facet-list" },
        _vm._l(_vm.items, function(item) {
          return _c("nested-item", {
            key: item.Value,
            attrs: { "item-data": item }
          })
        }),
        1
      )
    ])
  ])
};
var __vue_staticRenderFns__$l = [];
__vue_render__$l._withStripped = true;

  /* style */
  const __vue_inject_styles__$l = function (inject) {
    if (!inject) return
    inject("data-v-805d3334_0", { source: "\n\n/*# sourceMappingURL=NestedCheckbox.vue.map */", map: {"version":3,"sources":["NestedCheckbox.vue"],"names":[],"mappings":";;AAEA,6CAA6C","file":"NestedCheckbox.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$l = "data-v-805d3334";
  /* module identifier */
  const __vue_module_identifier__$l = undefined;
  /* functional template */
  const __vue_is_functional_template__$l = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$m = {
    name: 'facet',
    props: ['facetData'],
    components: {
        QuestionmarkSvg: __vue_component__$d,
        PlusSvg: __vue_component__$e,
        MinusSvg: __vue_component__$f,
        Checkbox: __vue_component__$j,
        NestedCheckbox: __vue_component__$l
    },
    mounted() {

    },
    data() {
        return {
            isCollapsed: false,
            filter: null
        }
    },
    methods: {
        toggleCollapse: function () {
            this.isCollapsed = !this.isCollapsed;
        },
        setFilter: function () {
            console.log("Set filter");
        }
    },
    computed: {
        shouldSearch: function () {
            return this.facetData.IsSearch && this.facetData.Values.length > this.facetData.SearchThreshold;
        },
        componentName: function () {
            switch (this.facetData.FacetType) {
                case "checkbox":
                    return "checkbox";

                //case "link":
                //    return "link";
                //    break;

                //case "nestedcheckbox":
                //    return "nested-checkbox";
                //    break;

                //case "nestedlinklist":
                //    return "";
                //    break;

                //case "rating":
                //    return "";
                //    break;

                //case "recentsearches":
                    //return "";
                    //break;

                //case "related":
                //    return "";
                //    break;

                //case "search":
                //    return "search";
                //    break;

                //case "size":
                //    return "";
                //    break;

                //case "slider":
                //    return "slider";
                //    break;

                //case "swatch":
                //    return "swatch";
                //    break;

                //case "openRange":
                //    return "open-range";
                //    break;

                default:
                    return false;
            }
        }
    }
};

/* script */
const __vue_script__$m = script$m;

/* template */
var __vue_render__$m = function() {
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
                  _vm.isCollapsed
                    ? [
                        _c("plus-svg"),
                        _vm._v(" "),
                        _c("span", { staticClass: "visually-hidden" }, [
                          _vm._v("Expand facet category")
                        ])
                      ]
                    : [
                        _c("minus-svg"),
                        _vm._v(" "),
                        _c("span", { staticClass: "visually-hidden" }, [
                          _vm._v("Collapse facet category")
                        ])
                      ]
                ],
                2
              ),
              _vm._v(" "),
              !_vm.isCollapsed
                ? _c(
                    "div",
                    { staticClass: "hawk-facet-rail__facet-body" },
                    [
                      _c(_vm.componentName, {
                        tag: "component",
                        attrs: { "facet-data": _vm.facetData }
                      })
                    ],
                    1
                  )
                : _vm._e()
            ])
          ]
        : _vm._e()
    ],
    2
  )
};
var __vue_staticRenderFns__$m = [];
__vue_render__$m._withStripped = true;

  /* style */
  const __vue_inject_styles__$m = function (inject) {
    if (!inject) return
    inject("data-v-7000d218_0", { source: "\n\n/*# sourceMappingURL=Facet.vue.map */", map: {"version":3,"sources":["Facet.vue"],"names":[],"mappings":";;AAEA,oCAAoC","file":"Facet.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$m = "data-v-7000d218";
  /* module identifier */
  const __vue_module_identifier__$m = undefined;
  /* functional template */
  const __vue_is_functional_template__$m = false;
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
    createInjector,
    undefined,
    undefined
  );

var script$n = {
    name: 'facet-list',
    props: [],
    components: {
        Facet: __vue_component__$m
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
            return this.extendedSearchParams.Facets;
        }
    }
};

/* script */
const __vue_script__$n = script$n;

/* template */
var __vue_render__$n = function() {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _vm.extendedSearchParams
    ? _c("div", { staticClass: "hawk-facet-rail" }, [
        _c("div", { staticClass: "hawk-facet-rail__heading" }, [
          _vm._v("Narrow Results")
        ]),
        _vm._v(" "),
        _c(
          "div",
          { staticClass: "hawk-facet-rail__facet-list" },
          [
            _vm._l(_vm.facets, function(facetData) {
              return [_c("facet", { attrs: { "facet-data": facetData } })]
            })
          ],
          2
        )
      ])
    : _vm._e()
};
var __vue_staticRenderFns__$n = [];
__vue_render__$n._withStripped = true;

  /* style */
  const __vue_inject_styles__$n = function (inject) {
    if (!inject) return
    inject("data-v-2552c1a3_0", { source: "\n\n/*# sourceMappingURL=FacetList.vue.map */", map: {"version":3,"sources":["FacetList.vue"],"names":[],"mappings":";;AAEA,wCAAwC","file":"FacetList.vue"}, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__$n = "data-v-2552c1a3";
  /* module identifier */
  const __vue_module_identifier__$n = undefined;
  /* functional template */
  const __vue_is_functional_template__$n = false;
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
    createInjector,
    undefined,
    undefined
  );

const HawkSearchFacets = Vue$1.extend({
	store,
    components: {
        FacetList: __vue_component__$n
    }
});

window.Vue = Vue$1;

Vue$1.config.devtools = true;
Vue$1.use(VueResource);
window.HawkSearchVue = HawkSearchVue$1;

export default HawkSearchVue$1;
export { HawkSearchFacets, HawkSearchField, HawkSearchResults, store as HawkSearchStore, __vue_component__$a as ResultItem, __vue_component__$b as ResultListing, __vue_component__ as SearchBox };
//# sourceMappingURL=vue-hawksearch.js.map
