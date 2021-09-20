<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-link">
            <div class="hawk-open-range">
                <input type="text" class="hawk-text-input value-start" v-model="minValue" @change="onChange" />
                <input type="text" class="hawk-text-input value-end" v-model="maxValue" @change="onChange" />
            </div>
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import { addToRangeFacets } from '../../../QueryString';

    export default {
        name: 'open-range',
        props: ['facetData'],
        mounted() {
            addToRangeFacets(HawksearchVue.getFacetParamName(this.facetData));
        },
        data() {
            return {
                minValue: 0,
                maxValue: 0
            }
        },
        methods: {
            onChange: function () {
                var currentMinValue = JSON.parse(JSON.stringify(this.minValue));
                var currentMaxValue = JSON.parse(JSON.stringify(this.maxValue));

                if (Number(this.minValue) <= Number(this.maxValue)) {
                    console.log("running");
                    var facetData = Object.assign({}, this.facetData);
                    facetData.Value = this.minValue + ',' + this.maxValue;
                    this.$root.dispatchToStore('applyFacets', facetData);
                }
                else {
                    var field = this.facetData.ParamName ? this.facetData.ParamName : this.facetData.Field;
                    this.$root.dispatchToStore('clearFacet', field);
                }
            },
            // validSelection: function ({ minValue, maxValue }) {
            //     if (minValue <= maxValue &&
            //         minValue >= Number(currentMinValue) &&
            //         maxValue <= Number(urrentMaxValue)) {

            //         return true;
            //     }

            //     return false;
            // },
        },
        computed: {
            ...mapState([
                'pendingSearch'
            ]),
            facetValue: function () {
                if (this.facetData && this.facetData.Values && this.facetData.Values.length) {
                    var selection = this.pendingSearch.FacetSelections[HawksearchVue.getFacetParamName(this.facetData)];
                    var facetValue = this.facetData.Values;
                    console.log(facetValue);
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
                        this.minValue = this.valueRound(n.RangeStart, this.rangePrecesion);
                        this.maxValue = this.valueRound(n.RangeEnd, this.rangePrecesion);
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
            }
        }

    }


</script>

<style scoped lang="scss">
</style>
