<template>
    <div class="autosuggest-menu">
        <template v-if="loadingSuggestions || suggestions">
            <ul class="dropdown-menu autosuggest-menu__list">
                <template v-if="loadingSuggestions">
                    <li class="autosuggest-menu__item">{{ $t('Loading') }}...</li>
                </template>
                <template v-else-if="suggestions.Products.length">
                    <li v-for="item in suggestions.Products" class="autosuggest-menu__item">
                        <p class="autosuggest-menu__item-link" @click="onClick(item)">{{ item.ProductName }}</p>
                    </li>
                </template>
                <template v-else>
                    <li class="autosuggest-menu__item">{{ $t('No Results') }}</li>
                </template>
            </ul>
        </template>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'search-suggestions',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            onClick: function (item) {
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
    .autosuggest-menu__item-link {
        text-decoration: none;
        color: inherit;
        margin: 0;
    }
</style>
