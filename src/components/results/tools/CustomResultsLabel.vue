<template>
    <span>
        <template v-if="getResponseField(resultsField)">
            <slot name="before"></slot>
            <span>{{ getResponseField(resultsField) }}</span>
            <slot name="after"></slot>
        </template>
        <template v-else>
            <slot></slot>
        </template>
    </span>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        name: 'custom-results-label',
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
