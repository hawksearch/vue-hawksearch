<template>
    <div class="hawk-autosuggest-menu">
        <template v-if="fieldFocused && (loadingSuggestions || suggestions)">
            <ul class="hawk-dropdown-menu hawk-autosuggest-menu__list hawk-autosuggest-outer-list">
                <template v-if="loadingSuggestions">
                    <li class="hawk-autosuggest-menu__item">{{ $t('Loading') }}...</li>
                </template>
                <template v-else-if="suggestions.Products.length">
                    <ul class="hawk-autosuggest-inner-list">
                        <h3>{{ suggestions.ProductHeading }}</h3>
                        <suggestion-item v-for="item in suggestions.Products" :item="item" :key="item.Results.DocId" @itemselected="onItemSeleted"></suggestion-item>
                        <div @click="viewAllMatches" class="view-matches">View all matches</div>
                    </ul>
                    <div class="autosuggest-inner-container" v-if="suggestions.Categories.length || suggestions.Popular.length || suggestions.Content.length">
                        <categories-container :suggestions="suggestions"></categories-container>
                        <popular-container :suggestions="suggestions"></popular-container>
                        <content-container :suggestions="suggestions"></content-container>
                    </div>
                </template>
                <template v-else>
                    <li class="hawk-autosuggest-menu__item">{{ $t('No Results') }}</li>
                </template>
            </ul>
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
            return {

            }
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
