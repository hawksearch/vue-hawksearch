<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-link">
            <div class="slider-numeric">
                <div class="dollar">{{facetData.CurrencySymbol}}<input v-model.lazy="minValue" style="padding-left: 15px;"  class="hawk-numericInput numeric-from" @change="applyFacet" type="text"></div>
                <div class="dollar">{{facetData.CurrencySymbol}}<input v-model.lazy="maxValue" style="padding-left: 15px;"  class="hawk-numericInput numeric-to" @change="applyFacet" type="text"></div>
            </div>
            <div class="slider" ref="wrapper">
                <div class="slider-background"></div>
                <div class="slider-wrapper">
                    <button type="button" @mousedown="onMouseDownMin" @touchstart="onMouseDownMin" class="slider-button" :style="minRangeStyle"></button>
                    <button type="button" @mousedown="onMouseDownMax" @touchstart="onMouseDownMax" class="slider-button" :style="maxRangeStyle"></button>
                </div>
                <div class="slider-progressbar" :style="sliderStyle"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import { addToRangeFacets } from '../../../QueryString';

    export default {
        name: 'slider',
        props: ['facetData'],
        mounted() {
            this.wrapper =  (this.$refs && this.$refs.wrapper.getBoundingClientRect) ? this.$refs.wrapper.getBoundingClientRect() : null;

            this.$root.$on('toggleFacetMenu', (isActive) => {
                    this.wrapper = this.$refs.wrapper.getBoundingClientRect();
            });

            addToRangeFacets(HawksearchVue.getFacetParamName(this.facetData));
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
                rangePrecision: 2,
                sliderPrecision: 0,
                inputLocked: false
            }
        },
        created: function () {
            window.addEventListener('mouseup', this.onMouseUp)
            window.addEventListener('mousemove', this.onMouseMove)
            window.addEventListener('resize', this.onResize);

            if (HawksearchVue.isMobile()) {
                window.addEventListener('touchend', this.onMouseUp)
            }
        },
        beforeDestroy: function () {
            window.removeEventListener('mouseup', this.onMouseUp)
            window.removeEventListener('mousemove', this.onMouseMove)
            window.removeEventListener('resize', this.onResize);

            if (HawksearchVue.isMobile()) {
                window.removeEventListener('touchend', this.onMouseUp)
            }
        },
        methods: {
            onMouseDownMin: function (e) {
                this.target = 'min';

                if (HawksearchVue.isMobile()) {
                    window.addEventListener('touchmove', this.onMouseMove, { passive: false })
                }
            },
            onMouseDownMax: function (e) {
                this.target = 'max';

                if (HawksearchVue.isMobile()) {
                    window.addEventListener('touchmove', this.onMouseMove, { passive: false })
                }
            },
            onMouseMove: function (e) {
                var clientX = e.clientX;

                if (HawksearchVue.isMobile() && e.changedTouches && e.changedTouches.length == 1) {
                    clientX = e.changedTouches[0].clientX;
                }

                if (this.target && !this.inputLocked) {
                    var temp = (clientX - this.wrapper.left);
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

                e.preventDefault();
                e.stopPropagation();
            },
            onMouseUp: function (e) {
                if (this.target && !this.inputLocked) {
                    if (this.handleAction()) {
                        this.applyFacet();
                    }

                    this.target = null;

                    if (HawksearchVue.isMobile()) {
                        window.removeEventListener('touchmove', this.onMouseMove)
                    }
                }
            },
            onResize: function(){
                if (this.$refs && this.$refs.wrapper.getBoundingClientRect) {
                    this.wrapper = this.$refs.wrapper.getBoundingClientRect();
                    this.updateMaxTemp();
                    this.updateMinTemp();
                }
            },
            handleAction: function () {
                var minValue = this.valueConvert(this.minTemp);
                var maxValue = this.valueConvert(this.maxTemp);
                var updated = false;

                if (this.minTemp == (this.maxTemp - this.buttonWidth)) {
                    if (this.target == 'min') {
                        minValue = maxValue
                    }
                    else {
                        maxValue = minValue
                    }
                }

                if (this.validSelection({ minValue, maxValue })) {
                    if (minValue != this.minValue && this.target == 'min') {
                        this.minValue = minValue;
                        this.updateMinTemp();
                        updated = true;
                    }

                    if (maxValue != this.maxValue && this.target == 'max') {
                        this.maxValue = maxValue;
                        this.updateMaxTemp();
                        updated = true;
                    }
                }

                return updated;
            },
            applyFacet: function () {
                var minValue = this.valueRound(this.minValue, this.rangePrecision);
                var maxValue = this.valueRound(this.maxValue, this.rangePrecision); 
                if (this.validSelection({ minValue, maxValue })) {
                    this.userInput = true;
                    var facetData = Object.assign({}, this.facetData);
                    facetData.Value = this.minValue + ',' + this.maxValue;
                    this.$root.dispatchToStore('applyFacets', facetData);                 
                }
            },
            validSelection: function ({ minValue, maxValue }) {
                if (minValue <= maxValue &&
                    minValue >= this.valueRound(this.facetValue.RangeMin, this.rangePrecision) &&
                    maxValue <= this.valueRound(this.facetValue.RangeMax, this.rangePrecision)) {

                    return true;
                }

                return false;
            },
            valueConvert: function (temp) {
                var x = temp;
                var m = this.valueRound(this.facetValue.RangeMax, this.rangePrecision);
                var k = this.valueRound(this.facetValue.RangeMin, this.rangePrecision);
                var n = this.wrapper.width;
                var precision = this.sliderPrecision;

                if (temp == 0 || temp == n) {
                    precision = this.rangePrecision;
                }

                return this.valueRound(((m - k) * x + n * k) / n, precision);
            },
            tempConvert: function (value) {
                var y = this.valueRound(value, this.rangePrecision);
                var m = this.valueRound(this.facetValue.RangeMax, this.rangePrecision);
                var k = this.valueRound(this.facetValue.RangeMin, this.rangePrecision);
                var n = this.wrapper.width;
                var precision = this.sliderPrecision;

                if (value == k || value == m) {
                    precision = this.rangePrecision;
                }

                if (m == k) {
                    return k == 0 ? 0 : n;
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
                    this.cache = this.cache.map(item => lodash.isEqual(item, existingCache) ? newCache : existingCache);
                }
            },
            valueRound: function (value, precision) {
                return lodash.round(parseFloat(value), precision);
            },
            updateMinTemp: function () {
                if (parseFloat(this.maxValue) >= parseFloat(this.minValue) && parseFloat(this.minValue) >= this.valueRound(this.facetValue.RangeMin, this.rangePrecision)) {
                    var temp = this.tempConvert(this.minValue);

                    if (this.maxValue == this.minValue && temp >= this.buttonWidth) {
                        temp -= this.buttonWidth
                    }

                    this.minTemp = temp;
                }
            },
            updateMaxTemp: function () {
                if (parseFloat(this.minValue) <= parseFloat(this.maxValue) && parseFloat(this.maxValue) <= this.valueRound(this.facetValue.RangeMax, this.rangePrecision)) {
                    var temp = this.tempConvert(this.maxValue);

                    if (this.maxValue == this.minValue && temp <= (this.wrapper.width - this.buttonWidth)) {
                        temp += this.buttonWidth
                    }

                    this.maxTemp = temp;
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
                    var selection = this.pendingSearch.FacetSelections[HawksearchVue.getFacetParamName(this.facetData)];
                    var facetValue = this.facetData.Values[0];
                    if (!selection) {
                        this.reset();
                    }
                    else {
                        try {
                            if (facetValue.RangeStart !== selection[0].split(',')[0]) {
                                facetValue.RangeStart = selection[0].split(',')[0];
                            }

                            if (facetValue.RangeEnd !== selection[0].split(',')[1]) {
                                facetValue.RangeEnd = selection[0].split(',')[1];
                            }
                        }
                        catch (e) { console.log(e) }
                    }

                    return facetValue;
                }
                else {
                    return {};
                }
            },
            minRangeStyle: function () {
                var left = this.minTemp;
                var diff = this.maxTemp - this.minTemp;
                var offset = lodash.ceil((this.buttonWidth - diff) / 2);

                if (diff < this.buttonWidth && this.minTemp >= offset) {
                    left -= offset;
                }

                return 'left: ' + left + 'px;';
            },
            maxRangeStyle: function () {
                var left = this.maxTemp;
                var diff = this.maxTemp - this.minTemp;
                var offset = lodash.ceil((this.buttonWidth - diff) / 2);

                if (diff < this.buttonWidth && this.maxTemp <= (this.wrapper.width - offset)) {
                    left += offset;
                }

                return 'left: ' + left + 'px;';
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
                    this.inputLocked = false;
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
                        this.minValue = this.valueRound(n.RangeStart, this.rangePrecision);
                        this.maxValue = this.valueRound(n.RangeEnd, this.rangePrecision);
                    }

                    if (this.minValue != this.maxValue) {
                        this.inputLocked = false;
                        this.updateMinTemp();
                        this.updateMaxTemp();
                    }
                    else {
                        this.inputLocked = true;

                        setTimeout(() => {
                            this.minTemp = 0;
                            this.maxTemp = this.tempConvert(this.maxValue);
                        }, 100)
                    }
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
    .slider-numeric{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }   
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
    .dollar{
        display: flex;
        width: 25%;
    }
</style>
