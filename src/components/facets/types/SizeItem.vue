<template>
	<li @click="selectFacet(itemData)" :key="itemData.Value" :class="{'selected': itemData.Selected}">
		<div>{{htmlEntityDecode(itemData.Label)}}</div>
	</li>
</template>

<script>
    export default {
        name: 'size-item',
        props: ['facetData', 'itemData'],
        methods: {
            selectFacet: function (value) {
                value.Selected = !value.Selected;
                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.dispatchToStore('applyFacets', this.facetData);
            },
            htmlEntityDecode: function(value) {
                var decoded = new DOMParser().parseFromString(value, "text/html");
                return decoded.documentElement.textContent;
            }
        }
    }
</script>
<style scoped lang="scss">
</style>
