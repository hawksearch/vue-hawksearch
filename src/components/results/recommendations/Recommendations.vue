<template>
    <div class="hawk-results__listing">
        <template v-if="loadingRecommendations">
            <spinner></spinner>
        </template>

        <template v-if="results && results.length">
            <recommendations-item v-for="result in results" :key="result.id" :result="result" :requestId="requestId"></recommendations-item>
        </template>
        <template v-else>
            <placeholder-item v-for="index in 4" :key="index"></placeholder-item>
        </template>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex'

    import RecommendationsItem from './RecommendationsItem'
    import PlaceholderItem from '../PlaceholderItem'
    import Spinner from '../Spinner'

    export default {
        name: 'recommendations',
        props: [],
        components: {
            RecommendationsItem,
            PlaceholderItem,
            Spinner
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
                'recommendationsOutput',
                'loadingRecommendations'
            ]),
            results: function() {
                return this.recommendationsOutput ? this.recommendationsOutput.widgetItems[0].recommendationItems : null;
            },
            title: function() {
                return this.recommendationsOutput ? this.recommendationsOutput.widgetItems[0].widgeTitle : null;
            },
            requestId: function() {
                return this.recommendationsOutput ? this.recommendationsOutput.requestId : null;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
