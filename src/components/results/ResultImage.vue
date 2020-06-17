<template>
    <div className="hawk-results__item-image">
        <img :src="imageUrl" />
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'result-image',
        props: {
            imagePath: {
                default: null
            }
        },
        mounted() {

        },
        data() {
            return {

            }
        },
        methods: {

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
