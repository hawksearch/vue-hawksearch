<template>
    <div v-if="suggestions && suggestions.Categories && suggestions.Categories.length">
        <h3>{{ suggestions.CategoryHeading }}</h3>
        <div v-for="category in suggestions.Categories" :key="category.Value" class="autosuggest-menu__item">
            <div v-html="htmlEntityDecode(category.Value)" @click="onClick(category)"></div>
        </div>
    </div>
</template>

<script>

export default {
    name: 'categories-container',
    props: ['suggestions', 'keyword'],
    mounted() {

    },
    data() {
        return {}
    },
    methods: {
        htmlEntityDecode: function (value) {
            var decoded = new DOMParser().parseFromString(value, "text/html");
            return decoded.documentElement.textContent;
        },
        onClick: function (item) {
            item = { ...item };
            console.log(this.trackEvent && item.Value && item.Url && this.$parent.keyword);
            if (this.trackEvent && item.Value && item.Url && this.$parent.keyword) {
                this.trackEvent.track('autocompleteclick', {
                    keyword: this.$parent.keyword,
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
    computed: {
        trackEvent: function () {
            return this.$root.trackEvent;
        }
    }
}

</script>

<style scoped lang="scss"></style>
