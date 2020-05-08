<template>
    <div>
        <div class="hawk-facet-rail__facet-values">
            <div class="hawk-facet-rail__facet-values__search">
                <input v-model="value" @keydown="onKeyDown" />
            </div>
        </div>
        <div v-if="false" class="hawk-facet-rail__facet-values__search-clear">
            <button class="link-button" onClick={clearFacet}>
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
            onKeyDown: function () {
                console.log("Search facets enter");
            }
        },
        computed: {

        }
    }


</script>

<style scoped lang="scss">

</style>
