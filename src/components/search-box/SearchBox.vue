<template>
    <div class="hawk__searchBox" @click="onClick">
        <div class="hawk__searchBox__searchInput">
            <input type="text" :placeholder="$t('Enter a search term')" v-model="keyword" @input="onInput" @keydown="onKeyDown" @blur="onBlur" />
        </div>
        <search-suggestions :field-focused="fieldFocused"></search-suggestions>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import SearchSuggestions from "./SearchSuggestions";
    import CustomResultsLabel from "../results/tools/CustomResultsLabel";

    export default {
        name: 'search-box',
        props: ['indexName', 'searchPage', 'templateOverride'],
        components: {
            SearchSuggestions,
            CustomResultsLabel
        },
        mounted() {
            this.$root.$on('selectAutocorrectSuggestion', (selectedSuggestion) => {
                this.keyword = selectedSuggestion;
                this.search();
            })
        },
        data() {
            return {
                keyword: null,
                keywordEnter: null,
                placeholder: 'Enter search term',
                suggestionDelay: null,
                fieldFocused: false
            }
        },
        methods: {
            search: function () {
                this.cancelSuggestions();

                var searchBoxConfig = this.$root.config.searchBoxConfig;

                if (this.searchPage && (this.searchPage != location.pathname || searchBoxConfig.redirectToCurrentPage)) {
                    HawksearchVue.redirectSearch(this.keyword, this.$root, this.searchPage);
                }
                else if (this.keyword || searchBoxConfig.reloadOnEmpty) {
                    this.keywordEnter = this.keyword;
                    var store = this.$root.$store;
                    var facetSelections = {};

                    if (this.$root.config.tabConfig.alwaysOn) {
                        facetSelections = _.pickBy(store.state.pendingSearch.FacetSelections, (value, field) => field == HawksearchVue.getTabField(store));
                    }

                    this.$root.dispatchToStore('fetchResults', {
                        Keyword: this.keyword || "",
                        FacetSelections: facetSelections,
                        PageNo: 1
                    });
                }
            },
            onKeyDown: function (e) {
                if (e.key == 'Enter') {
                    this.search();
                    e.stopPropagation();
                    e.preventDefault();
                }
            },
            onInput: function (e) {
                let keyword = e.target.value;

                if (keyword) {
                    this.fieldFocused = true;

                    this.$root.$store.commit('updateLoadingSuggestions', true);

                    clearTimeout(this.suggestionDelay);
                    this.suggestionDelay = setTimeout(() => {
                        this.$root.dispatchToStore('fetchSuggestions', { Keyword: keyword });
                    }, 250);
                }
                else {
                    this.cancelSuggestions()
                }
            },
            onBlur: function () {
                setTimeout(() => {
                    if (!this.suggestionClick) {
                        this.fieldFocused = false;
                        this.keyword = this.keywordEnter;
                        this.cancelSuggestions();
                    }
                }, 250);
            },
            onClick: function (e) {
                e.stopPropagation();
                e.preventDefault();
            },
            cancelSuggestions: function () {
                clearTimeout(this.suggestionDelay);
                HawksearchVue.cancelSuggestionsRequest();
                this.$root.$store.commit('updateLoadingSuggestions', false);
                this.$root.$store.commit('updateSuggestions', null);
            }
        },
        computed: {
            ...mapState([
                'loadingResults',
                'searchOutput'
            ])
        },
        watch: {
            searchOutput(newValue, oldValue) {
                if (newValue.Keyword && newValue.Keyword.length) {
                    this.keyword = newValue.Keyword;
                }
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
