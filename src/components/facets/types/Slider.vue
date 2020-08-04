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
                componentReset: true,
                rangePrecesion: 2,
                sliderPrecision: 0
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
                if (this.target && !this.lockCondition()) {
                    var temp = (e.clientX - this.wrapper.left);
                    var buttonWidth = this.buttonWidth;
                    var minButtonPosition = (this.minTemp + buttonWidth);
                    var maxButtonPosition = (this.maxTemp - buttonWidth);

                    if (this.target == 'max') {
                        if (temp <= this.wrapper.width && temp > minButtonPosition) {
                            this.maxTemp = temp;
                        }
                        else if (temp > this.wrapper.width) {
                            this.maxTemp = this.wrapper.width;
                        }
                        else if (temp <= minButtonPosition && minButtonPosition < this.wrapper.width) {
                            this.maxTemp = minButtonPosition;
                        }
                    }
                    else if (this.target == 'min') {
                        if (temp >= 0 && temp < maxButtonPosition) {
                            this.minTemp = temp;
                        }
                        else if (temp < 0) {
                            this.minTemp = 0;
                        }
                        else if (temp >= maxButtonPosition && maxButtonPosition > 0) {
                            this.minTemp = maxButtonPosition;
                        }
                    }
                }
            },
            onMouseUp: function (e) {
                if (this.target) {
                    if (this.handleAction(this.target)) {
                        this.applyFacet();
                    }

                    this.target = null;
                }
            },
            lockCondition: function () {
                if (parseFloat(this.facetValue.RangeMax) - parseFloat(this.facetValue.RangeMin) > 1) {
                    return false;
                }

                return true
            },
            handleAction: function (target) {
                var minValue = this.valueConvert(this.minTemp);
                var maxValue = this.valueConvert(this.maxTemp);
                var updated = false;

                if (minValue < maxValue &&
                    minValue >= this.valueRound(this.facetValue.RangeMin, this.rangePrecesion) &&
                    maxValue <= this.valueRound(this.facetValue.RangeMax, this.rangePrecesion)) {

                    if (minValue != this.minValue && target == 'min') {
                        this.minValue = minValue;
                        this.updateMinTemp();
                        updated = true;
                    }

                    if (maxValue != this.maxValue && target == 'max') {
                        this.maxValue = maxValue;
                        this.updateMaxTemp();
                        updated = true;
                    }
                }

                return updated;
            },
            applyFacet: function () {
                var minValue = this.valueRound(this.minValue, this.rangePrecesion);
                var maxValue = this.valueRound(this.maxValue, this.rangePrecesion);

                if (minValue < maxValue &&
                    minValue >= this.valueRound(this.facetValue.RangeMin, this.rangePrecesion) &&
                    maxValue <= this.valueRound(this.facetValue.RangeMax, this.rangePrecesion)) {

                    this.userInput = true;

                    var facetData = Object.assign({}, this.facetData);
                    facetData.Value = this.minValue + ',' + this.maxValue;
                    this.$root.$store.dispatch('applyFacets', facetData);
                }
            },
            valueConvert: function (temp) {
                var x = temp;
                var m = this.valueRound(this.facetValue.RangeMax, this.rangePrecesion);
                var k = this.valueRound(this.facetValue.RangeMin, this.rangePrecesion);
                var n = this.wrapper.width;
                var precision = this.sliderPrecision;

                if (temp == 0 || temp == n) {
                    precision = this.rangePrecesion;
                }

                return this.valueRound(((m - k) * x + n * k) / n, precision);
            },
            tempConvert: function (value) {
                var y = this.valueRound(value, this.rangePrecesion);
                var m = this.valueRound(this.facetValue.RangeMax, this.rangePrecesion);
                var k = this.valueRound(this.facetValue.RangeMin, this.rangePrecesion);
                var n = this.wrapper.width;
                var precision = this.sliderPrecision;

                if (value == k || value == m) {
                    precision = this.rangePrecesion;
                }

                return this.valueRound((n * (y - k)) / (m - k), precision);
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
            valueRound: function (value, precision) {
                return _.round(parseFloat(value), precision);
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
                        this.minValue = this.valueRound(n.RangeStart, this.rangePrecesion);
                        this.maxValue = this.valueRound(n.RangeEnd, this.rangePrecesion);
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
