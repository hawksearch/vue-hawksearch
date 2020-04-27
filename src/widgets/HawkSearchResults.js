import Vue from 'vue';
import HawkSearchVue from 'src/HawkSearchVue';
import Results from 'src/components/results/Results';
import store from 'src/store';
import { mapState } from 'vuex';

HawkSearchVue.HawkSearchResults = Vue.extend({
	data: function () {
		return {};
	},
	store,
	components: {
		Results
    },
	computed: {
		...mapState([
			'searchOutput'
		])
	}
});