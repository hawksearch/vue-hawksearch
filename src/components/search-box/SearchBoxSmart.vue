<template>
    <div class="hawk__searchBox" @click.stop="">
        <SearchBoxImage
            :visible="imageSearchVisible"
            @update:visible="imageSearchVisible = $event"
        />
        <div class="hawk__searchFull smart-search">
      <span class="hawk__line search-input">
        <search-icon-svg />
        <input
            type="text"
            :placeholder="$t(placeholder)"
            v-model="keyword"
            @input="onFullSearchInput"
            @keydown="onFullSearchKeyDown"
            @blur="onFullSearchBlur"
        />
        <button @click="toggleRequestType">{{ toggleButtonText }}</button>
      </span>
            <button class="image-search-btn" @click="toggleImageSearch">
                <image-search-icon-svg />
            </button>
        </div>
        <search-suggestions :field-focused="fieldFocused" :keyword="keyword" />
    </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import SearchIconSvg from "../svg/SearchIconSvg.vue";
import ImageSearchIconSvg from "../svg/ImageSearchIconSvg.vue";
import SearchSuggestions from "./SearchSuggestions.vue";
import CustomResultsLabel from "../results/tools/CustomResultsLabel.vue";
import SearchBoxImage from "./SearchBoxImage.vue";
import { getRecentSearch, setRecentSearch } from '../../CookieHandler';

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
        // Patch $root with a minimal event bus on a separate property "$bus" if not already defined
        const root = this.$root;
        if (!root.$bus) {
            root.$bus = {
                events: {},
                on(event, callback) {
                    if (!this.events[event]) this.events[event] = [];
                    this.events[event].push(callback);
                },
                off(event, callback) {
                    if (!this.events[event]) return;
                    this.events[event] = this.events[event].filter(cb => cb !== callback);
                },
                emit(event, ...args) {
                    if (!this.events[event]) return;
                    this.events[event].forEach(cb => cb(...args));
                }
            };
        }
        // Store callback reference to remove later
        this._autocorrectCallback = (selectedSuggestion) => {
            this.keyword = selectedSuggestion;
            this.searchFull();
        };
        root.$bus.on('selectAutocorrectSuggestion', this._autocorrectCallback);
        // Trigger initial search if reloadOnEmpty is enabled
        if (this.config &&
            this.config.searchBoxConfig &&
            this.config.searchBoxConfig.reloadOnEmpty) {
            this.searchFull();
        }
    },
    beforeUnmount() {
        if (this.$root && this.$root.$bus && this._autocorrectCallback) {
            this.$root.$bus.off('selectAutocorrectSuggestion', this._autocorrectCallback);
        }
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
            const searchBoxConfig = this.config.searchBoxConfig;
            const searchPage = this.searchPage || location.pathname;
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
            const searchBoxConfig = this.config.searchBoxConfig;
            const searchPage = this.searchPage || location.pathname;
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
        onFullSearchKeyDown(e) {
            if (e.key === 'Enter') {
                this.searchFull();
                e.stopPropagation();
                e.preventDefault();
            }
        },
        onFullSearchInput(e) {
            const keyword = e.target.value;
            if (keyword) {
                this.fieldFocused = true;
                this.$root.$store.commit('updateLoadingSuggestions', true);
                clearTimeout(this.suggestionDelay);
                this.suggestionDelay = setTimeout(() => {
                    this.$root.dispatchToStore('fetchSuggestions', { Keyword: keyword });
                }, 250);
            } else {
                this.cancelSuggestions();
            }
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
        ...mapState(['loadingResults', 'searchOutput']),
        ...mapGetters(['config']),
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
