<template>
    <div class="hawk-pagination__controls">
        <button class="hawk-pagination__item" @click="goToPreviousPage">
            <left-chevron-svg icon-class="hawk-pagination__left" />
        </button>
        <input type="number" :value="page" @change="onChange" :class="hasError ? 'hawk-pagination__input error' : 'hawk-pagination__input'" />
        <span class="hawk-pagination__total-text"><span class="break"></span> of {{ totalPages }}</span>
        <button class="hawk-pagination__item" @click="goToNextPage">
            <right-chevron-svg icon-class="hawk-pagination__right" />
        </button>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import LeftChevronSvg from '../../svg/LeftChevronSvg'
    import RightChevronSvg from '../../svg/RightChevronSvg'

    export default {
        name: 'pager',
        props: [],
        components: {
            LeftChevronSvg,
            RightChevronSvg
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
            onChange: function (e) {
                this.goToPage(e.target.value);
            },
            goToPage: function (page) {
                if (page >= 1 && page <= this.totalPages) {
                    this.$root.dispatchToStore('applyPageNumber', page);
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
