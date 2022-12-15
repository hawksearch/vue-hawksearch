<template>
    <div :class="'hawk-results__listing ' + listingTypeClass">
        <template v-if="loadingResults">
            <spinner></spinner>
        </template>

        <template v-if="results && results.length">
            <result-item v-for="result in results" :key="result.DocId" :result="result"></result-item>
        </template>
        <template v-else>
            <placeholder-item v-for="index in 12" :key="index"></placeholder-item>
        </template>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex'
    import ResultItem from './ResultItem'
    import PlaceholderItem from './PlaceholderItem'
    import Spinner from './Spinner'
    import { snakeCase } from "snake-case";

    export default {
        name: 'result-listing',
        props: ['type'],
        components: {
            ResultItem,
            PlaceholderItem,
            Spinner
        },
        mounted() {

        },
        data() {
            return {}
        },
        methods: {

        },
        computed: {
            ...mapState([
                'searchOutput',
                'loadingResults'
            ]),
            results: function () {
                return this.searchOutput ? this.searchOutput.Results : null;
            },
            listingTypeClass: function () {
                if (this.type) {
                    return 'hawk-results__listing_type__' + snakeCase(this.type);
                }
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
