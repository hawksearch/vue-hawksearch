<template>
    <li class="hawk-facet-rail__facet-list-item hawkFacet-group">
        <div class="hawkFacet-group__inline">
            <button @click="selectFacet(itemData)" class="hawk-facet-rail__facet-btn" >
                <span :class="itemData.Selected ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked' : 'hawk-facet-rail__facet-checkbox'" >
                    <template v-if="itemData.Selected">
                        <checkmark-svg class="hawk-facet-rail__facet-checkbox-icon" />
                    </template>
                </span>
                <span :class="itemData.Negated ? 'hawk-facet-rail__facet-name line-through' : 'hawk-facet-rail__facet-name' ">
                    {{ itemData.Label }} ({{ itemData.Count }})
                </span>
            </button>
            <button @click="negateFacet(itemData)" class="hawk-facet-rail__facet-btn-exclude">
                <template v-if="itemData.Negated">
                    <plus-circle-svg class="hawk-facet-rail__facet-btn-include" />
                </template>
                <template v-else>
                    <dash-circle-svg />
                </template>
            </button>
            <button v-if="itemData.Children && itemData.Children.length" :class="isExpanded ? 'hawk-collapseState' : 'hawk-collapseState collapsed'" aria-expanded="false" @click="toggleExpanded">
            </button>
        </div>
        <div v-if="isExpanded && itemData.Children" class="hawk-facet-rail__w-100">
            <ul class="hawkFacet-group-inside">
                <nested-item v-for="item in itemData.Children" :key="item.Value" :item-data="item" :facet-data="facetData" />
            </ul>
        </div>
    </li>
</template>

<script lang="js">
    import CheckmarkSvg from '../../svg/CheckmarkSvg';
    import PlusCircleSvg from '../../svg/PlusCircleSvg';
    import DashCircleSvg from '../../svg/DashCircleSvg';

    export default {
        name: 'nested-item',
        props: ['facetData', 'itemData'],
        components: {
            CheckmarkSvg,
            PlusCircleSvg,
            DashCircleSvg
        },
        mounted() {
            this.isExpanded = this.isExpandable(this.itemData);
        },
        data() {
            return {
                isExpanded: false
            }
        },
        methods: {
            toggleExpanded: function () {
                this.isExpanded = !this.isExpanded;
            },
            selectFacet: function (value) {
                this.$parent.clearInlineSelections(value);

                if (value.Negated) {
                    value.Selected = true;
                    value.Negated = false;
                }
                else {
                    value.Selected = !value.Selected;
                }

                this.applyFacets();
                this.isExpanded = true;
            },
            negateFacet: function (value) {
                this.$parent.clearSelections(value);

                value.Negated = !value.Negated;
                value.Selected = value.Negated;
                this.applyFacets();
            },
            clearSelections: function (value) {
                this.$parent.clearSelections(value);
            },
            clearInlineSelections: function (value) {
                this.$parent.clearInlineSelections(value);
            },
            applyFacets: function () {
                console.log("this.facetData ==> ", this.facetData);
                this.$root.dispatchToStore('applyFacets', this.facetData);
            },
            isExpandable: function (itemData) {
                if (itemData.Selected) {
                    return true;
                } else if (itemData.Children && itemData.Children.length) {
                    return itemData.Children.some(item => this.isExpandable(item));
                }
                return false;
            }
        },
        computed: {
        }
    }
</script>
<style scoped lang="scss">
</style>
