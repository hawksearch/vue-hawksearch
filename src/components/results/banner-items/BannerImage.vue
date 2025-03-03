<template>
    <div>
        <a :href="absoluteUrl(banner.ForwardUrl)">
            <img :src="absoluteUrl(banner.ImageUrl)" />
        </a>
    </div>
</template>

<script>
export default {
    name: 'banner-image',
    props: ['banner'],
    mounted() {
        this.$parent.loadHandler(this.banner);
    },
    methods: {
        absoluteUrl: function (url) {
            return HawksearchVue.getAbsoluteUrl(url, this.$store);
        }
    }
}
</script>

<style scoped lang="scss">
</style>
