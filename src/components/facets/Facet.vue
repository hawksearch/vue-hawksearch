<template>
    <div>
        <template v-if="componentName">
            <div class="hawk-facet-rail__facet" @click="onClick" @keydown="onKeyDown">
                <div class="hawk-facet-rail__facet-heading" @click="toggleCollapse">
                    <h4>{{ facetData.Name }}</h4>
                    <div v-if="facetData.Tooltip" class="custom-tooltip">
                        <questionmark-svg class="hawk-questionmark" />
                        <div class="right">
                            <div v-html="facetData.Tooltip"></div>
                            <i />
                        </div>
                    </div>
                    <template v-if="isCollapsed">
                        <plus-svg />
                    </template>
                    <template v-else>
                        <minus-svg />
                    </template>
                </div>
                <div v-if="!isCollapsed" class="hawk-facet-rail__facet-body">
                    <div v-if="shouldSearch" class="hawk-facet-rail__facet__quick-lookup">
                        <input v-model="filter" @input="setFilter" type="text" :placeholder="$t('Quick Lookup')" />
                    </div>
                    <template v-if="filteredData">
                        <component :is="componentName" :facet-data="filteredData">
                            <button v-if="truncateVisible" @click="toggleTruncate" class="hawk-facet-rail__show-more-btn">
                                <template v-if="isTruncated">
                                    (+) Show {{ remainingFacets }} More
                                </template>
                                <template v-else>
                                    (-) Show Less
                                </template>
                            </button>
                        </component>
                    </template>
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

<script>
    import QuestionmarkSvg from '../svg/QuestionmarkSvg';
    import PlusSvg from '../svg/PlusSvg';
    import MinusSvg from '../svg/MinusSvg';

    // facet types
    import Checkbox from './types/Checkbox';
    import FacetLink from './types/FacetLink';
    import NestedCheckbox from './types/NestedCheckbox';
    import Search from './types/Search';
    import OpenRange from './types/OpenRange';
    import Swatch from './types/Swatch';
    import Slider from './types/Slider';

    export default {
        name: 'facet',
        props: ['facetData'],
        components: {
            QuestionmarkSvg,
            PlusSvg,
            MinusSvg,
            Checkbox,
            FacetLink,
            NestedCheckbox,
            Search,
            OpenRange,
            Swatch,
            Slider
        },
        created: function () {
            this.setFilter();
            this.setCollapsed();
        },
        data() {
            return {
                isCollapsed: false,
                filter: null,
                filteredData: null,
                isTruncated: true
            }
        },
        methods: {
            onClick: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            onKeyDown: function (e) {
                if (e.key == 'Enter') {
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            toggleCollapse: function () {
                this.isCollapsed = !this.isCollapsed;

                if (this.isPersistent()) {
                    sessionStorage.setItem(this.getStorageName(), this.isCollapsed)
                }

                if (!this.isCollapsed) {
                    this.$emit('expand', this);
                }
                else {
                    this.$emit('collapse', this);
                }
            },
            setFilter: function () {
                if (this.filteredData && this.filter) {
                    this.filteredData.Values = this.facetData.Values.filter(item => this.valueIncludesString(item.Label, this.filter) || this.valueIncludesString(item.Value, this.filter));
                }
                else {
                    let facetData = Object.assign({}, this.facetData);

                    if (this.isTruncated && this.shouldTruncate) {
                        facetData.Values = facetData.Values.slice(0, facetData.TruncateThreshold);
                    }

                    this.filteredData = facetData;
                }
            },
            valueIncludesString: function (value, str) {
                return value.toLowerCase().includes(str.toLowerCase());
            },
            toggleTruncate: function () {
                this.isTruncated = !this.isTruncated;
                this.setFilter();
            },
            setCollapsed: function () {
                this.isCollapsed = this.facetData.IsCollapsedDefault;

                try {
                    if (this.isPersistent() && sessionStorage.getItem(this.getStorageName())) {
                        this.isCollapsed = JSON.parse(sessionStorage.getItem(this.getStorageName()))
                    }
                }
                catch (e) { }
            },
            getStorageName: function () {
                let facetName = HawksearchVue.getFacetParamName(this.facetData)
                let pathName = location.pathname.replaceAll('/', '_')

                return 'hs_facet_' + pathName + '_' + facetName
            },
            isPersistent: function () {
                if (this.$root.config.facetConfig.hasOwnProperty('_persist') && this.$root.config.facetConfig['_persist'] == false) {
                    return false;
                }
                else {
                    return true;
                }
            }
        },
        watch: {
            facetData: {
                handler(newValue, oldValue) {
                    this.setFilter();
                },
                deep: true
            }
        },
        computed: {
            shouldSearch: function () {
                return this.facetData.IsSearch && this.facetData.Values.length > this.facetData.SearchThreshold;
            },
            shouldTruncate: function () {
                return this.facetData.DisplayType === 'truncating' && this.facetData.Values.length > this.facetData.TruncateThreshold;
            },
            componentName: function () {
                switch (this.facetData.FacetType) {
                    case "checkbox":
                        return "checkbox";
                        break;

                    case "link":
                        return "facet-link";
                        break;

                    case "nestedcheckbox":
                        return "nested-checkbox";
                        break;

                    case "search":
                        return "search";
                        break;

                    case "slider":
                        return "slider";
                        break;

                    case "swatch":
                        return "swatch";
                        break;

                    case "openRange":
                        return "open-range";
                        break;

                    default:
                        return false;
                        break;
                }
            },
            remainingFacets: function () {
                return this.facetData.Values.length - this.filteredData.Values.length;
            },
            truncateVisible: function () {
                return this.shouldTruncate && !this.filter;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
