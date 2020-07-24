<template>
    <div v-if="suggestions && suggestions.Popular && suggestions.Popular.length">
        <h3>{{ suggestions.PopularHeading }}</h3>
        <li v-for="popular in suggestions.Popular" :key="popular.Value" class="autosuggest-menu__item">
            <div v-html="popular.Value"></div>
        </li>
    </div>
</template>

<script>

    export default {
        name: 'popular-container',
        props: ['suggestions'],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
