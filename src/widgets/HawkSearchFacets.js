import Vue from 'vue';
import HawkSearchVue from "../HawkSearchVue";
import store from '../store';
import FacetList from 'src/components/facets/FacetList';

HawkSearchVue.HawkSearchFacets = Vue.extend({
	store,
    components: {
        FacetList
    }
});