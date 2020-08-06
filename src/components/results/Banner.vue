<template>
    <div class="hawk-preview__bannerTop">
        <div class="hawk-preview__banner-container">
            <template v-for="banner in bannerList">
                <div>
                    <a :href="absoluteUrl(banner.ForwardUrl)">
                        <img :src="absoluteUrl(banner.ImageUrl)" />
                    </a>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

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
            absoluteUrl: function (url) {
                var store = this.$root.$store;
                return HawksearchVue.getAbsoluteUrl(url, store);
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
