import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

// Ready translated locale messages
//const messages = {
//    en: {
//        "No Results": "No results (en)"
//    }
//}
const messages = {};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
})

// the translations
// TODO: move them in a JSON file and import them
//const resources = {};

//i18n.use(initReactI18next) // passes i18n down to react-i18next
//	.init({
//		interpolation: {
//			escapeValue: false, // react already safes from xss
//		},
//		keySeparator: false, // we do not use keys in form messages.welcome
//		lng: 'en',
//		resources,
//	});

export default i18n;
