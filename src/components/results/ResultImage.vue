<template>
    <div class="hawk-results__item-image">
        <img :src="imageUrl"  draggable="false"/>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'result-image',
        props: {
            imagePath: {
                default: null
            }
        },
        computed: {
            imageUrl: function () {
                return this.imagePath;
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
