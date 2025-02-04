<template>
    <div class="custom-component-select" :tabindex="tabindex" @blur="doBlurSelect">
        <div class="selected" :class="{ open: open }" @click="clickSelectHead">
            {{ selected }}
        </div>
        <div class="items" :class="{ selectHide: !open }">
            <div v-for="(option, i) of options" :key="i" @click="clickSelectOption(option)" >
                {{ option.label }}
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState } from 'vuex';

    export default {
        name: 'custom-select',
        props:{
            options:{
                type: Array,
                required: true
            },
            default: {
                type: String,
                required: false,
                default: null,
            },
            tabindex:{
                type: Number,
                required: false,
                default: 0
            }
        },
        data() {
            return {
                open: false,
                timeout: null,
            };
        },
        beforeDestroy() {
            clearTimeout(this.timeout);
        },
        methods: {
            clickSelectHead: function() {
                clearTimeout(this.timeout);
                this.open = !this.open
            },
            clickSelectOption: function (option) {
                this.$emit('change', { target: { value: option.value } });
                
                this.selected = option;
                this.open = false;
            },
            doBlurSelect: function() {                
                this.timeout = setTimeout(() => {
                    this.open = false
                }, 400);
            }
        },
        computed: {
            selected: function () {
                return this.options.length > 0 && this.default ? this.default : this.options.length[0]
            }
        }
    }
</script>

<style scoped lang="scss">

</style>
