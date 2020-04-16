'use strict';

console.log('loading index.js');

import Vue from 'vue';
window.Vue = Vue;

Vue.config.devtools = true;

//if (process.env.NODE_ENV === "development") {
//    Vue.config.devtools = true;
//} else {
//    Vue.config.devtools = false;
//}

import VueResource from 'vue-resource';
Vue.use(VueResource);

import { HawkSearchVues } from "./hawk-search-vues";
window.HawkSearchVues = HawkSearchVues;

import "./widgets/hawk-search-field";
import "./widgets/hawk-search-results";
import "./widgets/hawk-search-facets";