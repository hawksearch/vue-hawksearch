<template>
    <div v-if="suggestions && suggestions.Categories && suggestions.Categories.length">
        <h3>{{ suggestions.CategoryHeading }}</h3>
        <div v-for="category in suggestions.Categories" :key="category.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(category.Value)"></div>
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
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
