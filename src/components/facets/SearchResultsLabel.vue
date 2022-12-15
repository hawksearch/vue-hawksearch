<template>
    <div v-if="keyword" class="hawk-facet-rail__results-label">
        <h3>
            {{ $t('Search Results for') }} {{ keyword }}
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
            return {}
        },
        methods: {

        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            keyword: function () {
                return this.searchOutput ? this.searchOutput.Keyword : null;
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
