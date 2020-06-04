<template>
    <div class="hawk-results__item-placeholder" :style="'height: ' + getHeight() + 'px'">
        <div v-if="showSpinner" class="hawk-placeholder__image">{{ $t('Loading') }}...</div>
    </div>
</template>

<script>

    export default {
        name: 'placeholder-image',
        props: ['showSpinner'],
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {
            getHeight: function () {
                return Math.round(Math.random() * (175 - 125) + 125);
            }
        },
        computed: {

        }
    }


</script>

<style scoped lang="scss">

</style>
