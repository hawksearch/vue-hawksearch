<template v-if="showItems">
    <div class="hawk-items-per-page">
        
        <select :value="pagination.MaxPerPage" @change="onChange">
            <option v-for="paginationItem in paginationItems" :key="paginationItem.PageSize" :value="paginationItem.PageSize">
                {{ paginationItem.Label }}
            </option>
        </select>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    import CustomSelect from './CustomSelect'

    export default {
        name: 'items-per-page',
        components: {
            CustomSelect
        },
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            onChange: function (e) {
                this.$root.dispatchToStore('applyPageSize', e.target.value);
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            pagination: function () {
                return this.searchOutput ? this.searchOutput.Pagination : {};
            },
            paginationItems: function () {
                return this.searchOutput && 
                    this.searchOutput.Pagination &&
                    this.searchOutput.Pagination.Items && 
                    this.searchOutput.Pagination.Items.length ? this.searchOutput.Pagination.Items : [];
            },
            showItems: function () {
                return this.paginationItems.length > 0;
            }
        }
    }


</script>

<style scoped lang="scss">
    .custom-select-wrapper {
        width: 180px;
    }
</style>
