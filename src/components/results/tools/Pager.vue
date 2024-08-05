<template>
    <div class="hawk-pagination__controls">
        <template v-if="isLink">
            <a class="hawk-pagination__item" :href="previousPageLink">
                <left-chevron-svg icon-class="hawk-pagination__left" />
            </a>
        </template>
        <template v-else>
            <button class="hawk-pagination__item" @click="goToPreviousPage">
                <left-chevron-svg icon-class="hawk-pagination__left" />
            </button>
        </template>
        <input type="number" :value="page" @change="onChange" :class="hasError ? 'hawk-pagination__input error' : 'hawk-pagination__input'" min="1" :max="totalPages" />
        <span class="hawk-pagination__total-text"><span class="break"></span> of {{ totalPages }}</span>
        <template v-if="isLink">
            <a class="hawk-pagination__item" :href="nextPageLink">
                <right-chevron-svg icon-class="hawk-pagination__right" />
            </a>
        </template>
        <template v-else>
            <button class="hawk-pagination__item" @click="goToNextPage">
                <right-chevron-svg icon-class="hawk-pagination__right" />
            </button>
        </template>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import LeftChevronSvg from '../../svg/LeftChevronSvg'
    import RightChevronSvg from '../../svg/RightChevronSvg'

    export default {
        name: 'pager',
        components: {
            LeftChevronSvg,
            RightChevronSvg
        },
        mounted() {
            this.nextPageLink = this.goToNextPageLink();
            this.previousPageLink = this.goToPreviousPageLink();

            this.$root.$on('urlUpdated', () => {
                this.nextPageLink = this.goToNextPageLink();
                this.previousPageLink = this.goToPreviousPageLink();
            })
        },
        data() {
            return {
                hasError: false,
                nextPageLink: '',
                previousPageLink: ''
            }
        },
        methods: {
            goToPreviousPage: function (event) {
                if (this.page > 1) {
                    this.goToPage(parseInt(this.page, 10) - 1);
                    this.blurEventTarget(event);
                }
            },
            goToNextPage: function (event) {
                if (this.page < this.totalPages) {
                    this.goToPage(parseInt(this.page, 10) + 1);
                    this.blurEventTarget(event);
                }
            },
            blurEventTarget: function (event) {
                if (event && event.target) {
                    const closestPaginationItem = event.target.closest('.hawk-pagination__item');
                    if (closestPaginationItem) {
                        closestPaginationItem.blur();
                        closestPaginationItem.classList.add("active");

                        setTimeout(() => {
                            closestPaginationItem.classList.remove("active");
                        }, 500);
                    }
                }
            },
            goToPreviousPageLink: function () {
                if (this.page > 1) {
                    var url = new URL(location.href);

                    url.searchParams.set('pg',parseInt(this.page, 10) - 1);

                    return url.toString();
                }
            },
            goToNextPageLink: function () {
                if (this.page < this.totalPages) {
                   var url = new URL(location.href);

                    url.searchParams.set('pg',parseInt(this.page, 10) + 1);

                    return url.toString();
                }
            },
            goToPage: function (page) {
                if (page >= 1 && page <= this.totalPages) {
                    this.$root.dispatchToStore('applyPageNumber', page);
                }
            },
            onChange: function (e) {
                this.goToPage(parseInt(e.target.value, 10));
                this.blurEventTarget(e);
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
            },
            isLink: function () {
                var type = this.$root.config.pagination.type;

                return type == "link";
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
