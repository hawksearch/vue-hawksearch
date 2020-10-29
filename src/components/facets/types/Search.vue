<template>
    <div>
        <div class="hawk-facet-rail__facet-values">
            <div class="hawk-facet-rail__facet-values__search">
                <input :value="searchString" @keydown="onKeyDown" />
            </div>
        </div>
        <div v-if="searchString" class="hawk-facet-rail__facet-values__search-clear">
            <button class="link-button" @click="clearFacet">
                {{ $t('Clear') }}
            </button>
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'search',
        props: [],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            onKeyDown: function (event) {
                if (event.key == 'Enter') {
                    var value = event.target.value;

                    if (value) {
                        this.$root.dispatchToStore('applySearchWithin', value);
                    }
                }
            },
            clearFacet: function () {
                if (this.searchString) {
                    this.$root.dispatchToStore('clearFacet', 'SearchWithin');
                }
            }
        },
        computed: {
            ...mapState([
                'pendingSearch'
            ]),
            searchString: function () {
                return this.pendingSearch ? this.pendingSearch.SearchWithin : null; 
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
