<template>
    <div>
        <div class="text-left" v-html="banner.Output" />
    </div>
</template>

<script>
    export default {
        name: 'banner-custom',
        props: ['banner'],
        emits: ['bannerMounted'],
        mounted() {
            this.$emit('bannerMounted', this.banner);
        }
    }
</script>

<style scoped lang="scss">
</style>
