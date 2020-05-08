<template>
    <li class="hawk-facet-rail__facet-list-item hawkFacet-group">
        <div class="hawkFacet-group__inline">
            <button @click="onValueSelected" class="hawk-facet-rail__facet-btn" >
                <span :class="isSelected ? 'hawk-facet-rail__facet-checkbox hawk-facet-rail__facet-checkbox--checked' : 'hawk-facet-rail__facet-checkbox'" >
                    <template v-if="isSelected">
                        <checkmark-svg class="hawk-facet-rail__facet-checkbox-icon" />
                    </template>
                </span>
                <span :style="isNegated ? '{ textDecoration: \'line-through\' }' : ''" class="hawk-facet-rail__facet-name">
                    {{ itemData.Label }} ({{ itemData.Count }})
                </span>
            </button>
            <button @click="onValueSelected" class="hawk-facet-rail__facet-btn-exclude">
                <template v-if="isNegated">
                    <plus-circle-svg class="hawk-facet-rail__facet-btn-include" />
                    <span class="visually-hidden">Include facet</span>
                </template>
                <template v-else>
                    <dash-circle-svg />
                    <span class="visually-hidden">Exclude facet</span>
                </template>
            </button>
            <button :class="isExpanded ? 'hawk-collapseState' : 'hawk-collapseState collapsed'" aria-expanded="false" @click="toggleExpanded">
            </button>
        </div>
        <div v-if="isExpanded && itemData.children" class="hawk-facet-rail__w-100">
            <ul class="hawkFacet-group-inside">
                <nested-item v-for="item in itemData.children" :key="item.Value" :item-data="item" />
            </ul>
        </div>
    </li>
</template>

<script lang="js">
    import CheckmarkSvg from '../../svg/CheckmarkSvg';
    import PlusCircleSvg from '../../svg/PlusCircleSvg';
    import DashCircleSvg from '../../svg/DashCircleSvg';

    export default {
        name: 'nested-item',
        props: ['itemData'],
        components: {
            CheckmarkSvg,
            PlusCircleSvg,
            DashCircleSvg
        },
        mounted() {

        },
        data() {
            return {
                isExpanded: false,
                isSelected: false,
                isNegated: false
            }
        },
        methods: {
            onValueSelected: function () {
                console.log('Value selected');
            },
            toggleExpanded: function () {
                this.isExpanded = !this.isExpanded;
            }
        },
        computed: {
        }
    }
</script>
<style scoped lang="scss">
</style>
