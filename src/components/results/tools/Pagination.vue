<template>
    <div class="hawk-pagination">
        <pager />
        <items-per-page />
    </div>
</template>

<script>
    import Pager from './Pager.vue';
    import ItemsPerPage from './ItemsPerPage.vue';

    export default {
        name: 'pagination',
        components: {
            Pager,
            ItemsPerPage
        },
        props: {
            templateOverride: {
                type: String,
                default: null
            }
        }
    }
</script>

<style scoped lang="scss">

</style>
