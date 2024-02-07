<template>
    <li class="hawk-facet-rail__facet-list-item hawkFacet-group">
        <div class="hawkFacet-group__inline">
            <button @click="selectFacet(itemData)" class="hawk-facet-rail__facet-btn">
                <span :class="'hawk-facet-rail__facet-name' + (itemData.Negated ? ' hawk-selections__item-name--negated' : '') + (itemData.Selected ? ' checked' : '') ">
                    {{ htmlEntityDecode(itemData.Label) }} ({{ itemData.Count }})
                </span>
            </button>
            <button v-if="itemData.Children && itemData.Children.length" :class="isExpanded ? 'hawk-collapseState hawk-linklist' : 'hawk-collapseState hawk-linklist collapsed'" aria-expanded="false" @click="toggleExpanded">
            </button>
        </div>
        <div v-if="isExpanded && itemData.Children" class="hawk-facet-rail__w-100">
            <ul class="hawkFacet-group-inside">
                <nested-link-item v-for="item in itemData.Children" :key="item.Value" :item-data="item" :facet-data="facetData" />
            </ul>
        </div>
    </li>
</template>

<script lang="js">

    export default {
        name: 'nested-link-item',
        props: ['facetData', 'itemData'],
        components: {
        },
        mounted() {

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
                this.$parent.clearSelections(value);

                if (value.Negated) {
                    value.Selected = true;
                    value.Negated = false;
                }
                else {
                    value.Selected = !value.Selected;
                }

                this.applyFacets();
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
            applyFacets: function () {
                this.$root.dispatchToStore('applyFacets', this.facetData);
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        },
        computed: {
        }
    }
</script>
<style scoped lang="scss">
</style>
