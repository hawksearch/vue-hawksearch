<template>
    <div :class="getField('type') == 'Content' ? 'hawk-results__contentItem' : 'hawk-results__item'" @click="onClick">
        <template v-if="getField('type') == 'Content'">
            <h4 class="hawk-results__hawk-contentTitle">
                <a :href="absoluteUrl(getField(linkField))">{{ getField('itemname') }}</a>
            </h4>
            <template v-if="getField('description_short')">
                <div>{{ getField('description_short') }}</div>
            </template>
        </template>
        <template v-else>
            <result-image :imagePath="getField('image')"></result-image>

            <div class="hawk-results__item-name">
                <span>{{ getField('itemname') }}</span>
            </div>
        </template>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import ResultImage from './ResultImage';

    export default {
        name: "ResultItem",
        data: function () {
            return {}
        },
        components: {
            ResultImage
        },
        props: {
            result: {
                default: null
            },
            linkField: {
                default: 'url'
            }
        },
        computed: {
            ...mapState([
                'searchOutput',
                'config',
                'trackEvent'
            ]),
            ...mapGetters([
                'getResponseField'
            ])
        },
        methods: {
            getField: function (fieldName) {
                if (this.config && this.config.language) {
                    fieldName += `_${this.config.language}`;
                }
                
                if (this.result &&
                    this.result.Document &&
                    this.result.Document[fieldName] &&
                    this.result.Document[fieldName].length) {

                    return this.result.Document[fieldName][0];
                }
            },
            getJsonData: function (fieldName) {
                if (!this.getField(fieldName)) return;

                try {
                    return JSON.parse(this.getField(fieldName));
                } catch (error) {
                    console.log('Property parsing to JSON failed');
                }
            },
            onClick: function (e) {
                var link = this.absoluteUrl(this.getField(this.linkField));

                if (this.trackEvent) {
                    this.trackEvent.track('click', {
                        event: e,
                        uniqueId: this.result.DocId,
                        trackingId: this.getResponseField('TrackingId')
                    });
                }

                if (link) {
                    location.assign(link);
                }
            },
            absoluteUrl: function (url) {
                var store = this.$root.$store;
                return HawksearchVue.getAbsoluteUrl(url, store);
            }
        }
    };
</script>

<style scoped lang="scss">
</style>