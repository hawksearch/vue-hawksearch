<template>
    <li @click="onClick">
        <div v-if="getThumb()">
            <img class="hawk-sqItemImage-thumb" :src="getThumb()" />
        </div>
        <span class="p-name">{{ getTitle() }}</span>
    </li>
</template>

<script>
    export default {
        name: 'suggestion-item',
        props: {
            item: {
                default: null
            },
            titleField: {
                default: null
            },
            linkField: {
                default: null
            },
            thumbField: {
                default: null
            }
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            getField: function (fieldName) {
                var storeState = this.$root.$store.state;
                var langIndiffFields = (this.$root.config.suggestionItem && this.$root.config.suggestionItem.langIndiffFields && this.$root.config.suggestionItem.langIndiffFields.length) ? this.$root.config.suggestionItem.langIndiffFields : [];

                if (storeState.language && !_.includes(langIndiffFields, fieldName)) {
                    fieldName += `_${storeState.language}`;
                }

                if (this.item &&
                    this.item.Results &&
                    this.item.Results.Document &&
                    this.item.Results.Document[fieldName] &&
                    this.item.Results.Document[fieldName].length) {

                    return this.item.Results.Document[fieldName][0];
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
            getTitle: function (fieldName) {
                if (!fieldName) {
                    fieldName = this.getConfigurationField('titleField');
                }

                return _.cloneDeep(this.item.ProductName || this.getField(fieldName));
            },
            getLink: function (fieldName) {
                if (!fieldName) {
                    fieldName = this.getConfigurationField('linkField');
                }

                return _.cloneDeep(this.item.Url || this.getField(fieldName));
            },
            getThumb: function (fieldName) {
                if (!fieldName) {
                    fieldName = this.getConfigurationField('thumbField');
                }

                return _.cloneDeep((this.item.Thumb && this.item.Thumb.Url) || this.getField(fieldName));
            },
            getConfigurationField: function (field) {
                if (this[field]) {
                    return this[field]
                }
                else if (this.$root.config.suggestionItem) {
                    return this.$root.config.suggestionItem[field];
                }
            },
            onClick: function () {
                this.$emit('itemselected', this);
            }
        },
        computed: {

        }
    }
</script>

<style scoped lang="scss">
    /*.autosuggest-menu__item-link {
        text-decoration: none;
        color: inherit;
        margin: 0;
    }*/
</style>

