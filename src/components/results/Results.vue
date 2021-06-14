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
    import SearchResultsLabel from '../facets/SearchResultsLabel'
    import Selections from '../facets/Selections'
    import ToolRow from './ToolRow'
    import ResultListing from './ResultListing'
    import PageContent from './PageContent'
    import Banner from './Banner'
    import Tabs from './Tabs'
    import Recommendations from './recommendations/Recommendations'
    import AutocorrectSuggestions from './AutocorrectSuggestions'

    export default {
        name: 'results',
        props: [],
        components: {
            SearchResultsLabel,
            Selections,
            ToolRow,
            ResultListing,
            PageContent,
            Banner,
            Tabs,
            Recommendations,
            AutocorrectSuggestions
        },
        mounted() {
            var widget = this.$root;

            if (widget.config.searchConfig.initialSearch) {
                HawksearchVue.initialSearch(widget);
            }
        },
        data() {
            return {

            }
        },
        methods: {
            onClick: function (e) {
                e.stopPropagation();
            },
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
