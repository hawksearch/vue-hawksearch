<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-link">
            <div class="hawk-sliderNumeric">
                <input v-model.lazy="minValue" class="hawk-numericInput numeric-from" @change="applyFacet" type="text">
                <input v-model.lazy="maxValue" class="hawk-numericInput numeric-to" @change="applyFacet" type="text">
            </div>
            <div class="slider" ref="wrapper">
                <div class="slider-background"></div>
                <div class="slider-wrapper">
                    <button type="button" @mousedown="onMouseDownMin" class="slider-button" :style="minRangeStyle"></button>
                    <button type="button" @mousedown="onMouseDownMax" class="slider-button" :style="maxRangeStyle"></button>
                </div>
                <div class="slider-progressbar" :style="sliderStyle"></div>
            </div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'slider',
        props: ['facetData'],
        mounted() {
            this.wrapper = this.$refs.wrapper.getBoundingClientRect();
        },
        data() {
            return {
                target: null,
                wrapper: null,
                minTemp: 0,
                maxTemp: 100,
                minValue: 0,
                maxValue: 1,
                parsedData: false,
                buttonWidth: 23
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
            onMouseDownMin: function (e) {
                this.target = 'min';
            },
            onMouseDownMax: function (e) {
                this.target = 'max';
            },
            onMouseMove: function (e) {
                if (this.target) {
                    var temp = (e.clientX - this.wrapper.left);
                    var buttonWidth = this.buttonWidth;

                    if (this.target == 'max') {
                        if (temp <= this.wrapper.width && temp > (this.minTemp + buttonWidth)) {
                            this.maxTemp = temp;
                        }
                        else if (temp > this.wrapper.width) {
                            this.maxTemp = this.wrapper.width;
                        }
                        else if (temp <= (this.minTemp + buttonWidth)) {
                            this.maxTemp = (this.minTemp + buttonWidth);
                        }
                    }
                    else if (this.target == 'min') {
                        if (temp >= 0 && temp < (this.maxTemp - buttonWidth)) {
                            this.minTemp = temp;
                        }
                        else if (temp < 0) {
                            this.minTemp = 0;
                        }
                        else if (temp >= (this.maxTemp - buttonWidth)) {
                            this.minTemp = (this.maxTemp - buttonWidth);
                        }
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
                this.minValue = Math.round(this.minTemp / this.facetValue.ratio);
                this.maxValue = Math.round(this.maxTemp / this.facetValue.ratio);
            },
            applyFacet: function () {
                if (parseFloat(this.minValue) < parseFloat(this.maxValue) &&
                    parseFloat(this.minValue) >= parseFloat(this.facetValue.RangeMin) &&
                    parseFloat(this.maxValue) <= parseFloat(this.facetValue.RangeMax)) {

                    var facetData = Object.assign({}, this.facetData);
                    facetData.Value = this.minValue + ',' + this.maxValue;
                    this.$root.$store.dispatch('applyFacets', facetData);
                }
            }
        },
        computed: {
            facetValue: function () {
                if (this.facetData && this.facetData.Values && this.facetData.Values.length && this.wrapper) {
                    var facetValue = this.facetData.Values[0];

                    var ratio = this.wrapper.width / (parseFloat(facetValue.RangeMax) - parseFloat(facetValue.RangeMin));

                    facetValue.ratio = ratio;

                    return facetValue;
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
            }
        },
        watch: {
            facetValue: function (n, o) {
                if (n.ratio) {
                    if (!this.parsedData) {
                        this.minValue = parseFloat(n.RangeStart);
                        this.maxValue = parseFloat(n.RangeEnd);
                        this.parsedData = true;
                    }
                    else {
                        if (this.maxValue > n.RangeMax) {
                            this.maxValue = parseFloat(n.RangeMax)
                        }

                        if (this.minValue > n.RangeMin) {
                            this.minValue = parseFloat(n.RangeMin)
                        }
                    }
                }
            },
            minValue: function (n, o) {
                if (parseFloat(this.maxValue) > parseFloat(n) && parseFloat(n) >= parseFloat(this.facetValue.RangeMin)) {
                    this.minTemp = Math.round(parseFloat(n) * this.facetValue.ratio);
                }
            },
            maxValue: function (n, o) {
                if (parseFloat(this.minValue) < parseFloat(n) && parseFloat(n) <= parseFloat(this.facetValue.RangeMax)) {
                    this.maxTemp = Math.round(parseFloat(n) * this.facetValue.ratio);
                }
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
