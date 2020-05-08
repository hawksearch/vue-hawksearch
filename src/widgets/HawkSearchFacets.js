import Vue from 'vue';
import store from '../store';
import FacetList from '../components/facets/FacetList.vue';

const HawkSearchFacets = Vue.extend({
	store,
    components: {
        FacetList
    }
});

export default HawkSearchFacets;