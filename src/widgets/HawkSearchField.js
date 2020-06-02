import Vue from 'vue';
import store from '../store';
import SearchBox from '../components/search-box/SearchBox';
import i18n from '../i18n';

const HawkSearchField = Vue.extend({
	data: function () {
		return {

		}
	},
	store,
	i18n,
	components: {
		SearchBox
    }
});

export default HawkSearchField;