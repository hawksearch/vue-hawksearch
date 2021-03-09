<template>
    <li @click="onClick">
        <div v-html="item.Thumb"></div>
        <p class="p-name">{{ item.ProductName }}</p>
    </li>
</template>

<script>
    export default {
        name: 'suggestion-item',
        props: ['item'],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            getField: function (fieldName) {
                var storeState = this.$root.$store.state;
                var langIndiffFields = (this.$root.config.resultItem && this.$root.config.resultItem.langIndiffFields && this.$root.config.resultItem.langIndiffFields.length) ? this.$root.config.resultItem.langIndiffFields : [];

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
            onClick: function () {
                this.$emit('itemselected', this.item);
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

