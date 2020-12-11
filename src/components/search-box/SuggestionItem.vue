<template>
    <li @click="onClick">
        <div v-html="item.Thumb"></div>
        <p class="p-name">{{ getField('item.ProductName') }}</p>
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
                var config = this.$root.$store.state.config;

                if (config && config.language) {
                    fieldName += `_${config.language}`;
                }

                if (this.item &&
                    this.item.Results &&
                    this.item.Results.Document &&
                    this.item.Results.Document[fieldName] &&
                    this.item.Results.Document[fieldName].length) {

                    return this.item.Results.Document[fieldName][0];
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

