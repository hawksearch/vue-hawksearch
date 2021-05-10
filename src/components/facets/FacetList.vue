<template>
  <div
    v-if="!waitingForInitialSearch"
    ref="facetMenu"
    :class="facetRailWrapperClass()"
    :style="stickyNavStyles"
    @scroll="onScroll"
    @focusout="handleFocusOut"
    tabindex="0">

    <div class="hawk-facet-rail__heading" @click="toggleFacetMobileMenu">
      {{ $t("Filter By") }}
    </div>

    <div :class="facetListWrapperClass()">
      <template v-if="facets && facets.length">
        <facet
          v-for="facetData in facets"
          :key="facetData.FacetId"
          :facet-data="facetData"
          :facet-settings="facetSettingsConfig"
          :facets="facetsElements"
          @expand="expandFacet"
          @collapse="collapseFacet"
          @collapseAllExceptCurrent="collapseAllExceptCurrent($event)"
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
            this.facetSettingsConfig = this.$root.config.facetConfig;
        },
        data() {
            return {
                 isMobileMenuActive: false,
                 isInResponsiveMode: false,
                 mobileMaxWidth: 768,
                 isNavSticky: false,
                 stickyNavStyles:{},
                 facetSettingsConfig: null
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
                        this.collapseFacet(f);
                    }
                    sessionStorage.setItem(f.getStorageName(), f.isCollapsed);
                })
            },
            collapseAllExceptCurrent:function (facet) {
                this.$children.forEach(f => {
                    if (f.hasOwnProperty('isCollapsed') && f != facet) {
                        this.collapseFacet(f);
                    }
                    sessionStorage.setItem(f.getStorageName(), f.isCollapsed);
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
                this.$nextTick(() => {
                    this.$root.$emit('toggleFacetMenu',this.isMobileMenuActive);
                })
            },
            isResponsiveMode:function (e) {
                let displaySize = window.innerWidth;
                if (this.mobileMaxWidth > displaySize){
                    this.isInResponsiveMode = true;
                    this.updateNavigationWidth(e);
                }else{
                    this.isInResponsiveMode = false;
                    this.stickyNavStyles = {}
                }
            },
            onScroll: function (e) {
                let facetsNav = this.$el;
                let facetsNavDOMRect = facetsNav.getBoundingClientRect() || null;
                let facetNavCurrentPosition = facetsNavDOMRect.y || facetsNavDOMRect.top;
                let windowPosition = window.pageYOffset;

                if (facetNavCurrentPosition <= windowPosition) {
                   this.isNavSticky = true;
                   if (this.isInResponsiveMode)
                       this.updateNavigationWidth(e);
                   
                }else{
                    this.isNavSticky = false;
                    this.stickyNavStyles = {}
                }
            },
            facetRailWrapperClass: function () {
                let wrapperClasses = ["hawk-facet-rail"];

                if (this.isNavSticky && this.isInResponsiveMode) {
                    wrapperClasses.push("hawk-facet-rail__sticky");
                }

                return wrapperClasses.join(' ');
            },
            facetListWrapperClass: function () {
                let wrapperClasses = ["hawk-facet-rail__facet-list", "hawk-facet-rail__facet-list-wpr"];

                if (this.isMobileMenuActive && this.isInResponsiveMode) {
                    wrapperClasses.push("hawk-facet-rail__facet-list-mobile");
                }

                return wrapperClasses.join(' ');
            },
            updateNavigationWidth: function (e) {
                let facetsNavDOMRect = this.$el.getBoundingClientRect();
                let facetNavOffset = facetsNavDOMRect.x || facetsNavDOMRect.left;
                let currentWidth = window.innerWidth - (facetNavOffset*2 + 2);
                if (this.isNavSticky) {
                    this.stickyNavStyles = { width: currentWidth + 'px' };
                } else {
                    this.stickyNavStyles = {};
                }
            },
            handleFocusOut:function () {
                if (this.facetSettingsConfig && this.facetSettingsConfig.collapseOnDefocus) {
                    this.collapseAll();
                }
            },
            collapseFacet: function (element) {
                element.isCollapsed = true;
                sessionStorage.setItem(element.getStorageName(), element.isCollapsed)
            },
            expandFacet: function(element){
                element.isCollapsed = false;
                sessionStorage.setItem(element.getStorageName(), element.isCollapsed)
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
            },
            facetsElements: function () {
                return this.$children;
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
