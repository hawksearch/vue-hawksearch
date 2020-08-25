<template>
    <div v-if="!waitingForInitialSearch" class="hawk-facet-rail">
        <div class="hawk-facet-rail__heading">{{ $t('Narrow Results') }}</div>

        <div class="hawk-facet-rail__facet-list">
            <template v-if="facets && facets.length">
                <facet v-for="facetData in facets" :key="facetData.FacetId" :facet-data="facetData"></facet>
            </template>
            <template v-else-if="loadingResults">
                <placeholder-facet v-for="index in 4" :key="index"></placeholder-facet>
            </template>
            <template v-else>
                <div class="hawk-facet-rail_empty"></div>
            </template>
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import Facet from './Facet';
    import PlaceholderFacet from './PlaceholderFacet';

    export default {
        name: 'facet-list',
        props: [],
        components: {
            Facet,
            PlaceholderFacet
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
                'extendedSearchParams',
                'waitingForInitialSearch',
                'loadingResults'
            ]),
            facets: function () {
                return (this.extendedSearchParams && this.extendedSearchParams.Facets) ? this.extendedSearchParams.Facets.filter(facet => facet.FieldType != 'tab') : null;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
