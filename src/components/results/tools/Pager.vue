<template>
    <div class="hawk-pagination__controls">
        <button class="hawk-pagination__item" @click="goToPreviousPage">
            <left-chevron-svg icon-class="hawk-pagination__left" />
        </button>
        <input type="number" :value="page" @change="onChange" :class="hasError ? 'hawk-pagination__input error' : 'hawk-pagination__input'" min="1" :max="totalPages" />
        <span class="hawk-pagination__total-text"><span class="break"></span> of {{ totalPages }}</span>
        <button class="hawk-pagination__item" @click="goToNextPage">
            <right-chevron-svg icon-class="hawk-pagination__right" />
        </button>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import LeftChevronSVG from '../../svg/LeftChevronSVG'
    import RightChevronSVG from '../../svg/RightChevronSVG'

    export default {
        name: 'pager',
        props: [],
        components: {
            LeftChevronSVG,
            RightChevronSVG
        },
        mounted() {

        },
        data() {
            return {
                hasError: false
            }
        },
        methods: {
            goToPreviousPage: function () {
                if (this.page > 1) {
                    this.goToPage(parseInt(this.page, 10) - 1);
                }
            },
            goToNextPage: function () {
                if (this.page < this.totalPages) {
                    this.goToPage(parseInt(this.page, 10) + 1);
                }
            },
            goToPage: function (page) {
                if (page >= 1 && page <= this.totalPages) {
                    this.$root.dispatchToStore('applyPageNumber', page);
                }
            },
            onChange: function (e) {
                this.goToPage(parseInt(e.target.value, 10));
            },
            onInput: function (e) {
                let wantedPageNo = parseInt(e.currentTarget.value, 10);

                if (wantedPageNo > this.totalPages) {
                    wantedPageNo = this.totalPages;
                    e.currentTarget.value = "";
                    e.preventDefault();
                }

                if (wantedPageNo < 1) {
                    wantedPageNo = 1;
                    e.currentTarget.value = "";
                    e.preventDefault();
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
            }
        }
    }


</script>

<style scoped lang="scss">
    .break {
        width: 6px;
        display: inline-block;
    }
</style>
