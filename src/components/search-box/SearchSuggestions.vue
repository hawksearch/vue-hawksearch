<template>
    <div class="autosuggest-menu">
        <template v-if="loadingSuggestions || suggestions">
            <ul class="dropdown-menu autosuggest-menu__list autosuggest-outer-list">
                <template v-if="loadingSuggestions">
                    <li class="autosuggest-menu__item">{{ $t('Loading') }}...</li>
                </template>
                <template v-else-if="suggestions.Products.length">
                    <ul class="autosuggest-inner-list">
                        <h3>{{ suggestions.ProductHeading }}</h3>
                        <suggestion-item v-for="item in suggestions.Products" :item="item" :key="item.Results.DocId" @itemselected="onItemSeleted"></suggestion-item>
                    </ul>
                    <!--<div class="autosuggest-inner-container" v-if="suggestions.Categories.length || suggestions.Popular.length || suggestions.Content.length">
                        <categories-container :suggestions="suggestions"></categories-container>
                        <popular-container :suggestions="suggestions"></popular-container>
                        <content-container :suggestions="suggestions"></content-container>
                    </div>-->
                </template>
                <template v-else>
                    <li class="autosuggest-menu__item">{{ $t('No Results') }}</li>
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
        props: [],
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
                location.assign(item.Url);
            }
        },
        computed: {
            ...mapState([
                'suggestions',
                'loadingSuggestions'
            ])
        }
    }


</script>

<style scoped lang="scss">
</style>
