<template>
    <div class="hawk-autocorrect-suggestion-container" v-if="searchOutput && searchOutput.DidYouMean && searchOutput.DidYouMean.length !== 0">
        <ul class="hawk-autocorrect-suggestion">
            <h3>Did you mean?</h3>
            <li v-for="autocorrectSuggestion in autocorrectSuggestions" :key="autocorrectSuggestion.key"
                v-on:click="selectSuggestion(autocorrectSuggestion)">
                {{autocorrectSuggestion}}
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import { getRecentSearch, setRecentSearch,} from "../../CookieHandler";

    export default {
        name: 'autocorrect-suggestions',
        methods: {
            selectSuggestion: function(selectedSuggestion) {
                this.search(selectedSuggestion);
            },
            search: function (keyword) {
                let searchBoxConfig = this.$root.config.searchBoxConfig;
                let searchPage = this.searchPage || location.pathname;

                this.updateRecentSearch(keyword);

                if (searchBoxConfig.redirectToCurrentPage || (this.searchPage && this.searchPage != location.pathname)) {
                    HawksearchVue.redirectSearch(keyword, this.$root, searchPage, false);
                }
                else if (keyword || searchBoxConfig.reloadOnEmpty) {
                    this.keywordEnter = keyword;
                    this.$root.dispatchToStore('fetchResults', { Keyword: keyword || "", FacetSelections: {}, PageNo: 1 })
                        .then(() => {
                            var widget = this.$root;
                            HawksearchVue.applyTabSelection(widget);
                        });
                }
            },
            updateRecentSearch: function (keyword) {
                setRecentSearch(keyword);
                this.$root.$store.commit("updateRecentSearch", getRecentSearch());
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            results: function () {
                return this.searchOutput ? this.searchOutput.Results : null;
            },
            autocorrectSuggestions: function () {
                return this.searchOutput ? this.searchOutput.DidYouMean : null;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
