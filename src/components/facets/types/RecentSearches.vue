<template>
    <div class="hawk-facet-rail__facet-values">
        <div
            v-if="recentSearch && Object.keys(recentSearch).length"
            class="hawk-facet-rail__facet-values-recent-search"
        >
            <div
                v-for="item in Object.keys(recentSearch)"
                v-bind:key="item"
                @click="() => setKeyword(item)"
            >
                {{ decodeURIComponent(item) }} ({{ recentSearch[item] }})
            </div>
            <button @click="clearRecentSearch">Clear All</button>
        </div>
        <div v-else>Recent searches are empty</div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import {
    deleteCookie,
} from "../../../CookieHandler";

export default {
    name: "recent-searches",
    props: ["facetData"],
    mounted() {
        this.updateRecentSearch();
    },
    methods: {
        ...mapActions(['updateRecentSearch']),
        search: function (keyword) {
            const options = {};

            let searchBoxConfig = this.config.searchBoxConfig;
            let searchPage = this.searchPage || location.pathname;
            this.updateRecentSearch(keyword);

            if (
                searchBoxConfig.redirectToCurrentPage ||
                (this.searchPage && this.searchPage != location.pathname)
            ) {
                HawksearchVue.redirectSearch(
                    keyword,
                    this.$root,
                    searchPage,
                    options.ignoreRedirectRules
                );
            } else if (keyword || searchBoxConfig.reloadOnEmpty) {
                this.$root
                    .dispatchToStore("fetchResults", {
                        Keyword: keyword || "",
                        FacetSelections: {},
                        PageNo: 1,
                    })
                    .then(() => {
                        var widget = this.$root;
                        HawksearchVue.applyTabSelection(widget);
                    });
            }
        },
        setKeyword: function (keyword) {
            this.search(keyword);
        },
        clearRecentSearch: function () {
            deleteCookie(this.facetData.FacetType);
            this.updateRecentSearch();
        },
    },
    computed: {
        ...mapState(["recentSearch"]),
        ...mapGetters(['config']),
    }
}
</script>

<style scoped lang="scss">
</style>
