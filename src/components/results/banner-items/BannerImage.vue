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
                var store = this.$root.$store;
                return HawksearchVue.getAbsoluteUrl(url, store);
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
