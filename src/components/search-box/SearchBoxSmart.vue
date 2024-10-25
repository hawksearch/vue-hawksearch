<template>
    <div class="hawk__searchBox" @click.stop="">
        <SearchBoxImage
            :visible="imageSearchVisible"
            @update:visible="imageSearchVisible = $event"
        />

        <div class="hawk__searchFull smart-search">
            <span class="hawk__line search-input">
                <search-icon-svg/>
                <input type="text" :placeholder="$t(placeholder)" v-model="keyword" @input="onFullSearchInput"
                       @keydown="onFullSearchKeyDown" @blur="onFullSearchBlur"/>
                <button @click="toggleRequestType">{{ toggleButtonText }}</button>
            </span>
            <button class="image-search-btn" @click="toggleImageSearch">
                <image-search-icon-svg/>
            </button>
        </div>

        <search-suggestions :field-focused="fieldFocused" :keyword="keyword"></search-suggestions>
    </div>
</template>

<script>
import {mapState} from 'vuex'
import SearchIconSvg from "../svg/SearchIconSvg";
import ImageSearchIconSvg from "../svg/ImageSearchIconSvg";
import SearchSuggestions from "./SearchSuggestions";
import CustomResultsLabel from "../results/tools/CustomResultsLabel";
import SearchBoxImage from "./SearchBoxImage";
import {getRecentSearch, setRecentSearch} from '../../CookieHandler';

export default {
    name: 'search-box-smart',
    props: ['indexName', 'searchPage', 'templateOverride'],
    components: {
        SearchSuggestions,
        CustomResultsLabel,
        SearchBoxImage,
        SearchIconSvg,
        ImageSearchIconSvg
    },
    mounted() {
        this.$root.$on('selectAutocorrectSuggestion', (selectedSuggestion) => {
            this.keyword = selectedSuggestion;
            this.searchFull();
        })
    },
    data() {
        return {
            keyword: null,
            keywordEnter: null,
            placeholder: 'Search with Keywords',
            suggestionDelay: null,
            fieldFocused: false,
            imageSearchVisible: false,
            requestType: 'DefaultSearch',
            toggleButtonText: 'or Concepts'
        }
    },
    methods: {
        searchKeyword(options = {}) {
            this.cancelSuggestions();

            let searchBoxConfig = this.$root.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;

            this.updateRecentSearch();

            if (searchBoxConfig.redirectToCurrentPage || (this.searchPage && this.searchPage !== location.pathname)) {
                HawksearchVue.redirectSearch(this.keyword, this.$root, searchPage, options.ignoreRedirectRules);
            } else if (this.keyword || searchBoxConfig.reloadOnEmpty) {
                this.keywordEnter = this.keyword;
                this.$root.dispatchToStore('fetchResults', {
                    Keyword: this.keyword || "",
                    FacetSelections: {},
                    PageNo: 1,
                    RequestType: this.requestType
                }).then(() => {
                    HawksearchVue.applyTabSelection(this.$root);
                });
            }
        },
        searchFull(options = {}) {
            this.cancelSuggestions();

            let searchBoxConfig = this.$root.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;

            this.updateRecentSearch();

            if (searchBoxConfig.redirectToCurrentPage || (this.searchPage && this.searchPage !== location.pathname)) {
                HawksearchVue.redirectSearch(this.keyword, this.$root, searchPage, options.ignoreRedirectRules);
            } else if (this.keyword || searchBoxConfig.reloadOnEmpty) {
                this.keywordEnter = this.keyword;
                this.$root.dispatchToStore('fetchResults', {
                    Keyword: this.keyword || "",
                    FacetSelections: {},
                    PageNo: 1,
                    RequestType: this.requestType
                }).then(() => {
                    HawksearchVue.applyTabSelection(this.$root);
                });
            }
        },
        updateRecentSearch() {
            setRecentSearch(this.keyword);
            this.$root.$store.commit("updateRecentSearch", getRecentSearch());
        },
        onKeywordKeyDown(e) {
            if (e.key === 'Enter') {
                this.searchKeyword();
                e.stopPropagation();
                e.preventDefault();
            }
        },
        onFullSearchKeyDown(e) {
            if (e.key === 'Enter') {
                this.searchFull();
                e.stopPropagation();
                e.preventDefault();
            }
        },
        onKeywordInput(e) {
            const keyword = e.target.value;

            if (keyword) {
                this.fieldFocused = true;
                this.$root.$store.commit('updateLoadingSuggestions', true);

                clearTimeout(this.suggestionDelay);
                this.suggestionDelay = setTimeout(() => {
                    this.$root.dispatchToStore('fetchSuggestions', {Keyword: keyword});
                }, 250);
            } else {
                this.cancelSuggestions();
            }
        },
        onFullSearchInput(e) {
            const keyword = e.target.value;

            if (keyword) {
                this.fieldFocused = true;
                this.$root.$store.commit('updateLoadingSuggestions', true);

                clearTimeout(this.suggestionDelay);
                this.suggestionDelay = setTimeout(() => {
                    this.$root.dispatchToStore('fetchSuggestions', {Keyword: keyword});
                }, 250);
            } else {
                this.cancelSuggestions();
            }
        },
        onKeywordBlur() {
            setTimeout(() => {
                if (!this.suggestionClick) {
                    this.fieldFocused = false;
                    this.keyword = this.keywordEnter;
                    this.cancelSuggestions();
                }
            }, 250);
        },
        onFullSearchBlur() {
            setTimeout(() => {
                if (!this.suggestionClick) {
                    this.fieldFocused = false;
                    this.keyword = this.keywordEnter;
                    this.cancelSuggestions();
                }
            }, 250);
        },
        onClick(e) {
            e.stopPropagation();
        },
        cancelSuggestions() {
            clearTimeout(this.suggestionDelay);
            HawksearchVue.cancelSuggestionsRequest();
            this.$root.$store.commit('updateLoadingSuggestions', false);
            this.$root.$store.commit('updateSuggestions', null);
        },
        toggleImageSearch() {
            this.imageSearchVisible = !this.imageSearchVisible;
            if (!this.imageSearchVisible) {
                this.$refs.searchBoxImage?.clearImageData();
            }
        },
        toggleRequestType() {
            if (this.requestType === 'DefaultSearch') {
                this.requestType = 'ConceptSearch';
                this.toggleButtonText = 'or Keywords';
                this.placeholder = 'Search with Concepts';
            } else {
                this.requestType = 'DefaultSearch';
                this.toggleButtonText = 'or Concepts';
                this.placeholder = 'Search with Keywords';
            }
            if (this.keyword) {
                this.searchFull();
            }
        }
    },
    computed: {
        ...mapState([
            'loadingResults',
            'searchOutput'
        ])
    },
    watch: {
        searchOutput(newValue) {
            if (newValue && newValue.Keyword && newValue.Keyword.length) {
                this.keyword = newValue.Keyword;
            }
        }
    }
}
</script>

<style scoped lang="scss"></style>
