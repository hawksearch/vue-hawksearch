<template v-if="showItems">
    <div class="hawk-sorting">
        <span class="hawk-sorting__label">{{ $t('Sort By') }}</span>

        <select @change="onChange">
            <option v-for="sortingItem in sortingItems" :key="sortingItem.Value" :value="sortingItem.Value" :selected="sortingItem.Selected">
                {{ sortingItem.Label }}
            </option>
        </select>
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
            onChange: function (e) {
                this.$root.dispatchToStore('applySort', e.target.value);
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            sorting: function () {
                return this.searchOutput ? this.searchOutput.Sorting : [];
            },
            sortingItems: function () {
                return this.searchOutput && 
                    this.searchOutput.Sorting && 
                    this.searchOutput.Sorting.Items && 
                    this.searchOutput.Sorting.Items.length ? this.searchOutput.Sorting.Items : [];
            },
            showItems: function () {
                return this.sortingItems.length > 0;
            }
        }
    }


</script>

<style scoped lang="scss">
    .custom-select-wrapper {
        width: 130px;
    }
</style>
