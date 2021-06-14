<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-linklist">
            <ul class="hawk-facet-rail__facet-list">
                <nested-link-item v-for="item in items" :key="item.Value" :item-data="item" :facet-data="facetData"></nested-link-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import NestedLinkItem from './NestedLinkItem';

    export default {
        name: 'nested-link-list',
        props: ['facetData'],
        components: {
            NestedLinkItem
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            clearSelections: function (exception) {
                var clearValues = function (items) {
                    items = items.map(item => {
                        if (item.Children) {
                            clearValues(item.Children);
                        }

                        if (!lodash.isEqual(item, exception)) {
                            item.Negated = false;
                            item.Selected = false;
                        }

                        return item;
                    });
                }
                if (this.getCheckboxType() == 'single') {
                    clearValues(this.items);
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
