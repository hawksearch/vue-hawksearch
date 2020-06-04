<template>
    <div v-if="searchOutput" class="hawk-tool-row">
        <div class="hawk-tool-row__item">
            <sorting />
        </div>

        <div class="hawk-tool-row__item">
            <pagination />
        </div>
    </div>
</template>

<script lang="js">
    import Sorting from './tools/Sorting'
    import Pagination from './tools/Pagination'
    import { mapState } from 'vuex';

    export default {
        name: 'tool-row',
        components: {
            Sorting,
            Pagination
        },
        computed: {
            ...mapState([
                'searchOutput'
            ])
        }
    }

</script>

<style scoped lang="scss">
</style>
