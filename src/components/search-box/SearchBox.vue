<template>
    <div class="hawk__searchBox">
        <div class="hawk__searchBox__searchInput">
            <input type="text" :placeholder="$t('Enter a search term')" v-model="keyword" @input="onInput" @keydown="onKeyDown" @blur="onBlur" />
        </div>
        <search-suggestions></search-suggestions>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    import SearchSuggestions from "./SearchSuggestions";

    export default {
        name: 'search-box',
        props: ['indexName', 'searchPage'],
        components: {
            SearchSuggestions
        },
        mounted() {

        },
        data() {
            return {
                keyword: null,
                placeholder: 'Enter search term',
                suggestionDelay: null,
                loadingSuggestions: false
            }
        },
        methods: {
            onKeyDown: function (e) {
                if (e.key == 'Enter') {
                    this.cancelSuggestions();
                    this.handleIndexName();

                    if (this.searchPage && this.searchPage != location.pathname) {
                        HawksearchVue.redirectSearch(this.keyword, this.searchPage);
                    }
                    else {
                        this.$root.$store.dispatch('fetchResults', { Keyword: this.keyword, FacetSelections: {} });
                    }
                }
            },
            onInput: function (e) {
                let keyword = e.target.value;

                if (keyword) {
                    this.$root.$store.commit('updateLoadingSuggestions', true);
                    this.handleIndexName();

                    clearTimeout(this.suggestionDelay);
                    this.suggestionDelay = setTimeout(() => {
                        this.$root.$store.dispatch('fetchSuggestions', { Keyword: keyword });
                    }, 250);
                }
                else {
                    this.cancelSuggestions()
                }
            },
            onBlur: function () {
                this.keyword = null;
                this.cancelSuggestions();
            },
            cancelSuggestions: function () {
                clearTimeout(this.suggestionDelay);
                HawksearchVue.cancelSuggestionsRequest();
                this.$root.$store.commit('updateLoadingSuggestions', false);
                this.$root.$store.commit('updateSuggestions', null);
            },
            handleIndexName: function () {
                if (this.indexName && HawksearchVue.config.indexName != this.indexName) {
                    HawksearchVue.configure({ indexName: this.indexName });
                }
            }
        },
        computed: {
            ...mapState([
                'loadingResults',
                'loadingSuggestions'
            ])
        }
    }

</script>

<style scoped lang="scss">
</style>
