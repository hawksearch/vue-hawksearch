<template>
    <div class="autosuggest-menu">
        <template v-if="loading || suggestions">
            <ul class="dropdown-menu autosuggest-menu__list">
                <template v-if="loading">
                    <li class="autosuggest-menu__item">{{ $t('Loading') }}...</li>
                </template>
                <template v-else-if="suggestions.Products.length">
                    <li v-for="item in suggestions.Products" class="autosuggest-menu__item">
                        <a class="autosuggest-menu__item-link" :href="item.Url">{{ item.ProductName }}</a>
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
        props: ['loading'],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {
            ...mapState([
                'suggestions'
            ])
        }
    }


</script>

<style scoped lang="scss">
    .autosuggest-menu__item-link {
        text-decoration: none;
        color: inherit;
    }
</style>
