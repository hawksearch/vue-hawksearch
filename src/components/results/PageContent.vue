<template>
    <div class="hawk-page-content">
        <div class="hawk-preview__bannerTop">
            <div class="hawk-preview__banner-container">
                <template v-for="item in items">
                    <div @click="clickHandler(item)">
                        <component
                            :is="getItemType(item)"
                            :banner="item"
                            @banner-mounted="loadHandler"
                        />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import BannerImage from './banner-items/BannerImage.vue';
    import BannerCustom from './banner-items/BannerCustom.vue';
    import FeaturedItems from './banner-items/FeaturedItems.vue';
    import BannerWidget from './banner-items/BannerWidget.vue';

    export default {
        name: 'page-content',
        props: ['zone'],
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
