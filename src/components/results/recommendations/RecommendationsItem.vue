<template>
    <div class="hawk-recommendations__item-name">
        <div class="hawk-recommendations__item" @click="onClick">
            <template>
                <result-image :imagePath="getField('imageUrl')"></result-image>

                <div class="hawk-results__item-name">
                    <span>{{ getField('itemName') }}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import ResultImage from '../ResultImage';

    export default {
        name: "recommendations-item",
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
            requestId: {
                default: null
            },
            linkField: {
                default: null
            }
        },
        computed: {
            ...mapState([
                'recommendationsOutput'
            ]),
            ...mapGetters([
                'getResponseField'
            ]),
            trackEvent: function () {
                return this.$root.trackEvent;
            }
        },
        methods: {
            getField: function (fieldName) {
                var config = this.$root.config;

                if (this.result &&
                    this.result[fieldName] &&
                    this.result[fieldName].length) {

                    return this.result[fieldName];
                }
            },
            getCustomDictField: function (fieldName) {
                var config = this.$root.config;

                if (config && config.language) {
                    fieldName += `_${config.language}`;
                }

                if (this.result &&
                    this.result.customDict &&
                    this.result.customDict[fieldName]) {

                    return this.result.customDict[fieldName];
                }
            },
            getLink: function () {
                var linkField = this.linkField || this.$root.config.resultItem.linkField;
                var link = this.getCustomDictField(linkField);

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
                    this.trackEvent.track('recommendationclick', {
                        widgetGuid: this.$root.$store.state.config.currentWidgetGuid,
                        uniqueId: this.result.id,
                        requestId: this.requestId,
                        itemIndex: this.result.itemIndex || null
                    });
                }
                
                if (link && this.$root.config.resultItem.itemSelect) {
                    location.assign(link);
                }
            }
        }
    };
</script>

<style scoped lang="scss">
</style>