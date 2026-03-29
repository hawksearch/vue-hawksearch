<template>
    <div>
        <div class="text-left" v-html="banner.Output" />
    </div>
</template>

<script>
    export default {
        name: 'banner-widget',
        props: ['banner'],
        emits: ['bannerMounted'],
        mounted() {
            this.$emit('bannerMounted', this.banner);
        }
    }
</script>

<style scoped lang="scss">
</style>
