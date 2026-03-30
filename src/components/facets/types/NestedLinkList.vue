<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-linklist">
            <ul class="hawk-facet-rail__facet-list">
                <nested-link-item
                    v-for="item in items"
                    :key="item.Value"
                    :item-data="item"
                    @select-facet-value="onSelectFacetValue"
                />
            </ul>
        </div>
        <slot/>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex';
    import NestedLinkItem from './NestedLinkItem.vue';

    export default {
        name: 'nested-link-list',
        props: ['facetData'],
        components: {
            NestedLinkItem
        },
        methods: {
            clearSelections: function (exception) {
                if (this.getCheckboxType() !== 'single') {
                    return;
                }
                var clearValues = function(items) {
                    items.forEach(item => {
                        if (item.Children) {
                            clearValues(item.Children);
                        }
                        if (!lodash.isEqual(item, exception)) {
                            item.Selected = false;
                        }
                    });
                }
                clearValues(this.facetData.Values);
            },
            getCheckboxType: function () {
                var field = HawksearchVue.getFacetParamName(this.facetData);

                if (this.config.facetConfig.hasOwnProperty(field)) {
                    return this.config.facetConfig[field];
                }
                else {
                    return 'multiple';
                }
            },
            onSelectFacetValue: function (facetValue) {
                this.clearSelections(facetValue);
                facetValue.Selected = !facetValue.Selected;
                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.dispatchToStore('applyFacets', this.facetData);
            }
        },
        computed: {
            items: function () {
                return this.facetData.Values;
            },
            ...mapGetters(['config']),
        },
    }
</script>
