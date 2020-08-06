<template>
    <div>
        <div class="text-left" v-html="banner.Output" />
    </div>
</template>

<script>

    export default {
        name: 'banner-widget',
        props: ['banner'],
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
