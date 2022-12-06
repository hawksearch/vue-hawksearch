<template>
    <div v-if="suggestions && suggestions.Categories && suggestions.Categories.length">
        <h3>{{ suggestions.CategoryHeading }}</h3>
        <div v-for="category in suggestions.Categories" :key="category.Value" class="autosuggest-menu__item">
            <div v-html="category.Value"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'categories-container',
        props: ['suggestions'],
        mounted() {

        },
        data() {
            return {}
        },
        methods: {

        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
