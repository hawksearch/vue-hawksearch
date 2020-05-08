<template>
    <div class="hawk-tool-row">
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

    export default {
        name: 'tool-row',
        props: [],
        components: {
            Sorting,
            Pagination
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

        }
    }

</script>

<style scoped lang="scss">
</style>
