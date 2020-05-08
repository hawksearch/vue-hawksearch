import Vue from 'vue';
import Results from '../components/results/Results.vue';
import store from '../store';
import { mapState } from 'vuex';

const HawkSearchResults = Vue.extend({
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

export default HawkSearchResults;