<template>
    <div v-if="hasSelections" class="hawk-facet-rail__selections" @click="onClick">
        <h4>{{ $t("You've Selected") }}</h4>
        <ul class="hawk-selections">
            <li v-for="(data, field) in selections" :key="field" class="hawk-selections__category">
                <div class="hawk-selections__category-wrapper">
                    <span class="hawk-selections__category-name">{{ data.Label }}:</span>
                    <ul class="hawk-selections__item-list">
                        <li v-for="item in data.Items" :key="item.Value" class="hawk-selections__item">
                            <button @click="clearSelectionItem(field, item)" class="hawk-selections__item-remove">
                                <x-circle-svg></x-circle-svg>
                            </button>
                            <span :class="[itemNameClass, isNegatedItem(item) ? itemNameNegatedClass : '']">
                                <template v-if="getFacetType(field) == 'range'">
                                    {{ htmlEntityDecode(rangeLabel(itemLabel(item))) }}
                                </template>
                                <template v-else>
                                    {{ htmlEntityDecode(itemLabel(item)) }}
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
    import XCircleSvg from '../svg/XCircleSvg.vue';
    import { FacetNegationService } from '@/core/services/FacetNegationService';

    export default {
        name: 'selections',
        data() {
            return {
                facetType: {},
                itemNameClass: 'hawk-selections__item-name',
                itemNameNegatedClass: 'hawk-selections__item-name--negated'
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
            toFacetSelectionsPayload: function (selections) {
                var facetSelections = {};

                Object.keys(selections || {}).forEach(field => {
                    if (field === 'searchWithin') {
                        return;
                    }

                    var values = (selections[field].Items || []).map(item => item.Value);

                    if (values.length) {
                        facetSelections[field] = values;
                    }
                });

                return facetSelections;
            },
            getSearchWithinValue: function (selections) {
                return selections?.searchWithin?.Items?.[0]?.Value;
            },
            clearSelectionField: function (field) {
                if (field === 'searchWithin') {
                    this.$root.dispatchToStore('clearFacet', 'SearchWithin');
                    return;
                }

                var selections = lodash.cloneDeep(this.selectionsForDisplay || {});

                if (selections.hasOwnProperty(field)) {
                    delete selections[field];
                    this.refreshResults(selections);
                }
            },
            clearSelectionItem: function (field, item) {
                if (field === 'searchWithin') {
                    this.$root.dispatchToStore('clearFacet', 'SearchWithin');
                    return;
                }

                var selections = lodash.cloneDeep(this.selectionsForDisplay || {});

                if (selections.hasOwnProperty(field)) {
                    selections[field].Items = (selections[field].Items || []).filter(v => v.Value != item.Value);

                    if (!selections[field].Items.length) {
                        delete selections[field];
                    }

                    this.refreshResults(selections);
                }
            },
            clearAll: function () {
                this.refreshResults({});
            },
            refreshResults: function (selections = this.selectionsForDisplay) {
                var headers = {
                    PageNo: 1,
                    FacetSelections: this.toFacetSelectionsPayload(selections),
                    SearchWithin: this.getSearchWithinValue(selections)
                };

                this.$root.dispatchToStore('fetchResults', headers).then(() => {
                    var widget = this.$root;
                    var store = HawksearchVue.getWidgetStore(widget);
                    HawksearchVue.truncateFacetSelections(store);
                    HawksearchVue.applyTabSelection(widget);
                });
            },
            getFacetType: function (field) {
                if (this.searchOutput?.Facets?.length) {
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
            itemLabel: function (item) {
                return FacetNegationService.extractBase(item.Label);
            },
            setSearchWithinLabel: function () {
                if (this.searchOutput?.Facets?.length && !this.searchWithinLabel) {
                    var searchWithin = this.searchOutput.Facets.find(facet => facet.Field == 'searchWithin');

                    if (searchWithin) {
                        this.searchWithinLabel = searchWithin.Name;
                    }
                }
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            },
            isNegatedItem: function (item) {
                return FacetNegationService.isNegated(item.Value)
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            ...mapGetters([
                'tabSelection',
                'selectionsForDisplay'
            ]),
            selections: function () {
                return this.selectionsForDisplay || {};
            },
            hasSelections: function () {
                return Object.keys(this.selections).length != 0;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
