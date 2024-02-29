<template>
    <div>
        <div v-for="type of listingTypes">
            <span @click="(e) => {changeToType(type)}">{{type}}</span>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex'
    export default {
        name: 'listing-type',
        props: ['listingTypes'],
        methods: {
            changeToType: function (type) {
                this.$emit('typeChanged', type);
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
