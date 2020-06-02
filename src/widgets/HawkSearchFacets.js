import Vue from 'vue';
import store from '../store';
import FacetList from '../components/facets/FacetList.vue';
import i18n from '../i18n';

const HawkSearchFacets = Vue.extend({
    store,
    i18n,
    components: {
        FacetList
    }
});

export default HawkSearchFacets;