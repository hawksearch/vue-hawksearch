<template>
    <div v-if="extendedSearchParams" class="hawk-facet-rail">
        <div class="hawk-facet-rail__heading">Narrow Results</div>

        <div class="hawk-facet-rail__facet-list">
            <template v-for="facetData in facets">
                <facet :facet-data="facetData"></facet>
            </template>
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import Facet from './Facet';

    export default {
        name: 'facet-list',
        props: [],
        components: {
            Facet
        },
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
                'extendedSearchParams'
            ]),
            facets: function () {
                return this.extendedSearchParams.Facets;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
