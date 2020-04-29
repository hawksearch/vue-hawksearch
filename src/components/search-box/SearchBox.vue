<template lang="html">
    <div class="hawk__searchBox">
        <div class="hawk__searchBox__searchInput">
            <input type="text" v-model="keyword" @keydown="onInput" />
        </div>
    </div>
</template>

<script lang="js">

    export default {
        name: 'search-box',
        props: [],
        mounted() {

        },
        data() {
            return {
                keyword: null
            }
        },
        methods: {
            onInput: function (e) {
                if (e.key == 'Enter') {
                    this.$root.$store.dispatch('fetchResults', { Keyword: this.keyword });
                }
            }
        },
        computed: {

        }
    }

</script>

<style scoped lang="scss">

</style>
