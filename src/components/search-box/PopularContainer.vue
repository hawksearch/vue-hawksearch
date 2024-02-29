<template>
    <div v-if="suggestions && suggestions.Popular && suggestions.Popular.length">
        <h3>{{ suggestions.PopularHeading }}</h3>
        <div v-for="popular in suggestions.Popular" :key="popular.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(popular.Value)" @click="onClick(popular)"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'popular-container',
    props: ['suggestions', 'keyword'],
    methods: {
        htmlEntityDecode: function (value) {
            var decoded = new DOMParser().parseFromString(value, "text/html");
            return decoded.documentElement.textContent;
        },
        onClick: function (item) {
            item = { ...item };
            console.log(this.trackEvent, item.Value, item.Url, this.$parent.keyword);
            if (this.trackEvent && item.Value && item.Url && this.$parent.keyword) {
                this.trackEvent.track('autocompleteclick', {
                    keyword: this.$parent.keyword,
                    suggestType: this.trackEvent.SuggestType.PopularSearches,
                    name: item.Value,
                    url: item.Url
                });
            }

            if (item.Url) {
                location.assign(item.Url);
            }
        },
    },
    computed: {
        trackEvent: function () {
            return this.$root.trackEvent;
        }
    }
}
</script>

<style scoped lang="scss"></style>
