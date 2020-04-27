<template lang="html">
    <div class="hawk-sorting">
        <span class="hawk-sorting__label">Sort By</span>

        <select @change="onChange">
            <option v-for="(sortingItem, key) in sorting.Items" :key="sortingItem.Value" :value="sortingItem.Value">
                {{ sortingItem.Label }}
            </option>
        </select>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'sorting',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            onChange: function () {
                console.log("Change sorting");
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            sorting: function () {
                return this.searchOutput.Sorting;
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
