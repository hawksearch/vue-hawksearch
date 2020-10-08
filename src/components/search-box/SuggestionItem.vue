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

