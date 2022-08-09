<template>
    <div class="hawk-facet-rail__facet-values">
        <div class="hawk-facet-rail__facet-values-link">
            <ul class="hawk-facet-rail__facet-list">
                <li v-for="value in facetData.Values" :key="value.Value" class="hawk-facet-rail__facet-list-item">
                    <button  @click="selectFacet(value)" class="hawk-facet-rail__facet-btn" >
                        <span class="hawk-facet-rail__facet-name">
                            {{value.Label}} ({{value.Count}})
                        </span>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<script lang="js">

    export default {
        name: 'facet-link',
        props: ['facetData'],
        mounted() {
        },
        data() {
            return {
            }
        },
        methods: {
            selectFacet: function (value) {
                value.Selected = !value.Selected;
                this.$root.dispatchToStore('applyFacets', this.facetData).then(() => {
                    var widget = this.$root;

                    HawksearchVue.applyTabSelection(widget);
                });
            }
        },
        computed: {

        }
    }


</script>

<style scoped lang="scss">
</style>
