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
        props: {
            widgetGuid: {
                default: null
            },
            uniqueid: {
                default: null
            }
        },
        mounted() {
            this.$root.$store.dispatch('fetchRecommendations')
                .then(response => {
                    this.loadingRecommendations = false;
                    this.requestId = response ? response.requestId : null;
                    this.title = response ? response.widgetItems[0].widgeTitle : null;
                    this.results = response ? response.widgetItems[0].recommendationItems : null;
                }, error => { })
        },
        data() {
            return {
                loadingRecommendations: true,
                results: null,
                title: null,
                requestId: null
            }
        },
        methods: {

        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
