<template>
    <div>
        <div v-for="type of listingTypes">
            <span @click="(e) => {changeToType(type)}">{{type}}</span>
        </div>
    </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';

    export default {
        name: 'listing-type',
        props: ['listingTypes'],
        mounted() {

        },
        data() {
        },
        methods: {
            changeToType: function (type) {
                this.$emit('typeChanged', type);
            }
        }
    }


</script>

<style scoped lang="scss">
</style>
