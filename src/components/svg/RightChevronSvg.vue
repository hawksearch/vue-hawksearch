<template>
    <svg viewBox="0 0 19 32" :class="'icon ' + iconClass" focusable="false" aria-hidden="true">
        <path d="M0.738 4.109c-0.457-0.427-0.742-1.034-0.742-1.707s0.285-1.28 0.741-1.705l0.001-0.001c0.467-0.437 1.097-0.705 1.789-0.705s1.322 0.268 1.79 0.706l-0.002-0.001 14.146 13.598c0.457 0.427 0.742 1.034 0.742 1.707s-0.285 1.279-0.741 1.705l-0.001 0.001-14.142 13.589c-0.468 0.436-1.097 0.704-1.79 0.704s-1.322-0.268-1.791-0.706l0.002 0.001c-0.457-0.427-0.742-1.034-0.742-1.707s0.285-1.279 0.741-1.705l0.001-0.001 11.597-11.883z" />
    </svg>
</template>

<script lang="js">

    export default {
        name: 'right-chevron-svg',
        props: ['iconClass'],
        mounted() {

        },
        data() {
            return {}
        },
        methods: {

        },
        computed: {

        }
    }


</script>

<style scoped lang="scss">

    .right-chevron-svg {
    }
</style>
