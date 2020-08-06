<template>
    <div class="hawk-preview__bannerTop">
        <div class="hawk-preview__banner-container">
            <template v-for="banner in bannerList">
                <component :is="getBannerType(banner)" :banner="banner"></component>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import BannerImage from './banner-items/BannerImage';
    import BannerCustom from './banner-items/BannerCustom';
    import BannerFeatured from './banner-items/BannerFeatured';
    import BannerWidget from './banner-items/BannerWidget';

    export default {
        name: 'banner',
        props: {
            zone: {
                default: 'Top'
            }
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            getBannerType: function (banner) {
                switch (banner.ContentType) {
                    case 'image':
                        return BannerImage;

                    case 'widget':
                        return BannerWidget;

                    //case 'featured':
                    //    return BannerFeatured;

                    case 'custom':
                        return BannerCustom;

                    default:
                        return null;
                }
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            bannerList: function () {
                var items = [];

                if (this.searchOutput && this.searchOutput.Merchandising) {
                    items = this.searchOutput.Merchandising.Items.filter(item => item.Zone == this.zone);
                }

                return items;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
