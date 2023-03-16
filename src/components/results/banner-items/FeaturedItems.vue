<template>
    <div class="hawk-preview__featured-items hawk-results">
        <div class="hawk-results__listing">
            <featured-item v-for="result in banner.FeaturedItems" :key="result.DocId" :result="result"></featured-item>
        </div>
    </div>
</template>

<script>
    import FeaturedItem from './FeaturedItem';

    export default {
        name: 'featured-items',
        props: ['banner'],
        mounted() {
        },
        data() {
            return {}
        },
        components: {
            FeaturedItem
        }
    }


</script>

<style scoped lang="scss">
</style>
