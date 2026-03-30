<template>
    <li class="hawk-facet-rail__facet-list-item hawkFacet-group">
        <div class="hawkFacet-group__inline">
            <button @click="selectFacet" class="hawk-facet-rail__facet-btn" >
                <span :class="checkboxClass" >
                    <template v-if="itemData.Selected">
                        <checkmark-svg class="hawk-facet-rail__facet-checkbox-icon" />
                    </template>
                </span>
                <span :class="facetLabelClass">
                    {{ htmlEntityDecode(itemData.Label) }} ({{ itemData.Count }})
                </span>
            </button>
            <button @click="negateFacet" class="hawk-facet-rail__facet-btn-exclude">
                <template v-if="itemData.Negated">
                    <plus-circle-svg class="hawk-facet-rail__facet-btn-include" />
                </template>
                <template v-else>
                    <dash-circle-svg />
                </template>
            </button>
            <button
                v-if="itemData.Children && itemData.Children.length"
                :class="nestedCollpaseStateClass"
                aria-expanded="false"
                @click="toggleExpanded"
            />
        </div>
        <div v-if="isExpanded && itemData.Children" class="hawk-facet-rail__w-100">
            <ul class="hawkFacet-group-inside">
                <nested-item
                    v-for="item in itemData.Children"
                    :key="item.Value"
                    :item-data="item"
                    @select-facet-value="selectNestedFacet"
                    @negate-facet-value="negateNestedFacet"
                />
            </ul>
        </div>
    </li>
</template>

<script>
    import CheckmarkSvg from '../../svg/CheckmarkSvg.vue';
    import PlusCircleSvg from '../../svg/PlusCircleSvg.vue';
    import DashCircleSvg from '../../svg/DashCircleSvg.vue';

    export default {
        name: 'nested-item',
        props: ['itemData'],
        emits: ['selectFacetValue', 'negateFacetValue'],
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
            selectFacet: function () {
                this.$emit('selectFacetValue', this.itemData);
                this.isExpanded = true;
            },
            negateFacet: function () {
                this.$emit('negateFacetValue', this.itemData);
            },
            selectNestedFacet: function (facetValue) {
                this.$emit('selectFacetValue', facetValue);
            },
            negateNestedFacet: function (facetValue) {
                this.$emit('negateFacetValue', facetValue);
            },
            isExpandable: function (itemData) {
                if (itemData.Selected) {
                    return true;
                } else if (itemData.Children && itemData.Children.length) {
                    return itemData.Children.some(item => this.isExpandable(item));
                }
                return false;
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        },
        computed: {
            checkboxClass: function () {
                return this.itemData.Selected
                    ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked'
                    : 'hawk-facet-rail__facet-checkbox';
            },
            facetLabelClass: function () {
                return this.itemData.Negated
                    ? 'hawk-selections__item-name--negated'
                    : 'hawk-facet-rail__facet-name';
            },
            nestedCollpaseStateClass: function () {
                return this.isExpanded
                    ? 'hawk-collapseState'
                    : 'hawk-collapseState collapsed';
            }
        }
    }
</script>
<style scoped lang="scss">
</style>
