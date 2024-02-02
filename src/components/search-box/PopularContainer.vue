<template>
    <div v-if="suggestions && suggestions.Popular && suggestions.Popular.length">
        <h3>{{ suggestions.PopularHeading }}</h3>
        <div v-for="popular in suggestions.Popular" :key="popular.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(popular.Value)"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'popular-container',
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
