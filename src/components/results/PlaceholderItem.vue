<template>
    <div class="hawk-results__item">
        <div class="hawk-results__item-image">
            <placeholder-image></placeholder-image>
        </div>

        <div class="hawk-results__item-name">
            <div class="hawk-results__item-name-placeholder" />
        </div>
    </div>
</template>

<script>
    import PlaceholderImage from './PlaceholderImage'

    export default {
        name: 'placeholder-item',
        props: [],
        components: {
            PlaceholderImage
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

        }
    }


</script>

<style scoped lang="scss">
</style>
