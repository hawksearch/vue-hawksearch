<template>
    <div>
        <template v-if="results && results.length && title">
            <div class="recommendations-title">
                <h4>{{title}}</h4>
            </div>
        </template>
        
        <template>
            <div class="recommendations-container">
                <template v-if="loadingRecommendations">
                    <spinner></spinner>
                </template>

                <template v-if="results && results.length">
                    <recommendations-item class="recommendations-item" v-for="result in results" :key="result.id" :result="result" :requestId="requestId"></recommendations-item>
                </template>
            </div>
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
            widgetUniqueid: {
                default: null
            }
        },
        mounted() {
            this.$root.$store.dispatch('fetchRecommendations', {widgetGuid: this.widgetGuid, widgetUniqueid: this.widgetUniqueid})
                .then(response => {
                    this.loadingRecommendations = false;
                    this.requestId = response ? response.requestId : null;
                    this.title = response && response.widgetItems[0] ? response.widgetItems[0].widgeTitle : null;
                    this.results = response && response.widgetItems[0] ? response.widgetItems[0].recommendationItems : null;
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