import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const messages = {
    en: {
        "response_error_generic": "An error occurred while searching for your results. Please contact the site administrator.",
        "Narrow Results": "Filter By"
    }
};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
})

export default i18n;
