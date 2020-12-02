<template>
    <div class="hawk-items-per-page">
        <div v-if="showItems" class="custom-select-wrapper">
            <CustomSelect
                :options="itemsLables"
                :default="selectedItem || defaultItem"
                class="select"
                @change="onChange"
                />
        </div>
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
            selectClick(option) {
                var selectedPageSize = this.paginationItems.find(item => item.Label == option).PageSize.toString()
                this.$root.dispatchToStore('applyPageSize', selectedPageSize);
            },
            onChange: function (e) {
                this.$root.dispatchToStore('applyPageSize', e.target.value);
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            paginationItems: function () {
                return this.searchOutput && 
                    this.searchOutput.Pagination &&
                    this.searchOutput.Pagination.Items && 
                    this.searchOutput.Pagination.Items.length ? this.searchOutput.Pagination.Items : [];
            },
            showItems: function () {
                return this.paginationItems.length > 0;
            },
            itemsLables: function () {
                return this.paginationItems ? this.paginationItems.map(item => item.Label) : [];
            },
            selectedItem: function () {
                return this.paginationItems ? this.paginationItems.find(item => !!item.Selected).Label : null;
            },
            defaultItem: function () {
                return this.paginationItems ? this.paginationItems.find(item => !!item.Default).Label : null;
            }
        }
    }


</script>

<style scoped lang="scss">
    .custom-select-wrapper {
        width: 180px;
    }
</style>
