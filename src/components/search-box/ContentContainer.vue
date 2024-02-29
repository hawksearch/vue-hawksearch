<template>
    <div v-if="suggestions && suggestions.Content && suggestions.Content.length">
        <h3>{{ suggestions.ContentHeading }}</h3>
        <div v-for="content in suggestions.Content" :key="content.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(content.Value)" @click="onClick(content)"></div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'content-container',
        props: ['suggestions', 'keyword'],
        methods: {
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            },
            onClick: function (item) {
                item = { ...item };
                if (this.trackEvent && item.Value && item.Url && this.$parent.keyword) {
                    this.trackEvent.track('autocompleteclick', {
                        keyword: this.$parent.keyword,
                        suggestType: this.trackEvent.SuggestType.TopContentMatches,
                        name: item.Value,
                        url: item.Url
                    });
                }

                if (item.Url) {
                    location.assign(item.Url);
                }
            }
        },
        computed: {
            trackEvent: function () {
                return this.$root.trackEvent;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
