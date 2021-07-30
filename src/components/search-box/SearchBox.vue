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
            search: function (options) {
                this.cancelSuggestions();

                options = options || {};

                let searchBoxConfig = this.$root.config.searchBoxConfig;
                let searchPage = this.searchPage || location.pathname;
                
                if (searchBoxConfig.redirectToCurrentPage || (this.searchPage && this.searchPage != location.pathname)) {
                    HawksearchVue.redirectSearch(this.keyword, this.$root, searchPage, options.ignoreRedirectRules);
                }
                else if (this.keyword || searchBoxConfig.reloadOnEmpty) {
                    this.keywordEnter = this.keyword;
                    this.$root.dispatchToStore('fetchResults', { Keyword: this.keyword || "", FacetSelections: {}, PageNo: 1 }).then(() => {
                            var widget = this.$root;
                            HawksearchVue.applyTabSelection(widget);
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
                if (newValue && newValue.Keyword && newValue.Keyword.length) {
                    this.keyword = newValue.Keyword;
                }
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
