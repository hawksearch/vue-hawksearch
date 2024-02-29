<template>
    <div v-if="keyword" class="hawk-facet-rail__results-label">
        <h3>
            {{ $t('Search Results for') }} {{ keyword }}
        </h3>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'search-results-label',
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
