<template lang="html">
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-checkbox">
            <ul class="hawk-facet-rail__facet-list">
                <li v-for="value in items" :key="value.Value" class="hawk-facet-rail__facet-list-item">
                    <button @click="selectFacet(value)" class="hawk-facet-rail__facet-btn">
                        <span :class="value.Selected ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked' : 'hawk-facet-rail__facet-checkbox'">
                            <checkmark-svg v-if="value.Selected" class="hawk-facet-rail__facet-checkbox-icon" />
                        </span>

                        <span v-if="rangeValueAssetUrl" class="hawk-selectionInner">
                            <span class="hawk-range-asset" :title="value.Label" />

                            <img :src="rangeValueAssetUrl" :alt="value.Label"  />
                        </span>

                        <span :class="value.Negated ? 'hawk-facet-rail__facet-name line-through' : 'hawk-facet-rail__facet-name' ">
                            {{ value.Label }} ({{ value.Count }})
                        </span>
                    </button>

                    <button @click="negateFacet(value)" class="hawk-facet-rail__facet-btn-exclude">
                        <template v-if="value.Negated">
                            <plus-circle-svg class="hawk-facet-rail__facet-btn-include" />
                            <span class="visually-hidden">Include facet</span>
                        </template>
                        <template v-else>
                            <dash-circle-svg />
                            <span class="visually-hidden">Exclude facet</span>
                        </template>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="js">
    import CheckmarkSvg from 'src/components/svg/CheckmarkSvg';
    import PlusCircleSvg from 'src/components/svg/PlusCircleSvg';
    import DashCircleSvg from 'src/components/svg/DashCircleSvg';

    export default {
        name: 'checkbox',
        props: ['facetData'],
        components: {
            CheckmarkSvg,
            PlusCircleSvg,
            DashCircleSvg
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            selectFacet: function (value) {
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
                value.Negated = !value.Negated;
                value.Selected = value.Negated;
                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.$store.dispatch('applyFacets', this.facetData);
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
    .line-through {
        text-decoration: line-through;
    }
</style>
