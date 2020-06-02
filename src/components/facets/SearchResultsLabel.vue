<template>
    <div className="hawk-facet-rail__results-label">
        <h3>
            <template v-if="keyword">
                {{ $t('Search Results for') }} {{ keyword }}
            </template>
            <template v-else>
                {{ $t('Search Results') }}
            </template>
        </h3>
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
