<template>
    <div>
        <div class="hawk-facet-rail__facet-values">
            <div class="hawk-facet-rail__facet-values__search">
                <input :value="searchString" @keydown="onKeyDown" @input="onInput" />
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
        props: {
            mode: {
                default: 'searchWithin'
            }
        },
        mounted() {

        },
        data() {
            return {
                searchTermBuffer: null
            }
        },
        methods: {
            onInput: function (event) {
                this.searchTermBuffer = event.target.value;
            },
            onKeyDown: function (event) {
                var value = event.target.value;

                if (event.key == 'Enter') {
                    if (this.searchTermBuffer !== value) {
                        this.searchTermBuffer = value;
                    }

                    this.search();
                }
            },
            search: function () {
                var value = this.searchTermBuffer;

                if (value) {
                    switch (this.mode) {
                        case 'search':
                            this.$root.dispatchToStore('fetchResults', { Keyword: value, PageNo: 1 });
                            break;

                        case 'searchWithin':
                        default:
                            this.$root.dispatchToStore('applySearchWithin', value);
                    }
                }
            },
            clearFacet: function () {
                if (this.searchString) {
                    this.searchTermBuffer = null;

                    switch (this.mode) {
                        case 'search':
                            this.$root.dispatchToStore('fetchResults', { Keyword: '', PageNo: 1 });
                            break;

                        case 'searchWithin':
                        default:
                            this.$root.dispatchToStore('clearFacet', 'SearchWithin');
                    }
                }
            }
        },
        computed: {
            ...mapState([
                'pendingSearch'
            ]),
            searchString: function () {
                if (this.pendingSearch) {
                    switch (this.mode) {
                        case 'search':
                            return this.pendingSearch.Keyword;
                            break;

                        case 'searchWithin':
                        default:
                            return this.pendingSearch.SearchWithin;
                    }
                }
            }
        },
        watch: {
            searchString: function (value) {
                this.searchTermBuffer = value;
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
