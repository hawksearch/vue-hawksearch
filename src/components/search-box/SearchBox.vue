<template>
    <div class="hawk__searchBox" @click="onClick">
        <div class="hawk__searchBox__searchInput">
            <input type="text" :placeholder="$t(placeholder)" v-model="keyword" @input="onInput" @keydown="onKeyDown" @blur="onBlur" />
        </div>
        <search-suggestions :field-focused="fieldFocused" :keyword="keyword" @view-all-matches="search" @mousedown.native="onSuggestionClick"></search-suggestions>
    </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import SearchSuggestions from "./SearchSuggestions.vue";
import CustomResultsLabel from "../results/tools/CustomResultsLabel.vue";

export default {
    name: 'search-box',
    props: ['indexName', 'searchPage', 'templateOverride'],
    components: {
        SearchSuggestions,
        CustomResultsLabel
    },
    computed: {
        ...mapState([
            'loadingResults',
            'searchOutput'
        ]),
        ...mapGetters([
            'config',
        ]),
    },
    data() {
        return {
            keyword: null,
            keywordEnter: null,
            placeholder: 'Enter a search term',
            suggestionDelay: null,
            fieldFocused: false,
            suggestionClick: false,
        }
    },
    methods: {
        ...mapActions(['updateRecentSearch']),
        search: function (options) {
            this.cancelSuggestions();

            options = options || {};

            let searchBoxConfig = this.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;

            this.updateRecentSearch(this.keyword);

            if (searchBoxConfig.redirectToCurrentPage || (this.searchPage && this.searchPage != location.pathname)) {
                HawksearchVue.redirectSearch(this.keyword, this.$root, searchPage, options?.ignoreRedirectRules);
            }
            else if (this.keyword || searchBoxConfig.reloadOnEmpty) {
                this.keywordEnter = this.keyword;
                this.$root.dispatchToStore('fetchResults', { Keyword: this.keyword || "", FacetSelections: {}, PageNo: 1 })
                    .then(() => {
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

                this.$store.commit('updateLoadingSuggestions', true);

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
                this.suggestionClick = false;
            }, 250);
        },
        onClick: function (e) {
            e.stopPropagation();
            // e.preventDefault();
        },
        cancelSuggestions: function () {
            clearTimeout(this.suggestionDelay);
            HawksearchVue.cancelSuggestionsRequest();
            this.$store.commit('updateLoadingSuggestions', false);
            this.$store.commit('updateSuggestions', null);
        },
        onSuggestionClick: function () {
            this.suggestionClick = true;
        },
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
