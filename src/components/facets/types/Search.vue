<template>
    <div>
        <div class="hawk-facet-rail__facet-values">
            <div class="hawk-facet-rail__facet-values__search">
                <input v-model="value" @change="search" />
            </div>
        </div>
        <div v-if="value" class="hawk-facet-rail__facet-values__search-clear">
            <button class="link-button" @click="clearFacet">
                Clear
            </button>
        </div>
    </div>
</template>

<script lang="js">

    export default {
        name: 'search',
        props: [],
        mounted() {

        },
        data() {
            return {
                value: null
            }
        },
        methods: {
            search: function (value) {
                if (this.value) {
                    this.$root.$store.dispatch('applySearchWithin', this.value);
                }
            },
            clearFacet: function () {
                if (this.value) {
                    this.$root.$store.dispatch('clearFacet', 'SearchWithin');
                    this.value = null;
                }
            }
        },
        computed: {

        }
    }


</script>

<style scoped lang="scss">
</style>
