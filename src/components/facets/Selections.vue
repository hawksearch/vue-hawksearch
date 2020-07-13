<template>
    <div v-if="hasSelections" class="hawk-facet-rail__selections">
        <h4>{{ $t("You've Selected") }}</h4>
        <ul class="hawk-selections">
            <li v-for="(facetValues, field) in facetSelections" :key="field" class="hawk-selections__category">
                <div class="hawk-selections__category-wrapper">
                    <span class="hawk-selections__category-name">{{ facetSelectionsLabels[field] }}:</span>
                    <ul class="hawk-selections__item-list">
                        <li v-for="item in facetValues" :key="item" class="hawk-selections__item">
                            <button @click="clearSelectionItem(field, item)" class="hawk-selections__item-remove">
                                <x-circle-svg></x-circle-svg>
                            </button>
                            <span :class="itemClass(item)">
                                <template v-if="getFacetType(field) == 'range'">
                                    {{ rangeLabel(item) }}
                                </template>
                                <template v-else>
                                    {{ getFacetLabel(field, item) }}
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
    import { mapState } from 'vuex';
    import XCircleSvg from '../svg/XCircleSvg';

    export default {
        name: 'selections',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        components: {
            XCircleSvg
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
                if (field != 'searchWithin') {
                    var selections = Object.assign({}, this.facetSelections);

                    if (selections.hasOwnProperty(field)) {
                        delete selections[field];
                        this.refreshResults(selections);
                    }
                }
                else {
                    this.clearSearchWithin();
                    this.$root.$store.dispatch('fetchResults', {});
                }
            },
            clearSearchWithin: function () {
                if (this.pendingSearch) {
                    var pendingSearch = Object.assign({}, this.pendingSearch);
                    delete pendingSearch.SearchWithin;
                    this.$root.$store.commit('updatePendingSearch', pendingSearch);
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
                this.clearSearchWithin();
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
                        if (HawksearchVue.getFacetParamName(facet) == field) {
                            type = facet.FieldType
                        }
                    });

                    return type;
                }
            },
            rangeLabel: function (item) {
                return item.split(',').join(' - ');
            },
            getFacetLabel: function (field, item) {
                if (this.searchOutput) {
                    var facets = this.searchOutput.Facets;
                    var label = item;

                    if (field != 'searchWithin') {
                        facets.forEach(facet => {
                            if (HawksearchVue.getFacetParamName(facet) == field) {
                                if (facet.Values) {
                                    facet.Values.forEach(value => {
                                        if (value.Value == item) {
                                            label = value.Label;
                                        }
                                    })
                                }
                            }
                        });
                    }

                    return label;
                }
            }
        },
        computed: {
            ...mapState([
                'pendingSearch',
                'searchOutput'
            ]),
            facetSelections: function () {
                if (this.pendingSearch) {
                    var selections = {};
                    var facets = this.pendingSearch.FacetSelections;
                    var search = this.pendingSearch.SearchWithin;

                    if (Object.keys(facets).length) {
                        selections = Object.assign({}, facets);
                    }

                    if (search) {
                        selections = Object.assign({}, selections, { 'searchWithin': [search]});
                    }

                    return selections;
                }
            },
            hasSelections: function () {
                return Object.keys(this.facetSelections).length != 0;
            },
            facetSelectionsLabels: function () {
                var facetSelectionsLabels = Object.assign({}, this.facetSelections);

                if (this.searchOutput) {
                    var facets = this.searchOutput.Facets;
                    var field;

                    facets.forEach(facet => {
                        field = HawksearchVue.getFacetParamName(facet);

                        if (facetSelectionsLabels.hasOwnProperty(field)) {
                            facetSelectionsLabels[field] = facet.Name;
                        }
                    });
                }

                return facetSelectionsLabels
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
