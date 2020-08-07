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
        methods: {
            getField: function (fieldName) {
                if (this.result &&
                    this.result.Document &&
                    this.result.Document[fieldName] &&
                    this.result.Document[fieldName].length) {

                    return this.result.Document[fieldName][0];
                }
            },
            onClick: function () {
                var link = this.absoluteUrl(this.getField(this.linkField));

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