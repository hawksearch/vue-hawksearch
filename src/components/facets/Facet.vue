<template lang="html">
    <div>
        <template v-if="componentName">
            <div class="hawk-facet-rail__facet">
                <div class="hawk-facet-rail__facet-heading" @click="toggleCollapse">
                    <h4>{{ facetData.Name }}</h4>
                    <!--<div v-if="facetData.Tooltip" class="custom-tooltip">
                        <questionmark-svg class="hawk-questionmark" />
                        <div class="right">
                            <div>
                                {{ facetData.Tooltip }}
                            </div>
                            <i />
                        </div>
                    </div>-->
                    <template v-if="isCollapsed">
                        <plus-svg />
                        <span class="visually-hidden">Expand facet category</span>
                    </template>
                    <template v-else>
                        <minus-svg />
                        <span class="visually-hidden">Collapse facet category</span>
                    </template>
                </div>
                <div v-if="!isCollapsed" class="hawk-facet-rail__facet-body">
                    <!--<div v-if="shouldSearch" class="hawk-facet-rail__facet__quick-lookup">
                        <input :value="filter" @change="setFilter" type="text" placeholder="Quick Lookup" />
                    </div>-->
                    <component :is="componentName" :facet-data="facetData"></component>
                </div>
            </div>
        </template>
        <!--<template v-else>
            <div>
                {{ facetData.FieldType }} {{ facetData.FacetType }} is not implemented!
            </div>
        </template>-->
    </div>
</template>

<script lang="js">
    import QuestionmarkSvg from 'src/components/svg/QuestionmarkSvg';
    import PlusSvg from 'src/components/svg/PlusSvg';
    import MinusSvg from 'src/components/svg/MinusSvg';

    // facet types
    import Checkbox from './types/Checkbox';
    import NestedCheckbox from './types/NestedCheckbox';

    export default {
        name: 'facet',
        props: ['facetData'],
        components: {
            QuestionmarkSvg,
            PlusSvg,
            MinusSvg,
            Checkbox,
            NestedCheckbox
        },
        mounted() {

        },
        data() {
            return {
                isCollapsed: false,
                filter: null
            }
        },
        methods: {
            toggleCollapse: function () {
                this.isCollapsed = !this.isCollapsed;
            },
            setFilter: function () {
                console.log("Set filter");
            }
        },
        computed: {
            shouldSearch: function () {
                return this.facetData.IsSearch && this.facetData.Values.length > this.facetData.SearchThreshold;
            },
            componentName: function () {
                switch (this.facetData.FacetType) {
                    case "checkbox":
                        return "checkbox";
                        break;

                    //case "link":
                    //    return "link";
                    //    break;

                    //case "nestedcheckbox":
                    //    return "nested-checkbox";
                    //    break;

                    //case "nestedlinklist":
                    //    return "";
                    //    break;

                    //case "rating":
                    //    return "";
                    //    break;

                    //case "recentsearches":
                        //return "";
                        //break;

                    //case "related":
                    //    return "";
                    //    break;

                    //case "search":
                    //    return "search";
                    //    break;

                    //case "size":
                    //    return "";
                    //    break;

                    //case "slider":
                    //    return "slider";
                    //    break;

                    //case "swatch":
                    //    return "swatch";
                    //    break;

                    //case "openRange":
                    //    return "open-range";
                    //    break;

                    default:
                        return false;
                        break;
                }
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
