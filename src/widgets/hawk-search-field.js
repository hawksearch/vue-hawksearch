import Vue from 'vue';
import { HawkSearchVues } from "../hawk-search-vues";
import store from '../store';

HawkSearchVues.HawkSearchField = Vue.extend({
	data: function () {
		return {
			keyword: null
		}
	},
	store,
	created: function () {
		console.log("HAWK Search field created")
	},
	methods: {
		search: function () {
			console.log('search');
			this.$store.dispatch('fetchResults', { keyword: this.keyword });
		}
	}
});