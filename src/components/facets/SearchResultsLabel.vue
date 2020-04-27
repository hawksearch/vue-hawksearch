<template lang="html">
    <div className="hawk-facet-rail__results-label">
        <h3>Search Results {{ keyword ? 'for ' + keyword : null }}</h3>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'search-results-label',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            keyword: function () {
                return this.searchOutput.Keyword;
            }
        }
    }

</script>

<style scoped lang="scss">

</style>
