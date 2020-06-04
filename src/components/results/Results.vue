<template>
    <div class="hawk-results">
        <template v-if="searchError">
            <span>{{ $t('response_error_generic') }}</span>
        </template>
        <template v-else-if="searchOutput && searchOutput.Results && searchOutput.Results.length == 0">
            <span>{{ $t('No Results') }}</span>
        </template>
        <template v-else>
            <search-results-label />
            <!--<selections />-->

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

<script lang="js">
    import { mapState } from 'vuex';
    import SearchResultsLabel from '../facets/SearchResultsLabel'
    //import Selections from 'src/components/facets/Selections'
    import ToolRow from './ToolRow'
    import ResultListing from './ResultListing'

    export default {
        name: 'results',
        props: [],
        components: {
            SearchResultsLabel,
            //Selections,
            ToolRow,
            ResultListing
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {
            ...mapState([
                'searchOutput',
                'searchError'
            ])
        }
    }


</script>

<style scoped lang="scss">
</style>
