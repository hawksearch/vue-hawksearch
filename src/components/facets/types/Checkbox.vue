<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-checkbox">
            <ul class="hawk-facet-rail__facet-list">
                <li v-for="value in items" :key="value.Value" class="hawk-facet-rail__facet-list-item">
                    <button @click="selectFacet(value)" class="hawk-facet-rail__facet-btn">
                        <span :class="value.Selected ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked' : 'hawk-facet-rail__facet-checkbox'">
                            <checkmark-svg v-if="value.Selected" class="hawk-facet-rail__facet-checkbox-icon" />
                        </span>

                        <span v-if="value.AssetFullUrl" class="hawk-selectionInner">
                            <span class="hawk-range-asset" :title="value.Label" />

                            <img :src="getAssetUrl(value)" :alt="value.Label" />
                        </span>

                        <span :class="value.Negated ? 'hawk-facet-rail__facet-name line-through' : 'hawk-facet-rail__facet-name' ">
                            {{ value.Label }} ({{ value.Count }})
                        </span>
                    </button>

                    <button @click="negateFacet(value)" class="hawk-facet-rail__facet-btn-exclude">
                        <template v-if="value.Negated">
                            <plus-circle-svg class="hawk-facet-rail__facet-btn-include" />
                        </template>
                        <template v-else>
                            <dash-circle-svg />
                        </template>
                    </button>
                </li>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script lang="js">
    import CheckmarkSvg from '../../svg/CheckmarkSvg';
    import PlusCircleSvg from '../../svg/PlusCircleSvg';
    import DashCircleSvg from '../../svg/DashCircleSvg';

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
                this.clearSelections(value);

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
                this.clearSelections(value);

                value.Negated = !value.Negated;
                value.Selected = value.Negated;
                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.$store.dispatch('applyFacets', this.facetData);
            },
            clearSelections: function (exception) {
                if (this.getCheckboxType() == 'single') {
                    this.items = this.items.map(item => {
                        if (_.isEqual(item, exception)) {
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
            },
            getAssetUrl: function (value) {
                if (value && value.AssetFullUrl) {
                    return this.$root.config.dashboardUrl + value.AssetFullUrl;
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
    .line-through {
        text-decoration: line-through;
    }
</style>
