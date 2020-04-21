<template>
    <div>
        <div>{{ title }}</div>
        <div>{{ content }}</div>
    </div>
</template>

<script>
    export default {
        name: "ResultItem",
        data: function () {
            return {}
        },
        props: {
            result: {
                default: null
            }
        },
        computed: {
            title: function () {
                return this.result.Document.title[0];
            },
            content: function () {
                return this.result.Document.content[0];
            }
        }
    };
</script>
