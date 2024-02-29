<template>
    <div class="hawk-results__item-add-to-cart" @click="addToCart">
        <span>Add to Cart</span>
    </div>
</template>

<script>
    export default {
        name: 'AddToCart',
        props: {
            addFn: {
                default: function () { console.warn('Add to cart not available'); },
                type: Function
            },
            addArgs: {
                default: {}
            }
        },
        methods: {
            addToCart: function (e) {
                e.stopPropagation();

                // track
                console.log('track add to cart');

                if (this.addFn && typeof this.addFn == 'function') {
                    (this.addFn)(this.addArgs)
                }
            }
        }
    }
</script>

<style scoped lang="scss">
</style>
