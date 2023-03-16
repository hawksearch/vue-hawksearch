<template>
    <svg viewBox="0 0 20 20" :class="'icon ' + iconClass" focusable="false" aria-hidden="true">
        <path d="M11 9v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM10 20c-5.523 0-10-4.477-10-10s4.477-10 10-10v0c5.523 0 10 4.477 10 10s-4.477 10-10 10v0z" />
    </svg>
</template>

<script lang="js">

    export default {
        name: 'plus-circle-svg',
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
</style>
