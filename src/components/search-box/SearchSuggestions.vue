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
                            <suggestion-item
                                v-for="item in suggestions.Products"
                                :item="item"
                                :key="item.Results.DocId"
                                @item-selected="onItemSeleted"
                            />
                        </ul>
                        <div @click="viewAllMatches" class="view-matches">View all matches</div>
                    </div>
                    <div v-if="suggestions.Categories.length || suggestions.Popular.length || suggestions.Content.length" 
                        class="hawk-autosuggest-inner-container"
                    >
                        <categories-container
                            v-if="suggestions.Categories.length"
                            :suggestions="suggestions"
                            :keyword="keyword"
                        />
                        <popular-container
                            v-if="suggestions.Popular.length"
                            :suggestions="suggestions"
                            :keyword="keyword"
                        />
                        <content-container
                            v-if="suggestions.Content.length"
                            :suggestions="suggestions"
                            :keyword="keyword"
                        />
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
import SuggestionItem from './SuggestionItem.vue';
import CategoriesContainer from './CategoriesContainer.vue';
import PopularContainer from './PopularContainer.vue';
import ContentContainer from './ContentContainer.vue';
import useTrackingEvent from '@/composables/useTrackingEvent';

export default {
    name: 'search-suggestions',
    props: ['fieldFocused', 'keyword'],
    emits: ['viewAllMatches'],
    components: {
        SuggestionItem,
        CategoriesContainer,
        PopularContainer,
        ContentContainer
    },
    methods: {
        onItemSeleted: function (item) {
            if (this.trackEvent && item.getTitle() && item.getLink() && this.keyword) {
                this.trackEvent.track('autocompleteclick', {
                    keyword: this.keyword,
                    suggestType: this.trackEvent.SuggestType.TopProductMatches,
                    name: item.getTitle(),
                    url: item.getLink()
                });
            }
            if (item.getLink()) {
                location.assign(item.getLink());
            }
        },
        viewAllMatches: function () {
            this.$emit('viewAllMatches');
        }
    },
    computed: {
        ...mapState([
            'suggestions',
            'loadingSuggestions'
        ]),
    },
    setup() {
        const { trackEvent } = useTrackingEvent();
        return { trackEvent }
    }
}
</script>

<style scoped lang="scss">
</style>
