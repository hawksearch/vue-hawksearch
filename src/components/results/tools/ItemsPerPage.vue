<template lang="html">
    <div class="hawk-items-per-page">
        <select value="pagination.MaxPerPage" @change={onChange}>
            <option v-for="paginationItem in pagination.Items" :key="paginationItem.PageSize" :value="paginationItem.PageSize">
                {{ paginationItem.Label }}
            </option>
        </select>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'items-per-page',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            onChange: () => {

            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            pagination: function () {
                return this.searchOutput.Pagination;
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
