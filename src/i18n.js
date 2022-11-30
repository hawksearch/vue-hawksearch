import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const messages = {
    en: {
        "response_error_generic": "An error occurred while searching for your results. Please contact the site administrator."
    }
};

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    messages, // set locale messages
})

export const getI18n = (i18n = {}) => {
    const locale = i18n.locale || 'en';
    const messages = i18n.messages || messages;
    return new VueI18n({
        locale, // set locale
        messages, // set locale messages
    })
}

export default i18n;
