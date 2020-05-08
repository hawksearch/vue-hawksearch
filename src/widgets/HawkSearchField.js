import Vue from 'vue';
import store from '../store';
import SearchBox from '../components/search-box/SearchBox';

const HawkSearchField = Vue.extend({
	data: function () {
		return {

		}
	},
	store,
	components: {
		SearchBox
    },
	methods: {

	}
});

export default HawkSearchField;