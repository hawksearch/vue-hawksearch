<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-checkbox">
            <ul class="hawk-facet-rail__facet-list">
                <nested-item
                    v-for="item in items"
                    :key="item.Value"
                    :item-data="item"
                    @select-facet-value="onSelectFacetValue"
                    @negate-facet-value="onNegateFacetValue"
                />
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import NestedItem from './NestedItem.vue';

export default {
    name: 'nested-checkbox',
    props: ['facetData'],
    components: {
        NestedItem
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
                        item.Negated = false;
                        item.Selected = false;
                    }
                });
            }
            clearValues(this.facetData.Values);
        },
        clearInlineSelections: function (exception) {
            if (this.getCheckboxType() !== 'single') {
                return;
            }
            var clearValues = function(items) {
                items.forEach(item => {
                    if (item.Children) {
                        clearValues(item.Children);
                    }
                    if (item.Path.indexOf(exception.Path) === 0 || exception.Path.indexOf(item.Path) === 0) {
                        item.Negated = false;
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
            this.clearInlineSelections(facetValue);

            if (facetValue.Negated) {
                facetValue.Selected = true;
                facetValue.Negated = false;
            }
            else {
                facetValue.Selected = !facetValue.Selected;
            }

            this.applyFacets();
        },
        onNegateFacetValue: function (facetValue) {
            this.clearSelections(facetValue);

            facetValue.Negated = !facetValue.Negated;
            facetValue.Selected = facetValue.Negated;
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
    }
}
</script>

<style scoped lang="scss">

</style>
