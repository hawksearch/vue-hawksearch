<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-size">
            <ul class="hawk-facet-rail__facet-list">
                <size-item v-for="item in items" :key="item.Value" :item-data="item" :facet-data="facetData" ></size-item>
            </ul>
        </div>
        <slot></slot>
    </div>
</template>

<script>
    import SizeItem from './SizeItem';

    export default {
        name: 'size',
        props: ['facetData'],
        components: {
            SizeItem
        },
        mounted() { },
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
