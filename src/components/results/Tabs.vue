<template>
    <div v-if="facet" class="hawk-preview__results_tabs">
        <ul class="nav nav-tabs">
            <li v-for="tab in tabs" :key="tab.Value" :class="tabClasses(tab)" @click="onClick(tab)">
                <a class="nav-link">{{ tab.Label }}</a>
            </li>
        </ul>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex';

    export default {
        name: 'tabs',
        props: [],
        mounted() {

        },
        data() {
            return {
                tabs: []
            }
        },
        methods: {
            tabClasses: function (tab) {
                var tabClass = 'nav-item';

                if (tab.Selected) {
                    tabClass += ' active';
                }

                return tabClass;
            },
            onClick: function (tab) {
                if (!tab.Selected) {
                    var facetData = Object.assign({}, this.facet);

                    facetData.Values = facetData.Values.map(item => {
                        if (item.Value == tab.Value) {
                            item.Selected = true;
                        }
                        else {
                            item.Selected = false;
                        }

                        return item;
                    });

                    this.$root.$store.dispatch('applyFacets', facetData);
                }
            }
        },
        computed: {
            ...mapState([
                'searchOutput'
            ]),
            ...mapGetters([
                'tabSelection'
            ]),
            facet: function () {
                return this.searchOutput ? this.searchOutput.Facets.find(facet => facet.FieldType == 'tab') : null;
            }
        },
        watch: {
            facet: function (n, o) {
                if (n) {
                    var tabs = n.Values;
                    this.tabs = tabs;
                }
            }
        }
    }

</script>

<style scoped lang="scss">
</style>
