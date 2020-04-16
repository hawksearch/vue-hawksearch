import Vue from 'vue';
import { HawkSearchVues } from "../hawk-search-vues";
import store from '../store';
import { mapState } from 'vuex';

HawkSearchVues.HawkSearchResults = Vue.extend({
	data: function () {
		return {};
	},
	store,
	computed: {
		...mapState([
			'results'
		])
	},
	created: function () {
		console.log("HAWK Search results created")
	}
});