<template>
    <li class="hawk-facet-rail__facet-list-item hawkFacet-group">
        <div class="hawkFacet-group__inline">
            <button @click="selectFacet" class="hawk-facet-rail__facet-btn">
                <span :class="facetLabelClass">
                    {{ htmlEntityDecode(itemData.Label) }} ({{ itemData.Count }})
                </span>
            </button>
            <button v-if="itemData.Children && itemData.Children.length" :class="isExpanded ? 'hawk-collapseState hawk-linklist' : 'hawk-collapseState hawk-linklist collapsed'" aria-expanded="false" @click="toggleExpanded">
            </button>
        </div>
        <div v-if="isExpanded && itemData.Children" class="hawk-facet-rail__w-100">
            <ul class="hawkFacet-group-inside">
                <nested-link-item
                    v-for="item in itemData.Children"
                    :key="item.Value"
                    :item-data="item"
                    @select-facet-value="selectNestedFacet"
                />
            </ul>
        </div>
    </li>
</template>

<script>
    export default {
        name: 'nested-link-item',
        props: ['itemData'],
        emits: ['selectFacetValue'],
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
            },
            selectNestedFacet: function (facetValue) {
                this.$emit('selectFacetValue', facetValue);
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        },
        computed: {
            facetLabelClass: function () {
                let classList = ['hawk-facet-rail__facet-name'];
                if (this.itemData.Selected) {
                    classList.push('checked');
                }

                return classList.join(' ');
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
