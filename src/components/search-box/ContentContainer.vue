<template>
    <div v-if="suggestions && suggestions.Content && suggestions.Content.length">
        <h3>{{ suggestions.ContentHeading }}</h3>
        <div v-for="content in suggestions.Content" :key="content.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(content.Value)"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'content-container',
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
