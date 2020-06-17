<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-link">
            <div class="hawk-sliderNumeric">
                <input v-model="facetValue.RangeStart" class="hawk-numericInput numeric-from" min="0" max="5" type="text" value="2">
                <input v-model="facetValue.RangeEnd" class="hawk-numericInput numeric-to" min="0" max="5" type="text" value="5">
            </div>
            <div class="slider" ref="wrapper">
                <div class="slider-background"></div>
                <div class="slider-wrapper" ref="wrapper">
                    <button ref="min" type="button" @mousedown="onMouseDown" class="slider-button" :style="minRangeStyle"></button>
                    <button ref="max" type="button" @mousedown="onMouseDown" class="slider-button" :style="maxRangeStyle"></button>
                </div>
                <div ref="bar" class="slider-progressbar" :style="sliderStyle"></div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'slider',
        props: ['facetData'],
        mounted() {

        },
        data() {
            return {
                target: null,
                minTemp: 0,
                maxTemp: 100,
                minValue: null,
                maxValue: null
            }
        },
        created: function () {
            window.addEventListener('mouseup', (e) => { this.onMouseUp(e) })
            window.addEventListener('mousemove', (e) => { this.onMouseMove(e) })
        },
        beforeDestroy: function () {
            window.removeEventListener('mouseup', (e) => { this.onMouseUp(e) })
            window.removeEventListener('mousemove', (e) => { this.onMouseMove(e) })
        },
        methods: {
            onMouseDown: function (e) {
                this.target = e.target;
            },
            onMouseMove: function (e) {
                if (this.target) {
                    var left = (e.clientX - 12);
                    var wrapper = this.$refs.wrapper.getBoundingClientRect();
                    var wrapperLeft = wrapper.left + 26;
                    var wrapperRight = wrapper.right + 26;

                    if (left > wrapperLeft && left < wrapperRight) {
                        if (this.target == this.$refs.min) {
                            this.minTemp = left;
                        }
                        else if (this.target == this.$refs.max) {
                            this.maxTemp = left;
                        }
                    }
                    else {
                        this.target = null
                    }
                }
            },
            onMouseUp: function (e) {
                if (this.target) {
                    this.target = null;
                    this.handleAction();
                    this.applyFacet();
                }
            },
            handleAction: function () {
                this.minValue = Math.round(this.minTemp / this.ratio);
                this.maxValue = Math.round(this.maxTemp / this.ratio);
            },
            applyFacet: function () {
                //this.facetData.Value = (this.minValue || '') + ',' + (this.maxValue || '');
                //this.$root.$store.dispatch('applyFacets', this.facetData);
            }
        },
        computed: {
            facetValue: function () {
                if (this.facetData && this.facetData.Values && this.facetData.Values.length) {
                    return this.facetData.Values[0];
                }
                else {
                    return {};
                }
            },
            minRangeStyle: function () {
                var aggrValue = this.minTemp;
                return 'left: ' + aggrValue + 'px;';
            },
            maxRangeStyle: function () {
                var aggrValue = this.maxTemp;
                return 'left: ' + aggrValue + 'px;';
            },
            sliderStyle: function () {
                var left = this.minTemp;
                var width = this.maxTemp - this.minTemp;
                return 'left: ' + left + 'px; width: ' + width + 'px;';
            },
            ratio: function () {
                return this.$refs.wrapper.getBoundingClientRect().width / (parseInt(this.facetValue.RangeMax, 10) - parseInt(this.facetValue.RangeMin, 10))
            }
        }
    }


</script>

<style scoped lang="scss">
    .slider {
        position: relative;
        overflow: visible;
        margin: 0 10px;
    }

    .slider-background {
        height: 15px;
        top: -2px;
        left: -2px;
        bottom: 4px;
        width: 100%;
        background-color: #fcfcfc;
        border: 1px solid #d8d8d8;
        position: relative;
    }

    .slider-wrapper {
        height: 15px;
        top: -2px;
        left: -2px;
        bottom: 4px;
        width: 100%;
        position: absolute;
    }

    .slider-button {
        margin-left: -12px;
        top: -5px;
        width: 24px;
        height: 24px;
        border: 1px solid #d8d8d8;
        background-color: #fcfcfc;
        border-radius: 20%;
        outline: none;
        z-index: 2;
        box-shadow: 0 2px 2px #dbdbdb;
        position: absolute;
        cursor: pointer;
    }

        .slider-button:before {
            top: 7px;
            height: 10px;
            width: 1px;
            left: 10px;
            content: "";
            display: block;
            position: absolute;
            background-color: #dadfe8;
        }

        .slider-button:after {
            top: 7px;
            height: 10px;
            width: 1px;
            left: 13px;
            content: "";
            display: block;
            position: absolute;
            background-color: #dadfe8;
        }

    .slider-progressbar {
        height: 13px;
        top: 0;
        background-color: #3f4044;
        position: absolute;
    }
</style>
