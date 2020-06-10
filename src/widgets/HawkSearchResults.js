import Vue from 'vue';
import Results from '../components/results/Results.vue';
import store from '../store';
import { mapState } from 'vuex';
import i18n from '../i18n';

const HawksearchResults = Vue.extend({
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
			'searchOutput',
			'pendingSearch'
		])
	},
	watch: {
		searchOutput: function (n, o) {
			this.$emit('resultsupdate', n);
		},
		pendingSearch: function (n, o) {
			this.$emit('searchupdate', n);
		}
    }
});

export default HawksearchResults;