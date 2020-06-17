<template>
    <div class="hawk-sorting">
        <span class="hawk-sorting__label">{{ $t('Sort By') }}</span>

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
            onChange: function (e) {
                this.$root.$store.dispatch('applySort', e.target.value);
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            sorting: function () {
                return this.searchOutput ? this.searchOutput.Sorting : [];
            }
        }
    }


</script>

<style scoped lang="scss">

</style>
