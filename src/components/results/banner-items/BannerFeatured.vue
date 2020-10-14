<template>
    <div class="hawk-preview__featured-items">
        <h4>{{ featuredItem.Title }}</h4>
        <template v-for="item in featuredItem.Items">
            <div class="hawk-preview__featured-items__item">
                <result-image :imagePath="getField('image', item)"></result-image>
                <div class="hawk-preview__featured-items__item-name">
                    <span>{{ getField('itemname', item) }}</span>
                </div>
                <div class="hawk-preview__featured-items__item-name">
                    <span>
                        Price : {{ getField('price', item) }}
                    </span>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
    import ResultImage from '../ResultImage';

    export default {
        name: 'banner-featured',
        props: ['banner'],
        mounted() {
            this.$parent.loadHandler(this.banner);
        },
        data() {
            return {

            }
        },
        components: {
            ResultImage
        },
        methods: {
            getField: function (fieldName, item) {
                if (item &&
                    item.Document &&
                    item.Document[fieldName] &&
                    item.Document[fieldName].length) {

                    return item.Document[fieldName][0];
                }
            }
        },
        computed: {
            featuredItem: function () {
                return banner;
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
