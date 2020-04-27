import Vue from 'vue';
import HawkSearchVue from "../HawkSearchVue";
import store from 'src/store';
import SearchBox from 'src/components/search-box/SearchBox';

HawkSearchVue.HawkSearchField = Vue.extend({
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