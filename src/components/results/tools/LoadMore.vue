<template>
    <div class="hawk-pagination__load-more">
        <div v-if="!noMoreResults" class="hawk-pagination__load-more-btn" v-on:click="loadMoreResults">Load more</div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'load-more',
        data() {
            return {
                hasError: false
            }
        },
        methods: {
            loadMoreResults: function () {
                this.$root.dispatchToStore('loadMoreResults');
                var page = this.page + 1;

                if (page >= 1 && page <= this.totalPages) {
                }
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            pagination: function () {
                return this.searchOutput ? this.searchOutput.Pagination : {};
            },
            page: function () {
                return this.pagination.CurrentPage;
            },
            totalPages: function () {
                return this.pagination.NofPages;
            },
            noMoreResults: function () {
                return this.page == this.totalPages
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
