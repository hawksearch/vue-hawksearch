<template>
    <li @click="onClick">
        <div v-if="getThumb()">
            <img class="hawk-sqItemImage-thumb" :src="getThumb()" />
        </div>
        <span class="p-name">{{ htmlEntityDecode(getTitle()) }}</span>
    </li>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
    name: 'suggestion-item',
    emits: ['itemSelected'],
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
    computed: {
        ...mapState(['language']),
        ...mapGetters(['config'])
    },
    methods: {
        getField: function (fieldName) {
            var langIndiffFields = (this.config.suggestionItem && this.config.suggestionItem.langIndiffFields && this.config.suggestionItem.langIndiffFields.length) ? this.config.suggestionItem.langIndiffFields : [];

            if (this.language && !lodash.includes(langIndiffFields, fieldName)) {
                fieldName += `_${this.language}`;
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

            return lodash.cloneDeep(this.item.ProductName || this.getField(fieldName));
        },
        getLink: function (fieldName) {
            if (!fieldName) {
                fieldName = this.getConfigurationField('linkField');
            }

            return lodash.cloneDeep(this.item.Url || this.getField(fieldName));
        },
        getThumb: function (fieldName) {
            if (!fieldName) {
                fieldName = this.getConfigurationField('thumbField');
            }

            return lodash.cloneDeep((this.item.Thumb && this.item.Thumb.Url) || this.getField(fieldName));
        },
        getConfigurationField: function (field) {
            if (this[field]) {
                return this[field]
            }
            else if (this.config.suggestionItem) {
                return this.config.suggestionItem[field];
            }
        },
        onClick: function () {
            this.$emit('itemSelected', this);
        },
        htmlEntityDecode: function(value) {
            var decoded = new DOMParser().parseFromString(value, "text/html");
            return decoded.documentElement.textContent;
        }
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
