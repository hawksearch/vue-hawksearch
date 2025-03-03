<template>
    <div v-if="searchOutput" class="hawk-tool-row" @click="onClick">
        <div class="hawk-tool-row__item">
            <sorting />
        </div>

        <div class="hawk-tool-row__item">
            <pagination />
        </div>
    </div>
</template>

<script>
    import Sorting from './tools/Sorting.vue'
    import Pagination from './tools/Pagination.vue'
    import { mapState } from 'vuex';

    export default {
        name: 'tool-row',
        components: {
            Sorting,
            Pagination
        },
        methods: {
            onClick: function (e) {
                e.stopPropagation();
            }
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
