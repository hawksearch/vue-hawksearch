import Vue from 'vue';
import Results from '../components/results/Results.vue';
import store from '../store';
import { mapState } from 'vuex';
import i18n from '../i18n';

const HawkSearchResults = Vue.extend({
	data: function () {
		return {};
	},
	store,
	i18n,
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