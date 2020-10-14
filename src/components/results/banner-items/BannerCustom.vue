<template>
    <div>
        <div class="text-left" v-html="banner.Output" />
    </div>
</template>

<script>

    export default {
        name: 'banner-custom',
        props: ['banner'],
        mounted() {
            this.$parent.loadHandler(this.banner);
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
