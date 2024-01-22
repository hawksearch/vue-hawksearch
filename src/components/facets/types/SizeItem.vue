<template>
	<li :key="itemData.Value" :class="{'selected': itemData.Selected}">
        <button @click="selectFacet(itemData)" >
			<div>{{itemData.Label}}</div>
		</button>
	</li>
</template>

<script lang="js">
    export default {
        name: 'size-item',
        props: ['facetData', 'itemData'],
        components: { },
        mounted() { },
        data() {
            return {};
        },
        methods: {
            selectFacet: function (value) {
                value.Selected = !value.Selected;

                this.applyFacets();
            },
            applyFacets: function () {
                this.$root.dispatchToStore('applyFacets', this.facetData);
            }
        },
        computed: { }
    }
</script>
<style scoped lang="scss">
</style>
