<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-checkbox">
            <ul class="hawk-facet-rail__facet-list">
                <nested-item v-for="item in items" :key="item.Value" :item-data="item" :facet-data="facetData" ></nested-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import NestedItem from './NestedItem';

    export default {
        name: 'nested-checkbox',
        props: ['facetData'],
        components: {
            NestedItem
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {
            items: function () {
                return this.facetData.Values;
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
