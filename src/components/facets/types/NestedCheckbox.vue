<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-checkbox">
            <ul class="hawk-facet-rail__facet-list">
                <nested-item v-for="item in items" :key="item.Value" :item-data="item" :facet-data="facetData" ></nested-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import NestedItem from './NestedItem';

    export default {
        name: 'nested-checkbox',
        props: ['facetData'],
        components: {
            NestedItem
        },
        mounted() {

        },
        data() {
            return {}
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
            clearInlineSelections: function (exception) {
                var clearInlineValues = function (items) {
                    items = items.map(item => {
                        if (item.Children) {
                            clearInlineValues(item.Children);
                        }

                        if (item.Path.indexOf(exception.Path) === 0 || exception.Path.indexOf(item.Path) === 0) {
                            item.Negated = false;
                            item.Selected = false;
                        }

                        return item;
                    });
                }
                if (this.getCheckboxType() == 'single') {
                    clearInlineValues(this.items);
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
