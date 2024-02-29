<template>
    <svg viewBox="0 0 32 32" :class="'icon ' + iconClass" focusable="false" aria-hidden="true">
        <path d="M0 13v6c0 0.552 0.448 1 1 1h30c0.552 0 1-0.448 1-1v-6c0-0.552-0.448-1-1-1h-30c-0.552 0-1 0.448-1 1z" />
    </svg>
</template>

<script>
    export default {
        name: 'minus-svg',
        props: ['iconClass']
    }
</script>

<style scoped lang="scss">
</style>
