<template lang="html">
    <div class="hawk-pagination__controls">
        <button class="hawk-pagination__item" @click="goToPreviousPage">
            <left-chevron-svg icon-class="hawk-pagination__left" />
            <span class="visually-hidden">Previous page</span>
        </button>
        <input type="number"
               :value="getInputValue()"
               @click="onChange"
               @keydown="onKeyDown"
               :class="hasError ? 'hawk-pagination__input error' : 'hawk-pagination__input'" />
        <span class="hawk-pagination__total-text"> of {{ totalPages }}</span>
        <button class="hawk-pagination__item" @click="goToNextPage">
            <right-chevron-svg icon-class="hawk-pagination__right" />
            <span class="visually-hidden">Next page</span>
        </button>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import LeftChevronSvg from 'src/components/svg/LeftChevronSVG'
    import RightChevronSvg from 'src/components/svg/RightChevronSVG'

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
                console.log('Previous page');
            },
            goToNextPage: function () {
                console.log('Next page');
            },
            getInputValue: function () {
                return 1;
            },
            onChange: function () {
                console.log('Change');
            },
            onKeyDown: function () {
                console.log('Key down');
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            pagination: function () {
                return this.searchOutput.Pagination;
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
</style>
