import Vue from 'vue';
import { HawkSearchVues } from "../hawk-search-vues";
import store from '../store';

HawkSearchVues.HawkSearchFacets = Vue.extend({
	store,
	created: function () {
		console.log("HAWK Search facets created")
	}
});