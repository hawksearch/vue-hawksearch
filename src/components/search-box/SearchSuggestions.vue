<template>
    <div class="hawk-autosuggest-menu">
        <template v-if="fieldFocused && (loadingSuggestions || suggestions)">
            <div class="hawk-dropdown-menu hawk-autosuggest-menu__list hawk-autosuggest-outer-list">
                <template v-if="loadingSuggestions">
                    <div class="hawk-autosuggest-menu__item">{{ $t('Loading') }}...</div>
                </template>
                <template v-else-if="suggestions.Products.length
                || suggestions.Categories.length 
                || suggestions.Popular.length 
                || suggestions.Content.length">
                    <div v-if="suggestions.Products.length" class="hawk-autosuggest-inner-list">
                        <h3>{{ suggestions.ProductHeading }}</h3>
                        <ul>
                            <suggestion-item v-for="item in suggestions.Products" :item="item" :key="item.Results.DocId" @itemselected="onItemSeleted"></suggestion-item>
                        </ul>
                        <div @click="viewAllMatches" class="view-matches">View all matches</div>
                    </div>
                    <div v-if="suggestions.Categories.length || suggestions.Popular.length || suggestions.Content.length" 
                        class="hawk-autosuggest-inner-container">
                        <categories-container v-if="suggestions.Categories.length" :suggestions="suggestions"></categories-container>
                        <popular-container v-if="suggestions.Popular.length" :suggestions="suggestions"></popular-container>
                        <content-container v-if="suggestions.Content.length" :suggestions="suggestions"></content-container>
                    </div>
                </template>
                <template v-else>
                    <div class="hawk-autosuggest-menu__item">{{ $t('No Results') }}</div>
                </template>
            </div>
        </template>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import SuggestionItem from './SuggestionItem';
    import CategoriesContainer from './CategoriesContainer';
    import PopularContainer from './PopularContainer';
    import ContentContainer from './ContentContainer';

    export default {
        name: 'search-suggestions',
        props: ['fieldFocused'],
        components: {
            SuggestionItem,
            CategoriesContainer,
            PopularContainer,
            ContentContainer
        },
        mounted() {

        },
        data() {
            return {}
        },
        methods: {
            onItemSeleted: function (item) {
                if (this.trackEvent && item.getTitle() && item.getLink() && this.$parent.keyword) {
                    this.trackEvent.track('autocompleteclick', {
                        keyword: this.$parent.keyword,
                        suggestType: this.trackEvent.SuggestType.TopProductMatches,
                        name: item.getTitle(),
                        url: item.getLink(),
                    });
                }

                if (item.getLink()) {
                    location.assign(item.getLink());
                }
            },
            viewAllMatches: function () {
                if (this.$parent.search) {
                    this.$parent.search({ ignoreRedirectRules: true });
                }
            }
        },
        computed: {
            ...mapState([
                'suggestions',
                'loadingSuggestions'
            ]),
            trackEvent: function () {
                return this.$root.trackEvent;
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
