<template>
    <li>
        <a :href="item.Url" @click.prevent="onClick">
            {{ item.Value }}
        </a>
    </li>
</template>

<script>
import useTrackingEvent from '@/composables/useTrackingEvent';
export default {
    name: 'dym-content-item',
    props: {
        item: {
            type: Object,
            required: true
        },
        keyword: {
            type: String,
            required: true
        }
    },
    methods: {
        onClick() {
            if (this.trackEvent && this.item.Value && this.item.Url && this.keyword) {
                this.trackEvent.track('autocompleteclick', {
                    keyword: this.keyword,
                    suggestType: this.trackEvent.SuggestType.TopContentMatches,
                    name: this.item.Value,
                    url: this.item.Url
                });
            }

            if (this.item.Url) {
                location.assign(this.item.Url);
            }
        }
    },
    setup() {
        const { trackEvent } = useTrackingEvent();
        return { trackEvent }
    }
};
</script>

<style scoped lang="scss">
</style>
