import Vue from 'vue';
import HawkSearchVue from "../HawkSearchVue";
import store from '../store';

HawkSearchVue.HawkSearchField = Vue.extend({
	data: function () {
		return {
			keyword: null
		}
	},
	store,
	methods: {
		search: function () {
			console.log('search');
			this.$store.dispatch('fetchResults', { keyword: this.keyword });
		}
	}
});