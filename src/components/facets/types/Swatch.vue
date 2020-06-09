<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-swatch">
            <ul class="hawk-facet-rail__facet-list">
                <swatch-item v-for="item in items" :key="item.Value" :item="item" :facet-data="facetData"></swatch-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import SwatchItem from './SwatchItem';

    export default {
        name: 'swatch',
        props: ['facetData'],
        components: {
            SwatchItem
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
