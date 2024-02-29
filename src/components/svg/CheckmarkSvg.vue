<template>
    <svg viewBox="0 0 32 32" :class="'icon ' + iconClass" focusable="false" aria-hidden="true">
        <path d="M27 4l-15 15-7-7-5 5 12 12 20-20z" />
    </svg>
</template>

<script>
    export default {
        name: 'checkmark-svg',
        props: ['iconClass']
    }
</script>

<style scoped lang="scss">
</style>
