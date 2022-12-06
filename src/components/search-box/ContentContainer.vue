<template>
    <div v-if="suggestions && suggestions.Content && suggestions.Content.length">
        <h3>{{ suggestions.ContentHeading }}</h3>
        <div v-for="content in suggestions.Content" :key="content.Value" class="autosuggest-menu__item">
            <div v-html="content.Value"></div>
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

        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
