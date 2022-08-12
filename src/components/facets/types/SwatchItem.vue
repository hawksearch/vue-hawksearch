<template>
    <li :class="listItemClass">
        <button @click="selectFacet" class="hawk-facet-rail__facet-btn hawk-styleSwatch">
            <span class="hawk-selectionInner">
                <template v-if="item.Color">
                    <span class="hawk-swatchColor" :style="colorStyle" :title="item.Value" />
                </template>
                <template v-else>
                    <img :src="url" :alt="item.Value" />
                </template>
            </span>
        </button>
        <button class="hawk-negativeIcon">
            <i class="hawkIcon-blocked" @click="negateFacet" />
        </button>
    </li>
</template>

<script>

    export default {
        name: 'swatch-item',
        props: ['facetData', 'item'],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            selectFacet: function () {
                this.$parent.clearSelections(this.item);

                if (this.item.Negated) {
                    this.item.Selected = true;
                    this.item.Negated = false;
                }
                else {
                    this.item.Selected = !this.item.Selected;
                }

                this.applyFacets();
            },
            negateFacet: function () {
                this.$parent.clearSelections(this.item);

                this.item.Negated = !this.item.Negated;
                this.item.Selected = this.item.Negated;
                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.dispatchToStore('applyFacets', this.facetData);
            }
        },
        computed: {
            listItemClass: function () {
                return 'hawk-facet-rail__facet-list-item' + (this.item.Selected ? ' hawkFacet-active' : '') + (this.item.Negated ? ' hawkFacet-negative' : '');
            },
            colorStyle: function () {
                return 'background: ' + this.item.Color;
            },
            url: function () {
                return this.$root.config.dashboardUrl + (!this.item.AssetUrl ? this.item.AssetName : this.item.AssetUrl);
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
