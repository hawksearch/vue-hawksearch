<template>
    <div v-if="isVisible" class="hawk-facet-rail">
        <div class="hawk-facet-rail__heading">{{ $t('Narrow Results') }}</div>

        <div class="hawk-facet-rail__facet-list">
            <facet v-for="facetData in facets" :key="facetData.FacetId" :facet-data="facetData"></facet>
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
            },
            isVisible: function () {
                if (this.extendedSearchParams) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
