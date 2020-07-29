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
    import { mapState } from 'vuex';

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
                userInput: false,
                buttonWidth: 23,
                cache: [],
                componentReset: true
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
                this.minValue = this.valueConvert(this.minTemp);
                this.maxValue = this.valueConvert(this.maxTemp);

                this.updateMinTemp();
                this.updateMaxTemp();
            },
            applyFacet: function () {
                if (parseFloat(this.minValue) < parseFloat(this.maxValue) &&
                    parseFloat(this.minValue) >= parseFloat(this.facetValue.RangeMin) &&
                    parseFloat(this.maxValue) <= parseFloat(this.facetValue.RangeMax)) {

                    this.userInput = true;

                    var facetData = Object.assign({}, this.facetData);
                    facetData.Value = this.minValue + ',' + this.maxValue;
                    this.$root.$store.dispatch('applyFacets', facetData);
                }
            },
            valueConvert: function (temp) {
                return (Math.round(temp / this.facetValue.ratio) + this.facetValue.offset);
            },
            tempConvert: function (value) {
                return Math.round((parseFloat(value) - this.facetValue.offset) * this.facetValue.ratio);
            },
            fetchCache: function () {
                var cache;

                this.cache.forEach(item => {
                    if (item.RangeMax == this.facetValue.RangeMax &&
                        item.RangeMin == this.facetValue.RangeMin &&
                        item.RangeStart == this.facetValue.RangeStart &&
                        item.RangeEnd == this.facetValue.RangeEnd) {

                        cache = item;
                    }
                });

                return cache;
            },
            cacheData: function () {
                var newCache = Object.assign({ minValue: this.minValue, maxValue: this.maxValue }, this.facetValue);
                var existingCache = this.fetchCache();

                if (!existingCache) {
                    this.cache.push(newCache);
                }
                else {
                    this.cache = this.cache.map(item => _.isEqual(item, existingCache) ? newCache : existingCache);
                }
            },
            decimalRound: function (value) {
                return (Math.round(parseFloat(value) * 100) / 100);
            },
            updateMinTemp: function () {
                if (parseFloat(this.maxValue) > parseFloat(this.minValue) && parseFloat(this.minValue) >= parseFloat(this.facetValue.RangeMin)) {
                    this.minTemp = this.tempConvert(this.minValue);
                }
            },
            updateMaxTemp: function () {
                if (parseFloat(this.minValue) < parseFloat(this.maxValue) && parseFloat(this.maxValue) <= parseFloat(this.facetValue.RangeMax)) {
                    this.maxTemp = this.tempConvert(this.maxValue);
                }
            },
            reset: function () {
                this.cache = [];
                this.componentReset = true;
            }
        },
        computed: {
            ...mapState([
                'pendingSearch'
            ]),
            facetValue: function () {
                if (this.facetData && this.facetData.Values && this.facetData.Values.length && this.wrapper) {
                    if (!this.pendingSearch.FacetSelections.hasOwnProperty(HawksearchVue.getFacetParamName(this.facetData))) {
                        this.reset();
                    }

                    var facetValue = this.facetData.Values[0];

                    var ratio = this.wrapper.width / (parseFloat(facetValue.RangeMax) - parseFloat(facetValue.RangeMin));

                    facetValue.ratio = ratio;
                    facetValue.offset = this.decimalRound(facetValue.RangeMin);

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
                if (this.userInput) {
                    this.userInput = false;
                    this.cacheData();
                }
                else if (this.componentReset || o.RangeMax != n.RangeMax || o.RangeMin != n.RangeMin) {
                    this.componentReset = false;
                    var cache = this.fetchCache();

                    if (cache) {
                        this.minValue = cache.minValue;
                        this.maxValue = cache.maxValue;
                    }
                    else {
                        this.minValue = this.decimalRound(n.RangeStart);
                        this.maxValue = this.decimalRound(n.RangeEnd);
                    }

                    this.updateMinTemp();
                    this.updateMaxTemp();
                }
            },
            minValue: function (n, o) {
                this.updateMinTemp();
            },
            maxValue: function (n, o) {
                this.updateMaxTemp();
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
