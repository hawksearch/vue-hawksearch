<template>
  <div
    v-if="!waitingForInitialSearch"
    class="hawk-facet-rail"
    :class="{ 'hawk-facet-rail__sticky': isNavSticky && isInResponsiveMode }"
    @scroll="onScroll"
  >
    <div class="hawk-facet-rail__heading" @click="toggleFacetMobileMenu">
      {{ $t("Filter By") }}
    </div>

    <div
      class="hawk-facet-rail__facet-list"
      :class="{
        'hawk-facet-rail__facet-list-mobile':
          isMobileMenuActive && isInResponsiveMode,
      }"
    >
      <template v-if="facets && facets.length">
        <facet
          v-for="facetData in facets"
          :key="facetData.FacetId"
          :facet-data="facetData"
          @expand="onExpand"
        ></facet>
      </template>
      <template v-else-if="loadingResults">
        <placeholder-facet v-for="index in 4" :key="index"></placeholder-facet>
      </template>
      <template v-else>
        <div class="hawk-facet-rail_empty"></div>
      </template>
    </div>
  </div>
</template>

<script lang="js">
    import { mapState } from 'vuex';
    import Facet from './Facet';
    import PlaceholderFacet from './PlaceholderFacet';

    export default {
        name: 'facet-list',
        props: [],
        components: {
            Facet,
            PlaceholderFacet
        },
        mounted() {
            this.isInResponsiveMode = this.mobileMaxWidth > window.innerWidth;
        },
        data() {
            return {
                 isMobileMenuActive: false,
                 isInResponsiveMode: false,
                 mobileMaxWidth: 768,
                 isNavSticky: false
            }
        },
        methods: {
            onExpand: function (facet) {
                if (this.$root.config.facetConfig.hasOwnProperty('_expand') && this.$root.config.facetConfig['_expand'] == 'single') {
                    this.$children.forEach(f => {
                        if (f != facet && f.hasOwnProperty('isCollapsed')) {
                            f.isCollapsed = true;
                        }
                    })
                }
            },
            collapseAll: function () {
                this.$children.forEach(f => {
                    if (f.hasOwnProperty('isCollapsed')) {
                        f.isCollapsed = true;
                    }
                })
            },
            expandAll: function () {
                this.$children.forEach(f => {
                    if (f.hasOwnProperty('isCollapsed')) {
                        f.isCollapsed = false;
                    }
                })
            },
            toggleFacetMobileMenu: function (e) {  
                this.isMobileMenuActive = !this.isMobileMenuActive;
            },
            isResponsiveMode:function (e) {
                let displaySize = window.innerWidth;
                if (this.mobileMaxWidth > displaySize){
                    this.isInResponsiveMode = true;
                }else{
                    this.isInResponsiveMode = false;
                }
            },
            onScroll: function (e) {
                let facetsNav = this.$el;
                let facetsNavDOMRect = facetsNav.getBoundingClientRect();
                let facetNavCurrentPosition = facetsNavDOMRect.y;
                let windowPosition = window.pageYOffset
                
                if (facetNavCurrentPosition <= windowPosition) {
                   this.isNavSticky = true;
                }else{
                    this.isNavSticky = false;
                }
            }
        },
        computed: {
            ...mapState([
                'extendedSearchParams',
                'waitingForInitialSearch',
                'loadingResults'
            ]),
            facets: function () {
                return (this.extendedSearchParams && this.extendedSearchParams.Facets) ? this.extendedSearchParams.Facets.filter(facet => facet.FieldType != 'tab') : null;
            }
        },
        created() {
            window.addEventListener("resize", this.isResponsiveMode);
            window.addEventListener('scroll', this.onScroll)
        },
        destroyed() {
            window.removeEventListener("resize", this.isResponsiveMode);
            window.removeEventListener('scroll', this.onScroll)
        }
    }
</script>

<style scoped lang="scss">
</style>
