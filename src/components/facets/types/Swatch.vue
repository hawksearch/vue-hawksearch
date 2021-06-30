<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-swatch">
            <ul class="hawk-facet-rail__facet-list">
                <swatch-item v-for="item in items" :key="item.Value" :item="item" :facet-data="facetData"></swatch-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import SwatchItem from './SwatchItem';

    export default {
        name: 'swatch',
        props: ['facetData'],
        components: {
            SwatchItem
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            clearSelections: function (exception) {
                if (this.getCheckboxType() == 'single') {
                    this.items = this.items.map(item => {
                        if (lodash.isEqual(item, exception)) {
                            return item;
                        }
                        else {
                            item.Negated = false;
                            item.Selected = false;
                        }
                    });
                }
            },
            getCheckboxType: function () {
                var field = HawksearchVue.getFacetParamName(this.facetData);

                if (this.$root.config.facetConfig.hasOwnProperty(field)) {
                    return this.$root.config.facetConfig[field];
                }
                else {
                    return 'multiple';
                }
            }
        },
        computed: {
            items: function () {
                return this.facetData.Values;
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
