<template>
    <span>{{ getResponseField(resultsField) }}</span>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        props: ['resultsField'],
        data() {
            return {

            };
        },
        methods: {
            
        },
        computed: {
            ...mapGetters([
                'getResponseField'
            ])
        }
    }
</script>

<style scoped lang="scss">
</style>
