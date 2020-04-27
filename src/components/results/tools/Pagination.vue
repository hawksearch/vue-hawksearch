<template lang="html">
    <div class="hawk-pagination">
        <pager />
        <items-per-page />
    </div>
</template>

<script lang="js">
    import Pager from './Pager';
    import ItemsPerPage from './ItemsPerPage';

    export default {
        name: 'pagination',
        props: [],
        components: {
            Pager,
            ItemsPerPage
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

        }
    }


</script>

<style scoped lang="scss">

</style>
