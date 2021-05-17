<template>
    <div v-if="hasSelections" class="hawk-facet-rail__selections" @click="onClick">
        <h4>{{ $t("You've Selected") }}</h4>
        <ul class="hawk-selections">
            <li v-for="(data, field) in selections" :key="field" class="hawk-selections__category">
                <div class="hawk-selections__category-wrapper">
                    <span class="hawk-selections__category-name">{{ data.Label }}:</span>
                    <ul class="hawk-selections__item-list">
                        <li v-for="item in data.Items" :key="item" class="hawk-selections__item">
                            <button @click="clearSelectionItem(field, item)" class="hawk-selections__item-remove">
                                <x-circle-svg></x-circle-svg>
                            </button>
                            <span :class="itemClass(item)">
                                <template v-if="getFacetType(field) == 'range'">
                                    {{ rangeLabel(item.Label) }}
                                </template>
                                <template v-else>
                                    {{ item.Label }}
                                </template>
                            </span>
                        </li>
                    </ul>
                </div>
                <button @click="clearSelectionField(field)" class="hawk-selections__category-remove">
                    <x-circle-svg></x-circle-svg>
                </button>
            </li>
            <li class="hawk-selections__category">
                <button @click="clearAll" class="hawk-btn hawk-btn-primary-outline">
                    {{ $t("Clear All") }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import XCircleSvg from '../svg/XCircleSvg';

    export default {
        name: 'selections',
        props: [],
        mounted() {

        },
        data() {
            return {
                selections: [],
                facetType: {},
                searchWithinLabel: null
            }
        },
        components: {
            XCircleSvg
        },
        methods: {
            onClick: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            itemClass: function (item) {
                if (item.Value.startsWith('-')) {
                    return 'hawk-selections__item-name hawk-selections__item-name--negated';
                }
                else {
                    return 'hawk-selections__item-name';
                }
            },
            clearSearchWithin: function () {
                if (this.pendingSearch) {
                    var pendingSearch = Object.assign({}, this.pendingSearch);
                    delete pendingSearch.SearchWithin;
                    this.$root.$store.commit('updatePendingSearch', pendingSearch);
                }
            },
            clearSelectionField: function (field) {
                if (field != 'searchWithin') {
                    if (this.selections.hasOwnProperty(field)) {
                        this.selections[field].Items = [];
                        this.refreshResults();
                    }
                }
                else {
                    this.clearSearchWithin();
                    this.$root.dispatchToStore('fetchResults', { PageNo: 1 });
                }
            },
            clearSelectionItem: function (field, item) {
                if (field != 'searchWithin') {
                    if (this.selections.hasOwnProperty(field)) {
                        this.selections[field].Items = this.selections[field].Items.filter(v => v != item);
                        this.refreshResults();
                    }
                }
                else {
                    this.clearSearchWithin();
                    this.$root.dispatchToStore('fetchResults', { PageNo: 1 });
                }
            },
            clearAll: function () {
                if (this.selections) {
                    Object.keys(this.selections).forEach(field => {
                        this.selections[field].Items = [];
                    });
                }

                this.clearSearchWithin();
                this.refreshResults();
            },
            refreshResults: function () {
                var headers = { PageNo: 1 };
                var facetHeaders = Object.assign({}, this.selections);

                if (facetHeaders.hasOwnProperty('searchWithin')) {
                    headers.SearchWithin = facetHeaders.searchWithin[0];
                    delete facetHeaders.searchWithin;
                }

                Object.keys(facetHeaders).forEach(key => {
                    facetHeaders[key] = facetHeaders[key].Items.map(item => item.Value);
                });

                headers.FacetSelections = _.pickBy(Object.assign({}, this.pendingSearch.FacetSelections, facetHeaders), (a) => { return !_.isEmpty(a) });

                this.$root.dispatchToStore('fetchResults', headers).then(() => {
                            var widget = this.$root;
                            var store = HawksearchVue.getWidgetStore(widget);
                            HawksearchVue.truncateFacetSelections(store);
                            HawksearchVue.applyTabSelection(widget);
                });
            },
            getFacetType: function (field) {
                if (this.searchOutput && this.searchOutput.Facets.length) {
                    var facets = this.searchOutput.Facets;
                    var type;

                    facets.forEach(facet => {
                        if (HawksearchVue.getFacetParamName(facet) == field) {
                            type = facet.FieldType
                        }
                    });

                    if (type) {
                        this.facetType[field] = type;
                    }
                    else {
                        type = this.facetType[field];
                    }

                    return type;
                }
                else if (this.facetType.hasOwnProperty(field)) {
                    return this.facetType[field];
                }
            },
            rangeLabel: function (item) {
                return item.split(',').join(' - ');
            },
            setSearchWithinLabel: function () {
                if (this.searchOutput && this.searchOutput.Facets.length && !this.searchWithinLabel) {
                    var searchWithin = this.searchOutput.Facets.find(facet => facet.Field == 'searchWithin');

                    if (searchWithin) {
                        this.searchWithinLabel = searchWithin.Name;
                    }
                }
            }
        },
        computed: {
            ...mapState([
                'pendingSearch',
                'searchOutput'
            ]),
            ...mapGetters([
                'tabSelection'
            ]),
            hasSelections: function () {
                return Object.keys(this.selections).length != 0;
            }
        },
        watch: {
            searchOutput: function (n, o) {
                if (n) {
                    var selections = {};
                    var facets = n.Selections;
                    var search = this.pendingSearch.SearchWithin;

                    this.setSearchWithinLabel();

                    if (Object.keys(facets).length) {
                        selections = Object.assign({}, facets);
                    }

                    if (search) {
                        selections = Object.assign({}, selections, { 'searchWithin': { Items: [{ Value: search, Label: search }], Label: this.searchWithinLabel } });
                    }

                    this.selections = selections

                    return selections;
                }
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
