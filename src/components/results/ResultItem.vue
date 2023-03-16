<template>
    <div :class="getField('type') == 'Content' ? 'hawk-results__contentItem' : 'hawk-results__item'">
        <template v-if="getField('type') == 'Content'">
            <h4 class="hawk-results__hawk-contentTitle">
                <a :href="absoluteUrl(getField(linkField))" @click="onClick">{{ getField('itemname') }}</a>
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
    import AddToCart from './AddToCart';

    export default {
        name: "ResultItem",
        data: function () {
            return {}
        },
        components: {
            ResultImage,
            AddToCart
        },
        props: {
            result: {
                default: null
            },
            linkField: {
                default: null
            },
            templateOverride: {
                default: null
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            ...mapGetters([
                'getResponseField'
            ]),
            trackEvent: function () {
                return this.$root.trackEvent;
            }
        },
        methods: {
            getField: function (fieldName, options) {
                var storeState = this.$root.$store.state;
                var langIndiffFields = (this.$root.config.resultItem && this.$root.config.resultItem.langIndiffFields && this.$root.config.resultItem.langIndiffFields.length) ? this.$root.config.resultItem.langIndiffFields : [];

                if (storeState.language && !lodash.includes(langIndiffFields, fieldName)) {
                    fieldName += `_${storeState.language}`;
                }

                if (this.result &&
                    this.result.Document &&
                    this.result.Document[fieldName] &&
                    this.result.Document[fieldName].length) {

                    if (options) {
                        if (options.truncateTo) {
                            return this.truncateValue(this.result.Document[fieldName][0], options.truncate);
                        }

                        if (options.parseAsArray) {
                            return this.result.Document[fieldName];
                        }
                    }

                    return this.result.Document[fieldName][0];
                }
            },
            truncateValue: function (value, limit) {
                if (value) {
                    var truncated = '';
                    var arrValue = value.split(' ');

                    limit = parseInt(limit) || 100;

                    if (arrValue.length < 2) {
                        truncated = value.substr(0, limit);
                    }
                    else {
                        var appoxValue = '';

                        for (var i = 0; i < arrValue.length && appoxValue.length < limit; i++) {
                            appoxValue += " " + arrValue[i];
                        }

                        truncated = appoxValue;
                    }

                    if (value.length > limit) {
                        truncated += ' ...'
                    }

                    return truncated;
                }
            },
            getLink: function () {
                var linkField = this.linkField || this.$root.config.resultItem.linkField;
                var link = this.getField(linkField);

                if (link) {
                    return HawksearchVue.getAbsoluteUrl(link, this.$root.$store);
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
                var link = this.getLink();

                if (this.trackEvent) {
                    this.trackEvent.track('click', {
                        event: e,
                        uniqueId: this.result.DocId,
                        trackingId: this.getResponseField('TrackingId'),
                        url: link
                    });
                }

                if (link && this.$root.config.resultItem.itemSelect) {
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
