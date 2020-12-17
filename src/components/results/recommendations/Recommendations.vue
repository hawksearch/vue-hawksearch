<template>
    <div ref="recommendations-wrapper" class="recommendations-wrapper" >
        <template v-if="widgetItem.recommendationItems">
            <div class="recommendations-title">
                <h4>{{ widgetItem.widgeTitle }}</h4>
            </div>

            <template v-if="widgetItem.isCarousel">
                <div class="recommendations-wrapper-inner" :style="{ opacity: showComponent, transition: 'opacity 0.3s' }">
                    <div class="filler"></div>

                    <div v-if="widgetItem.carouselData.showNextPrevButtons" class="slider-button-prev" @click="slide('prev')" :style="{ height: itemHeight + 'px' }">
                        <left-chevron-svg icon-class="hawk-pagination__left" />
                    </div>

                    <div class="recommendations-container slider-enabled" :style="{ width: widgetItem.carouselData.nofVisible * itemWidth + 'px', height: itemHeight + 'px' }" @mousedown="onMouseDown" @mousemove="dragMouse" @mouseup="onMouseUp">
                        <div class="recommendations-container-inner" :style="[{left: slideOffset + 'px'}, isNavigationClicked ? { transition: 'left ' + widgetItem.carouselData.animationSpeed + 'ms'} : {transition : 'none'} ]">
                            <recommendations-item class="recommendations-item"
                                                  v-for="result in widgetItem.recommendationItems"
                                                  :key="result.id"
                                                  :result="result"
                                                  :requestId="requestId"
                                                  :widgetGuid="widgetGuid"
                                                  :style="{ width: itemWidth + 'px'}"
                                                  :isItemClickable="isItemClickable"
                                                  ></recommendations-item>
                        </div>

                    </div>

                    <div v-if="widgetItem.carouselData.showNextPrevButtons" class="slider-button-next" @click="slide('next')" :style="{ height: itemHeight + 'px' }">
                        <right-chevron-svg icon-class="hawk-pagination__right" />
                    </div>

                    <div class="filler"></div>
                </div>
                <div v-if="widgetItem.carouselData.showDots" class="recommendations-navigation">
                    <div class="filler"></div>
                    <div v-for="index in Math.ceil(widgetItem.itemsCount / widgetItem.carouselData.scrollNumber)" :key="index" class="recommendations-navigation-item" @click="navigateTo(index)">
                    </div>
                    <div class="filler"></div>
                </div>
            </template>
            <template v-else>
                <recommendations-item class="recommendations-item"
                                      v-for="result in widgetItem.recommendationItems"
                                      :key="result.id"
                                      :result="result"
                                      :requestId="requestId"
                                      :widgetGuid="widgetGuid"></recommendations-item>
            </template>
        </template>

    </div>
</template>

<script>
    import RecommendationsItem from './RecommendationsItem'
    import PlaceholderItem from '../PlaceholderItem'
    import LeftChevronSvg from '../../svg/LeftChevronSvg'
    import RightChevronSvg from '../../svg/RightChevronSvg'

    export default {
        name: 'recommendations',
        components: {
            RecommendationsItem,
            PlaceholderItem,
            LeftChevronSvg,
            RightChevronSvg
        },
        props: {
            widgetGuid: {
                default: null
            },
            widgetUniqueid: {
                default: null
            }
        },
        mounted() {
            setTimeout(() => {
                this.componentWidth = this.$refs['recommendations-wrapper'].getBoundingClientRect().width;

                this.$root.$store.dispatch('fetchRecommendations', { widgetGuid: this.widgetGuid, widgetUniqueid: this.widgetUniqueid })
                    .then(response => {
                        var widgetItem = response.widgetItems.length ? response.widgetItems[0] : {};

                        if (widgetItem.recommendationItems && widgetItem.recommendationItems.length) {
                            if (!this.widgetGuid) {
                                this.widgetGuid = widgetItem.widgetGuid;
                            }

                            if (widgetItem.carouselData) {
                                this.itemWidth = Math.floor((this.componentWidth - (2 * this.filler)) / widgetItem.carouselData.nofVisible);
                            }

                            this.requestId = response.requestId;
                            this.widgetItem = widgetItem;
                        }
                    }, error => { })
            }, 2000)
        },
        data() {
            return {
                requestId: null,
                widgetItem: {},
                slideOffset: 0,
                componentWidth: 1000,
                itemWidth: 300,
                itemHeight: 300,
                filler: 100,
                showComponent: 0,
                positions: {
                clientX: 0,
                prevClientX: 0,
                movementX: 0,
                },
                isMouseDown: false,
                isNavigationClicked: false,
                isItemClickable: true
            }
        },
        created:function() {
        },
        methods: {
            onMouseUp: function (event) {
                this.isMouseDown = false;
                this.positions.prevClientX = 0
                this.positions.clientX = 0
                this.isNavigationClicked = true;
                setTimeout(() => { this.isItemClickable = true }, 200);
            },
            onMouseDown: function (event){
                this.positions.clientX = event.clientX;
                this.isMouseDown = true
                this.isNavigationClicked = false;
            },
            dragMouse: function (event) {
                if (this.isMouseDown == true) {
                    this.isItemClickable = false
                    let direction = null

                    if (this.positions.prevClientX == 0){
                        this.positions.movementX = this.positions.clientX - event.clientX
                    }
                    else {
                        this.positions.movementX = this.positions.prevClientX - event.clientX
                    }

                    this.positions.prevClientX = event.clientX

                    if (this.positions.movementX < 0) {
                        direction = 'prev'
                    }
                    else {
                        direction = "next"
                    }


                    if (direction == "prev" && this.slideOffset < 0) {
                        this.slideOffset += Math.abs(this.positions.movementX);
                    }
                    else if (direction == "next" && Math.abs(this.slideOffset) < ((this.widgetItem.recommendationItems.length - this.widgetItem.carouselData.nofVisible) * this.itemWidth)) {
                        this.slideOffset -= Math.abs(this.positions.movementX);
                    }
                }
            },
            slide: function (direction) {
                var delta = (this.widgetItem.carouselData.scrollNumber * this.itemWidth);
                this.isNavigationClicked = true;

                if (direction == "prev" && this.slideOffset < 0) {
                    this.slideOffset += delta;
                }
                else if (direction == "next" && Math.abs(this.slideOffset) < ((this.widgetItem.recommendationItems.length - this.widgetItem.carouselData.nofVisible) * this.itemWidth)) {
                    this.slideOffset -= delta;
                }
            },
            navigateTo: function (index) {
                this.slideOffset = -((index - 1) * (this.widgetItem.carouselData.scrollNumber * this.itemWidth));
            }
        },
        computed: {

        },
        watch: {
            widgetItem: function (item) {
                var height = 0;

                if (item && item.isCarousel && item.recommendationItems) {
                    setTimeout(() => {
                        var recommendationItems = this.$el.querySelectorAll("[class*=recommendations-item]");

                        if (recommendationItems.length) {
                            recommendationItems.forEach(recommendationItem => {
                                if (recommendationItem.getBoundingClientRect().height > height) {
                                    height = recommendationItem.getBoundingClientRect().height;
                                }
                            })

                            this.itemHeight = height;
                            this.showComponent = 1;
                        }
                    }, 1000)
                }
                else {
                    this.showComponent = 1;
                }
            }
        }
    }

</script>

<style scoped lang="scss">
.recommendations-container:hover {
    cursor: pointer;
}
</style>
