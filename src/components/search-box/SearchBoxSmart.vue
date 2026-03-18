<template>
    <div class="hawk__searchBox" @click.stop="">
        <SearchBoxImage
            ref="searchBoxImage"
            :visible="imageSearchVisible"
            @update:visible="imageSearchVisible = $event"
        />

        <div class="hawk__searchFull smart-search">
            <span class="hawk__line search-input">
                <search-icon-svg/>
                <input type="text" :placeholder="$t(placeholder)" v-model="keyword" @input="onFullSearchInput"
                       @keydown="onFullSearchKeyDown" @blur="onFullSearchBlur"/>
                <button type="button" @click="toggleRequestType">{{ $t(toggleButtonText) }}</button>
            </span>
            <button
                type="button"
                class="image-search-btn"
                aria-label="Image search"
                :aria-expanded="imageSearchVisible ? 'true' : 'false'"
                @click="toggleImageSearch"
            >
                <image-search-icon-svg/>
            </button>
        </div>

        <search-suggestions :field-focused="fieldFocused" :keyword="keyword"></search-suggestions>
    </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';
import SearchIconSvg from "../svg/SearchIconSvg.vue";
import ImageSearchIconSvg from "../svg/ImageSearchIconSvg.vue";
import SearchSuggestions from "./SearchSuggestions.vue";
import CustomResultsLabel from "../results/tools/CustomResultsLabel.vue";
import SearchBoxImage from "./SearchBoxImage.vue";
import useEventBus from '@/composables/useEventBus';

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
    setup() {
        const {on, off} = useEventBus();

        return {on, off};
    },
    mounted() {
        this.selectAutocorrectSuggestionHandler = (selectedSuggestion) => {
            this.keyword = selectedSuggestion;
            this.searchFull();
        };
        this.on('selectAutocorrectSuggestion', this.selectAutocorrectSuggestionHandler);
    },
    data() {
        return {
            keyword: null,
            keywordEnter: null,
            suggestionDelay: null,
            fieldFocused: false,
            imageSearchVisible: false,
            requestType: 'DefaultSearch'
        }
    },
    methods: {
        ...mapActions(['updateRecentSearch']),
        searchKeyword(options = {}) {
            this.cancelSuggestions();

            let searchBoxConfig = this.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;

            this.updateRecentSearch(this.keyword);

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

            let searchBoxConfig = this.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;

            this.updateRecentSearch(this.keyword);

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
                this.$store.commit('updateLoadingSuggestions', true);

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
                this.$store.commit('updateLoadingSuggestions', true);

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
            this.$store.commit('updateLoadingSuggestions', false);
            this.$store.commit('updateSuggestions', null);
        },
        toggleImageSearch() {
            this.imageSearchVisible = !this.imageSearchVisible;
            if (!this.imageSearchVisible) {
                this.$refs.searchBoxImage?.clearImageData();
            }
        },
        toggleRequestType() {
            this.requestType = this.requestType === 'DefaultSearch' ? 'ConceptSearch' : 'DefaultSearch';
        }
    },
    computed: {
        ...mapState([
            'loadingResults',
            'searchOutput'
        ]),
        ...mapGetters([
            'config',
        ]),
        placeholder() {
            return this.requestType === 'DefaultSearch' ? 'Search by Keyword' : 'Search by Concept';
        },
        toggleButtonText() {
            return this.requestType === 'DefaultSearch' ? 'or Concepts' : 'or Keywords';
        }
    },
    watch: {
        requestType(newValue, oldValue) {
            // Only trigger search if there is a keyword
            if (this.keyword) {
                this.searchFull();
            }
        },
        searchOutput(newValue) {
            if (newValue && newValue.Keyword && newValue.Keyword.length) {
                this.keyword = newValue.Keyword;
            }
        }
    },
    beforeUnmount: function () {
        this.off('selectAutocorrectSuggestion', this.selectAutocorrectSuggestionHandler);
    }
}
</script>

<style scoped lang="scss"></style>
