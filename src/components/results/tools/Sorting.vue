<template>
    <div class="hawk-sorting">
        <span class="hawk-sorting__label">{{ $t('Sort By') }}</span>

        <div v-if="showItems" class="custom-select-wrapper">
            <CustomSelect
                :options="items"
                :default="selectedItem || defaultItem"
                class="select"
                />
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    import CustomSelect from './CustomSelect'

    export default {
        name: 'sorting',
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
                var selectedValue = this.sortingItems.find(item => item.Label == option).Value
                this.$root.dispatchToStore('applySort', selectedValue);
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            sortingItems: function () {
                return this.searchOutput && 
                    this.searchOutput.Sorting && 
                    this.searchOutput.Sorting.Items && 
                    this.searchOutput.Sorting.Items.length ? this.searchOutput.Sorting.Items : [];
            },
            showItems: function () {
                return this.sortingItems.length > 0;
            },
            items: function () {
                return this.sortingItems ? this.sortingItems.map(item => item.Label) : [];
            },
            selectedItem: function () {
                return this.sortingItems ? this.sortingItems.find(item => !!item.Selected).Label : null;
            },
            defaultItem: function () {
                return this.sortingItems ? this.sortingItems.find(item => !!item.IsDefault).Label : null;
            }
        }
    }


</script>

<style scoped lang="scss">
    .custom-select-wrapper {
        width: 130px;
    }
</style>
