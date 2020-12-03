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

<script lang="js">
    import { mapState } from 'vuex';

    export default {
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
        mounted() {
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
    .custom-component-select {
        position: relative;
        width: 100%;
        text-align: left;
        outline: none;
        height: 32px;
        line-height: 32px;
    }

    .custom-component-select .selected {
        border-radius: 6px;
        border: 1px solid #ccc;
        padding-left: 1em;
        cursor: pointer;
        user-select: none;
    }

    .custom-component-select .selected.open {
        border: 1px solid #ccc;
        border-radius: 6px 6px 0px 0px;
    }

    .custom-component-select .selected:after {
        position: absolute;
        content: "";
        top: 16px;
        right: 1em;
        width: 0;
        height: 0;
        border: 5px solid transparent;
        border-color: black transparent transparent transparent;
    }

    .custom-component-select .items {
        border-radius: 0px 0px 6px 6px;
        overflow: hidden;
        border-right: 1px solid #ccc;
        border-left: 1px solid #ccc;
        border-bottom: 1px solid #ccc;
        position: absolute;
        background-color: white;
        left: 0;
        right: 0;
        z-index: 1;
    }

    .custom-component-select .items div {
        padding-left: 1em;
        cursor: pointer;
        user-select: none;
    }

    .custom-component-select .items div:hover {
        color:white;
        background-color: #007bff;
    }

    .selectHide {
        display: none;
    }
</style>
