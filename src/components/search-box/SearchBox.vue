<template>
    <div class="hawk__searchBox">
        <div class="hawk__searchBox__searchInput">
            <input type="text" v-model="keyword" :placeholder="placeholder" @input="onInput" @keydown="onKeyDown" @blur="onBlur"/>
        </div>
        <search-suggestions :loading="loading"></search-suggestions>
    </div>
</template>

<script>
    import HawkSearchVue from "../../HawkSearchVue";
    import SearchSuggestions from "./SearchSuggestions";

    export default {
        name: 'search-box',
        props: [],
        components: {
            SearchSuggestions
        },
        mounted() {

        },
        data() {
            return {
                keyword: null,
                placeholder: 'Enter search term',
                suggestionDelay: null,
                loading: false
            }
        },
        methods: {
            onKeyDown: function (e) {
                if (e.key == 'Enter') {
                    this.loading = false;
                    this.$root.$store.commit('updateSuggestions', null);

                    if (HawkSearchVue.isGlobal()) {
                        HawkSearchVue.redirectSearch(keyword);
                    }
                    else {
                        this.$root.$store.dispatch('fetchResults', { Keyword: this.keyword });
                    }
                }
            },
            onInput: function (e) {
                let keyword = e.target.value;

                clearTimeout(this.suggestionDelay);
                this.loading = true;

                let searchParams = { Keyword: keyword };
                let callback = () => {
                    this.loading = false;
                };

                if (keyword) {
                    this.suggestionDelay = setTimeout(() => {
                        this.$root.$store.dispatch('fetchSuggestions', { searchParams, callback });
                    }, 250);
                }
                else {
                    this.$root.$store.commit('updateSuggestions', null);
                    callback();
                }
            },
            onBlur: function () {
                this.keyword = null;
                this.$root.$store.commit('updateSuggestions', null);
            }
        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">
</style>
