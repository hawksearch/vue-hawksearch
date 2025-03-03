<template>
    <div class="hawk-results" @click="onClick">
        <autocorrect-suggestions />

        <search-results-label />

        <banner></banner>

        <selections />

        <template v-if="searchError">
            <span>{{ $t('response_error_generic') }}</span>
        </template>
        <template v-else-if="results && results.length == 0">
            <span>{{ $t('No Results') }}</span>
        </template>
        <template v-else-if="!waitingForInitialSearch">
            <tabs></tabs>

            <div class="hawk-results__top-tool-row">
                <tool-row />
            </div>

            <result-listing />

            <div class="hawk-results__bottom-tool-row">
                <tool-row />
            </div>
        </template>

    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import SearchResultsLabel from '../facets/SearchResultsLabel.vue'
    import Selections from '../facets/Selections.vue'
    import ToolRow from './ToolRow.vue'
    import ResultListing from './ResultListing.vue'
    import PageContent from './PageContent.vue'
    import Banner from './Banner.vue'
    import Tabs from './Tabs.vue'
    import Recommendations from './recommendations/Recommendations.vue'
    import AutocorrectSuggestions from './AutocorrectSuggestions.vue'
    import ListingType from './tools/ListingType.vue'
    import Sorting from './tools/Sorting.vue'
    import Pagination from './tools/Pagination.vue'

    export default {
        name: 'results',
        components: {
            SearchResultsLabel,
            Selections,
            ToolRow,
            ResultListing,
            PageContent,
            Banner,
            Tabs,
            Recommendations,
            AutocorrectSuggestions,
            ListingType,
            Sorting,
            Pagination
        },
        mounted() {
            var widget = this.$root;

            if (widget.config.searchConfig.initialSearch) {
                HawksearchVue.initialSearch(widget);
            }
        },
        data() {
            return {
                listingType: 'grid'
            }
        },
        methods: {
            onClick: function (e) {
                if (e && e.stopPropagation) {
                    e.stopPropagation();
                }
            },
            onListingChange: function (type) {
                this.listingType = type;
            }
        },
        computed: {
            ...mapState([
                'searchOutput',
                'searchError',
                'waitingForInitialSearch'
            ]),
            ...mapGetters([
                'tabSelection'
            ]),
            results: function () {
                return this.searchOutput ? this.searchOutput.Results : null;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
