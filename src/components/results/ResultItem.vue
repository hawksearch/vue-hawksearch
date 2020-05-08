<template>
    <div class="hawk-results__item">
        <result-image :imagePath="getField('image')"></result-image>

        <div class="hawk-results__item-name">
            <span>{{ this.getField('itemname') }}</span>
        </div>
    </div>
</template>

<script>
    import ResultImage from './ResultImage';

    export default {
        name: "ResultItem",
        data: function () {
            return {}
        },
        components: {
            ResultImage
        },
        props: {
            result: {
                default: null
            }
        },
        methods: {
            getField: function (fieldName) {
                if (this.result &&
                    this.result.Document &&
                    this.result.Document[fieldName] &&
                    this.result.Document[fieldName].length) {

                    return this.result.Document[fieldName][0];
                }
            }
        }
    };
</script>
