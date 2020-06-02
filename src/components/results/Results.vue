<template>
    <div class="hawk-results">
        <template v-if="searchOutput && searchOutput.Results && searchOutput.Results.length">
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
        <template v-else-if="searchError">
            <span>An error occurred while searching for your results. Please contact the site administrator.</span>
        </template>
        <template v-else>
            <span>{{ $t('No Results') }}</span>
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
