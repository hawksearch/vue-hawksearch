<template>
    <div class="hawk-results__listing">
        <template v-for="result in results">
            <result-item :result="result"></result-item>
        </template>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex'
    import ResultItem from './ResultItem'

    export default {
        name: 'result-listing',
        props: [],
        components: {
            ResultItem
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            results: function () {
                return this.searchOutput.Results
            }
        }
    }

</script>

<style scoped lang="scss">

</style>
