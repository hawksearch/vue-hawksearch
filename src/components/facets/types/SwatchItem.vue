<template>
    <li :class="listItemClass">
        <button @click="selectFacet" class="hawk-facet-rail__facet-btn hawk-styleSwatch">
            <span class="hawk-selectionInner">
                <template v-if="item.Color">
                    <span class="hawk-swatchColor" :style="colorStyle" :title="item.Value" />
                </template>
                <template v-else>
                    <img :src="url" :alt="item.Value" />
                </template>
            </span>
        </button>
        <button class="hawk-negativeIcon">
            <i class="hawkIcon-blocked" @click="negateFacet" />
        </button>
    </li>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'swatch-item',
    props: ['item'],
    emits: ['selectFacetValue', 'negateFacetValue'],
    methods: {
        selectFacet: function () {
            this.$emit('selectFacetValue', this.item);
        },
        negateFacet: function () {
            this.$emit('negateFacetValue', this.item);
        }
    },
    computed: {
        listItemClass: function () {
            let classList = ['hawk-facet-rail__facet-list-item'];
            if (this.item.Selected) {
                classList.push('hawkFacet-active');
            }
            if (this.item.Negated) {
                classList.push('hawkFacet-negative');
            }

            return classList.join(' ');
        },
        colorStyle: function () {
            return 'background: ' + this.item.Color;
        },
        url: function () {
            return this.config.dashboardUrl + (!this.item.AssetUrl ? this.item.AssetName : this.item.AssetUrl);
        },
        ...mapGetters(['config']),
    }
}
</script>

<style scoped lang="scss">

</style>
