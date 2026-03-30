<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-swatch">
            <ul class="hawk-facet-rail__facet-list">
                <swatch-item
                    v-for="item in items"
                    :key="item.Value"
                    :item="item"
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
import SwatchItem from './SwatchItem.vue';

export default {
    name: 'swatch',
    props: ['facetData'],
    components: {
        SwatchItem
    },
    methods: {
        clearSelections: function (exception) {
            if (this.getCheckboxType() !== 'single') {
                return;
            }
            this.facetData.Values.forEach(item => {
                if (!lodash.isEqual(item, exception)) {
                    item.Negated = false;
                    item.Selected = false;
                }
            });
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
