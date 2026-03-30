<template>
    <div v-if="suggestions && suggestions.Categories && suggestions.Categories.length">
        <h3>{{ suggestions.CategoryHeading }}</h3>
        <div v-for="category in suggestions.Categories" :key="category.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(category.Value)" @click="onClick(category)"></div>
        </div>
    </div>
</template>

<script>
import useTrackingEvent from '@/composables/useTrackingEvent';

export default {
    name: 'categories-container',
    props: ['suggestions', 'keyword'],
    methods: {
        htmlEntityDecode: function (value) {
            var decoded = new DOMParser().parseFromString(value, "text/html");
            return decoded.documentElement.textContent;
        },
        onClick: function (item) {
            item = { ...item };
            if (this.trackEvent && item.Value && item.Url && this.keyword) {
                this.trackEvent.track('autocompleteclick', {
                    keyword: this.keyword,
                    suggestType: this.trackEvent.SuggestType.TopCategories,
                    name: item.Value,
                    url: item.Url
                });
            }
            if (item.Url) {
                location.assign(item.Url);
            }
        }
    },
    setup() {
        const { trackEvent } = useTrackingEvent();
        return { trackEvent }
    }
}
</script>

<style scoped lang="scss"></style>
