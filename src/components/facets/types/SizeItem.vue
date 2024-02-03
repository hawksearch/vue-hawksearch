<template>
	<li :key="itemData.Value" :class="{'selected': itemData.Selected}">
        <button @click="selectFacet(itemData)" >
			<div>{{htmlEntityDecode(itemData.Label)}}</div>
		</button>
	</li>
</template>

<script lang="js">
    export default {
        name: 'size-item',
        props: ['facetData', 'itemData'],
        components: { },
        mounted() { },
        data() { },
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
        },
        computed: { }
    }
</script>
<style scoped lang="scss">
</style>
