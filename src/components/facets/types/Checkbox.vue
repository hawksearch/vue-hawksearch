<template>
    <div class="hawk-facet-rail__facet-values">
        <div :class="facetValuesWrapperClass()" :style="facetValuesWrapperStyle()" >
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

                        <span :class="value.Negated ? 'hawk-selections__item-name--negated' : 'hawk-facet-rail__facet-name' ">
                            {{ htmlEntityDecode(value.Label) }} ({{ value.Count }})
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

<script>
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
                this.$root.dispatchToStore('applyFacets', this.facetData).then(() => {
                    var widget = this.$root;

                    HawksearchVue.applyTabSelection(widget);
                });
            },
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
            },
            getAssetUrl: function (value) {
                if (value && value.AssetFullUrl) {
                    return this.$root.config.dashboardUrl + value.AssetFullUrl;
                }
            },
            facetValuesWrapperClass: function () {
                let wrapperClasses = ["hawk-facet-rail__facet-values-checkbox"];

                if (this.shouldScroll) {
                    wrapperClasses.push("hawk-facet-rail__facet-values-checkbox__scrollable");
                }

                return wrapperClasses.join(' ');
            },
            facetValuesWrapperStyle: function () {
                let styles = {};

                if (this.shouldScroll) {
                    let scrollHeight = this.facetData.ScrollHeight;

                    if (!scrollHeight || scrollHeight < 20) {
                        scrollHeight = 300;
                    }

                    styles = { height: scrollHeight + 'px' };
                }

                return styles;
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        },
        computed: {
            items: function () {
                return this.facetData.Values;
            },
            shouldScroll: function () {
                // the facet does truncated listing of values if configured for truncating and we have too many facets
                return this.facetData.DisplayType === 'scrolling' && this.facetData.Values.length > this.facetData.ScrollThreshold;
            }
        }
    }
</script>

<style scoped lang="scss">
    .line-through {
        text-decoration: line-through;
    }

    .hawk-facet-rail__facet-values-checkbox__scrollable {
        overflow-y: scroll;
        padding-right: 10px;
    }
</style>
