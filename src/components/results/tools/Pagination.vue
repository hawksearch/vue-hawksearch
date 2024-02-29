<template>
    <div class="hawk-pagination">
        <pager />
        <items-per-page />
    </div>
</template>

<script>
    import Pager from './Pager';
    import ItemsPerPage from './ItemsPerPage';

    export default {
        name: 'pagination',
        components: {
            Pager,
            ItemsPerPage
        }
    }
</script>

<style scoped lang="scss">

</style>
