<template>
    <div class="hawk-page-content">
        <div class="hawk-preview__bannerTop">
            <div class="hawk-preview__banner-container">
                <template v-for="item in items">
                    <div @click="clickHandler(item)">
                        <component :is="getItemType(item)" :banner="item"></component>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import BannerImage from './banner-items/BannerImage';
    import BannerCustom from './banner-items/BannerCustom';
    import FeaturedItems from './banner-items/FeaturedItems';
    import BannerWidget from './banner-items/BannerWidget';

    export default {
        name: 'page-content',
        props: ['zone'],
        components: {
        },
        mounted() {

        },
        data() {
            return {}
        },
        methods: {
            getItemType: function (item) {
                switch (item.ContentType) {
                    case 'image':
                        return BannerImage;

                    case 'widget':
                        return BannerWidget;

                    case 'custom':
                        return BannerCustom;

                    case 'featured':
                        return FeaturedItems;

                    default:
                        return null;
                }
            },
            loadHandler: function (banner) {
            },
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            items: function () {
                var items = [];

                if (this.searchOutput && this.searchOutput.PageContent && this.searchOutput.PageContent.length) {
                    var pageContentZone = this.searchOutput.PageContent.filter(items => items.ZoneName == this.zone);

                    if (pageContentZone && pageContentZone.length) {
                        items = pageContentZone[0].Items;
                    }
                }

                return items;
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
