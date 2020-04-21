import Vue from 'vue';
import HawkSearchVue from '../HawkSearchVue';
import ResultItem from '../components/ResultItem';
import store from '../store';
import { mapState } from 'vuex';

HawkSearchVue.HawkSearchResults = Vue.extend({
	data: function () {
		return {};
	},
	store,
	components: {
		ResultItem
    },
	computed: {
		...mapState([
			'results'
		])
	}
});